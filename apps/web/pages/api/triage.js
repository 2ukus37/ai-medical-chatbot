import { assessTriageTier, generateRecommendations, getAppointmentInfo } from '../../lib/triageEngine'

// Simple in-memory storage (replace with database in production)
// Use global to persist across hot-reloads during development
global.triageDatabase = global.triageDatabase || {}

export default function handler(req, res) {
  if (req.method === 'POST') {
    return handleTriageSubmission(req, res)
  } else if (req.method === 'GET') {
    return getTriageResult(req, res)
  }
  
  res.status(405).json({ error: 'Method not allowed' })
}

function handleTriageSubmission(req, res) {
  const { name, age, email, symptoms, severity, duration, medications, allergies } = req.body

  // Validate input
  if (!name || !symptoms) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Run triage assessment
  const assessment = assessTriageTier(symptoms.split(','), parseInt(severity) || 5)
  const recommendations = generateRecommendations(assessment)
  const appointmentInfo = getAppointmentInfo(assessment)

  // Create result object
  const result = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    patient: {
      name,
      age: age ? parseInt(age) : null,
      email
    },
    symptoms: symptoms.split(',').map(s => s.trim()),
    severity: parseInt(severity) || 5,
    duration,
    medications: medications || null,
    allergies: allergies || null,
    assessment: {
      tier: assessment.tier,
      impression: assessment.impression,
      primarySymptom: assessment.primarySymptom,
      action: assessment.action,
      recommendations,
      appointmentInfo
    }
  }

  // Store result (in-memory; use database for production)
  global.triageDatabase[result.id] = result

  res.status(200).json({ id: result.id, ...result })
}

function getTriageResult(req, res) {
  const { id } = req.query

  if (!id || !global.triageDatabase[id]) {
    return res.status(404).json({ error: 'Triage result not found' })
  }

  res.status(200).json(global.triageDatabase[id])
}
