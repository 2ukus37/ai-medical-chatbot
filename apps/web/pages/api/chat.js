import { buildMedicalContext, assessFileUrgency, analyzeUploadedFile } from '../../lib/medicalFileAnalyzer'
import { assessTriageTier, generateRecommendations, getAppointmentInfo } from '../../lib/triageEngine'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL_PRIMARY = 'openrouter/healer-alpha'
const MODEL_FALLBACK = 'openrouter/hunter-alpha'

const SYSTEM_PROMPT = `You are HealthGuard AI, an expert medical assistant with deep clinical knowledge.

Your role:
- Provide thorough, evidence-based medical guidance
- Analyze symptoms and suggest possible conditions (differential diagnosis)
- Interpret uploaded medical files (X-rays, lab reports, ECGs, etc.)
- Recommend appropriate level of care (self-care, GP, urgent care, ER/911)
- Give actionable, specific advice — not vague generalities
- Use clear, plain language the patient can understand
- Structure responses with headers and bullet points for readability

Rules:
- Always end with a brief disclaimer that this is not a substitute for professional care
- If symptoms suggest emergency (chest pain, stroke, severe bleeding, difficulty breathing), lead with "CALL 911 IMMEDIATELY"
- Be direct and specific — patients need real guidance, not hedging
- When analyzing files, describe what you observe and what it may indicate`

global.chatSessions = global.chatSessions || {}
global.chatMessages = global.chatMessages || {}

async function callOpenRouter(apiKey, model, messages) {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'HealthGuard AI',
    },
    body: JSON.stringify({ model, messages, stream: false, max_tokens: 1500, temperature: 0.3 }),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`OpenRouter ${res.status}: ${txt}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

export default async function handler(req, res) {
  if (req.method === 'POST') return handleChat(req, res)
  if (req.method === 'GET') return getHistory(req, res)
  res.status(405).json({ error: 'Method not allowed' })
}

async function handleChat(req, res) {
  const { sessionId, message, files, patientInfo, action } = req.body
  if (!sessionId || !message) return res.status(400).json({ error: 'Missing sessionId or message' })

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'OpenRouter API key not configured' })

  try {
    if (!global.chatSessions[sessionId]) {
      global.chatSessions[sessionId] = { id: sessionId, createdAt: new Date().toISOString(), patientInfo: patientInfo || {}, files: [] }
      global.chatMessages[sessionId] = []
    }

    const session = global.chatSessions[sessionId]

    if (files?.length > 0) {
      session.files.push(...files)
      const { urgency } = assessFileUrgency(files)
      session.urgency = urgency
      session.medicalContext = buildMedicalContext(session.files, patientInfo)
    }

    global.chatMessages[sessionId].push({
      id: `${sessionId}-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      files: files?.map(f => ({ id: f.id, name: f.originalName })) || [],
    })

    // Build context
    const contextParts = []
    if (patientInfo?.name) contextParts.push(`Patient: ${patientInfo.name}, Age: ${patientInfo.age || 'unknown'}`)
    if (patientInfo?.symptoms) contextParts.push(`Chief complaint: ${patientInfo.symptoms} (severity ${patientInfo.severity || '?'}/10)`)
    if (patientInfo?.medications) contextParts.push(`Medications: ${patientInfo.medications}`)
    if (patientInfo?.allergies) contextParts.push(`Allergies: ${patientInfo.allergies}`)

    let fileAnalysis = []
    if (session.files.length > 0) {
      fileAnalysis = session.files.map(f => analyzeUploadedFile(f))
      contextParts.push(`\nUploaded medical files:`)
      fileAnalysis.forEach(f => contextParts.push(`- ${f.fileName} (${f.fileType}): ${f.findings.join('; ')}`))
    }

    const modelMessages = [{ role: 'system', content: SYSTEM_PROMPT }]
    if (contextParts.length > 0) {
      modelMessages.push({ role: 'system', content: `Clinical context:\n${contextParts.join('\n')}` })
    }
    const history = global.chatMessages[sessionId]
    for (const msg of history.slice(-20, -1)) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        modelMessages.push({ role: msg.role, content: msg.content })
      }
    }
    modelMessages.push({ role: 'user', content: message })

    // Call with fallback
    let responseContent = ''
    try {
      responseContent = await callOpenRouter(apiKey, MODEL_PRIMARY, modelMessages)
    } catch (e) {
      console.warn('Primary model failed, trying fallback:', e.message)
      try {
        responseContent = await callOpenRouter(apiKey, MODEL_FALLBACK, modelMessages)
      } catch (e2) {
        console.error('Fallback also failed:', e2.message)
        responseContent = `I'm having trouble connecting to the AI service right now. Please try again in a moment.\n\nIf this is urgent, please call your healthcare provider or 911 for emergencies.`
      }
    }

    // Triage data
    let diagnosticData = null
    if (action === 'diagnose' || session.files.length > 0) {
      const symptoms = (patientInfo?.symptoms || message).split(',').map(s => s.trim())
      const severity = parseInt(patientInfo?.severity) || 5
      const assessment = assessTriageTier(symptoms, severity)
      diagnosticData = {
        assessment,
        recommendations: generateRecommendations(assessment),
        appointmentInfo: getAppointmentInfo(assessment),
        fileAnalysis,
      }
    }

    const assistantMessage = {
      id: `${sessionId}-${Date.now()}-response`,
      role: 'assistant',
      content: responseContent,
      timestamp: new Date().toISOString(),
      diagnosticData,
    }

    global.chatMessages[sessionId].push(assistantMessage)

    res.status(200).json({
      sessionId,
      message: assistantMessage,
      session: { id: session.id, fileCount: session.files.length, urgency: session.urgency || 'ROUTINE', messageCount: global.chatMessages[sessionId].length },
    })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ error: error.message || 'Chat processing failed' })
  }
}

function getHistory(req, res) {
  const { sessionId } = req.query
  if (!sessionId || !global.chatMessages[sessionId]) return res.status(404).json({ error: 'Session not found' })
  res.status(200).json({ session: global.chatSessions[sessionId], messages: global.chatMessages[sessionId], totalMessages: global.chatMessages[sessionId].length })
}
