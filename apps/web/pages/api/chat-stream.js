import { analyzeUploadedFile } from '../../lib/medicalFileAnalyzer'
import { assessTriageTier, generateRecommendations, getAppointmentInfo } from '../../lib/triageEngine'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL_PRIMARY = 'openrouter/healer-alpha'
const MODEL_FALLBACK = 'openrouter/hunter-alpha'

const SYSTEM_PROMPT = `You are HealthGuard AI, an expert medical assistant with deep clinical knowledge and vision capabilities.

Your role:
- Provide thorough, evidence-based medical guidance
- Analyze symptoms and suggest possible conditions (differential diagnosis)
- When given medical images (X-rays, CT scans, MRIs, ECGs, lab reports, etc.), DIRECTLY analyze and describe what you observe in the image — do NOT say you cannot see it
- Interpret findings from uploaded medical files with clinical depth
- Recommend appropriate level of care (self-care, GP, urgent care, ER/911)
- Give actionable, specific advice — not vague generalities
- Use clear, plain language the patient can understand
- Structure responses with headers and bullet points for readability

Image Analysis Rules:
- When an image is provided, ALWAYS attempt a direct visual analysis — describe what you see
- For X-rays: describe density, any opacities, fractures, abnormalities, lung fields, cardiac silhouette, etc.
- For lab reports: read and interpret the values shown
- For ECGs: describe rhythm, rate, intervals, any abnormalities
- Never refuse to analyze an image by saying you "cannot view" it — you have vision capabilities

General Rules:
- Always end with a brief disclaimer that this is not a substitute for professional care
- If symptoms suggest emergency (chest pain, stroke, severe bleeding, difficulty breathing), lead with "CALL 911 IMMEDIATELY"
- Be direct and specific — patients need real guidance, not hedging`

export const config = { api: { bodyParser: true } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { message, patientInfo, files = [], history = [] } = req.body
  if (!message) return res.status(400).json({ error: 'Missing message' })

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'OpenRouter API key not configured' })

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`)

  try {
    // Build context
    const contextParts = []
    if (patientInfo?.name) contextParts.push(`Patient: ${patientInfo.name}, Age: ${patientInfo.age || 'unknown'}`)
    if (patientInfo?.symptoms) contextParts.push(`Chief complaint: ${patientInfo.symptoms} (severity ${patientInfo.severity || '?'}/10)`)
    if (patientInfo?.medications) contextParts.push(`Medications: ${patientInfo.medications}`)
    if (patientInfo?.allergies) contextParts.push(`Allergies: ${patientInfo.allergies}`)

    let fileAnalysis = []
    if (files.length > 0) {
      fileAnalysis = files.map(f => analyzeUploadedFile(f))
      contextParts.push(`\nUploaded medical files:`)
      fileAnalysis.forEach(f => contextParts.push(`- ${f.fileName} (${f.fileType}): ${f.findings.join('; ')}`))
    }

    const modelMessages = [{ role: 'system', content: SYSTEM_PROMPT }]
    if (contextParts.length > 0) {
      modelMessages.push({ role: 'system', content: `Clinical context:\n${contextParts.join('\n')}` })
    }
    for (const msg of history.slice(-16)) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        modelMessages.push({ role: msg.role, content: msg.content })
      }
    }
    modelMessages.push({ role: 'user', content: message })

    // If files include images or text, build a vision-capable message
    const imageFiles = files.filter(f => f.category === 'image' && f.base64Data)
    const textFiles = files.filter(f => f.textContent)

    if (imageFiles.length > 0 || textFiles.length > 0) {
      // Replace last user message with multipart content
      modelMessages.pop()
      const contentParts = []

      // Add text prompt first
      let textPrompt = message
      if (textFiles.length > 0) {
        textPrompt += '\n\n' + textFiles.map(f =>
          `--- File: ${f.originalName} ---\n${f.textContent}`
        ).join('\n\n')
      }
      contentParts.push({ type: 'text', text: textPrompt })

      // Add each image
      for (const img of imageFiles) {
        contentParts.push({
          type: 'image_url',
          image_url: { url: `data:${img.mimeType};base64,${img.base64Data}` }
        })
      }

      modelMessages.push({ role: 'user', content: contentParts })
    }

    // Try primary model, fall back if needed
    const fetchOptions = (mdl) => ({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-medical-chatbot.netlify.app',
        'X-Title': 'HealthGuard AI',
      },
      body: JSON.stringify({ model: mdl, messages: modelMessages, stream: true, max_tokens: 1500, temperature: 0.3 }),
      signal: AbortSignal.timeout(60000),
    })

    let model = MODEL_PRIMARY
    let upstreamRes = await fetch(OPENROUTER_URL, fetchOptions(model))

    if (!upstreamRes.ok) {
      // Try fallback model
      model = MODEL_FALLBACK
      upstreamRes = await fetch(OPENROUTER_URL, fetchOptions(model))
    }

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text()
      console.error('OpenRouter error:', upstreamRes.status, errText)
      send({ type: 'error', error: `Model error: ${upstreamRes.status}` })
      return res.end()
    }

    const reader = upstreamRes.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let fullContent = ''
    let reasoningTokens = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6).trim()
        if (raw === '[DONE]') continue
        try {
          const chunk = JSON.parse(raw)
          const content = chunk.choices?.[0]?.delta?.content
          if (content) {
            fullContent += content
            send({ type: 'delta', content })
          }
          if (chunk.usage?.reasoningTokens) reasoningTokens = chunk.usage.reasoningTokens
        } catch {}
      }
    }

    // Triage assessment
    let diagnosticData = null
    if (files.length > 0 || patientInfo?.symptoms) {
      const symptoms = (patientInfo?.symptoms || message).split(',').map(s => s.trim())
      const severity = parseInt(patientInfo?.severity) || 5
      const assessment = assessTriageTier(symptoms, severity)
      diagnosticData = {
        assessment,
        recommendations: generateRecommendations(assessment),
        appointmentInfo: getAppointmentInfo(assessment),
        fileAnalysis,
        reasoningTokens,
        model,
      }
    }

    send({ type: 'done', content: fullContent, diagnosticData })
    res.end()
  } catch (err) {
    console.error('Stream handler error:', err)
    send({ type: 'error', error: err.message })
    res.end()
  }
}
