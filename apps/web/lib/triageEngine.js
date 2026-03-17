// Triage logic engine based on symptom analysis and risk assessment

export const TRIAGE_TIERS = {
  CRITICAL: 1,
  HIGH_RISK: 2,
  MODERATE: 3,
  LOW: 4
}

export const TIER_LABELS = {
  [TRIAGE_TIERS.CRITICAL]: 'CRITICAL (Emergency)',
  [TRIAGE_TIERS.HIGH_RISK]: 'HIGH RISK (Urgent)',
  [TRIAGE_TIERS.MODERATE]: 'MODERATE (Routine)',
  [TRIAGE_TIERS.LOW]: 'LOW (Info Only)'
}

export const CRITICAL_TRIGGERS = [
  'chest pain',
  'severe bleeding',
  'stroke signs',
  'difficulty breathing',
  'severe head injury',
  'anaphylaxis',
  'suicide risk',
  'loss of consciousness'
]

export const HIGH_RISK_TRIGGERS = [
  'high fever',
  'severe pain',
  'severe infection',
  'abnormal lab values',
  'acute illness',
  'severe allergic reaction'
]

export const SYMPTOM_SEVERITY_MAP = {
  'chest pain': { tier: TRIAGE_TIERS.CRITICAL, impression: 'Potential Acute Cardiac Event' },
  'difficulty breathing': { tier: TRIAGE_TIERS.CRITICAL, impression: 'Respiratory Distress' },
  'severe bleeding': { tier: TRIAGE_TIERS.CRITICAL, impression: 'Acute Hemorrhage' },
  'stroke signs': { tier: TRIAGE_TIERS.CRITICAL, impression: 'Possible Cerebrovascular Event' },
  'high fever': { tier: TRIAGE_TIERS.HIGH_RISK, impression: 'Febrile Illness' },
  'severe pain': { tier: TRIAGE_TIERS.HIGH_RISK, impression: 'Acute Pain Syndrome' },
  'severe infection': { tier: TRIAGE_TIERS.HIGH_RISK, impression: 'Systemic Infection' },
  'mild fever': { tier: TRIAGE_TIERS.MODERATE, impression: 'Possible Viral Illness' },
  'cough': { tier: TRIAGE_TIERS.MODERATE, impression: 'Possible Respiratory Infection' },
  'fatigue': { tier: TRIAGE_TIERS.MODERATE, impression: 'General Malaise' },
  'headache': { tier: TRIAGE_TIERS.MODERATE, impression: 'Cephalgia' },
  'nausea': { tier: TRIAGE_TIERS.MODERATE, impression: 'Gastrointestinal Upset' }
}

/**
 * Assess triage tier based on symptoms and severity
 * @param {Array} symptoms - Array of reported symptoms
 * @param {number} severity - Severity scale 1-10
 * @returns {Object} { tier, impression, primarySymptom }
 */
export function assessTriageTier(symptoms = [], severity = 0) {
  // Check for critical triggers
  const lowerSymptoms = symptoms.map(s => s.toLowerCase())
  
  for (const symptom of lowerSymptoms) {
    if (CRITICAL_TRIGGERS.some(trigger => symptom.includes(trigger))) {
      return {
        tier: TRIAGE_TIERS.CRITICAL,
        impression: 'Potential Life-Threatening Emergency',
        primarySymptom: symptom,
        action: 'CALL 911 IMMEDIATELY'
      }
    }
  }

  // Check for high-risk triggers
  for (const symptom of lowerSymptoms) {
    if (HIGH_RISK_TRIGGERS.some(trigger => symptom.includes(trigger))) {
      if (severity >= 7) {
        return {
          tier: TRIAGE_TIERS.HIGH_RISK,
          impression: SYMPTOM_SEVERITY_MAP[symptom]?.impression || 'Acute Urgent Condition',
          primarySymptom: symptom,
          action: 'Seek Urgent Care Within 24 Hours'
        }
      }
    }
  }

  // Check severity-based assessment
  if (severity >= 8) {
    return {
      tier: TRIAGE_TIERS.HIGH_RISK,
      impression: 'Severe Acute Condition',
      primarySymptom: lowerSymptoms[0] || 'Unspecified',
      action: 'Seek Urgent Care Within 24 Hours'
    }
  }

  if (severity >= 5) {
    return {
      tier: TRIAGE_TIERS.MODERATE,
      impression: 'Routine Evaluation Recommended',
      primarySymptom: lowerSymptoms[0] || 'Unspecified',
      action: 'Schedule Appointment Within 3-5 Days'
    }
  }

  // Low risk
  return {
    tier: TRIAGE_TIERS.LOW,
    impression: 'Minor Concern - Self Care Appropriate',
    primarySymptom: lowerSymptoms[0] || 'Unspecified',
    action: 'Monitor Symptoms, Seek Care if Worsens'
  }
}

/**
 * Generate recommendations based on triage assessment
 * @param {Object} assessment - Result from assessTriageTier
 * @returns {Array} Array of recommendation strings
 */
export function generateRecommendations(assessment) {
  const recommendations = []

  switch (assessment.tier) {
    case TRIAGE_TIERS.CRITICAL:
      recommendations.push('🚨 Call 911 or Emergency Services immediately')
      recommendations.push('Do not wait for online appointment')
      recommendations.push('Inform EMS of your chief complaint')
      break

    case TRIAGE_TIERS.HIGH_RISK:
      recommendations.push('Visit an urgent care clinic today or tomorrow')
      recommendations.push('Do not delay seeking medical evaluation')
      recommendations.push('Bring insurance card and photo ID')
      recommendations.push('Monitor for worsening symptoms while waiting')
      break

    case TRIAGE_TIERS.MODERATE:
      recommendations.push('Schedule appointment with primary care within 3-5 days')
      recommendations.push('Rest and hydration as appropriate')
      recommendations.push('Over-the-counter medications may provide relief')
      recommendations.push('Contact office if symptoms worsen before appointment')
      break

    case TRIAGE_TIERS.LOW:
      recommendations.push('Monitor symptoms at home')
      recommendations.push('Stay hydrated and get adequate rest')
      recommendations.push('Contact healthcare provider if symptoms persist or worsen')
      recommendations.push('This assessment does not replace professional medical evaluation')
      break
  }

  return recommendations
}

/**
 * Get appointment urgency and specialty
 * @param {Object} assessment - Result from assessTriageTier
 * @returns {Object} { specialty, urgency, timeframe }
 */
export function getAppointmentInfo(assessment) {
  const specialtyMap = {
    'chest pain': 'Cardiologist',
    'difficulty breathing': 'Pulmonologist',
    'severe bleeding': 'Emergency Medicine',
    'high fever': 'Internal Medicine',
    'severe pain': 'Emergency Medicine'
  }

  const urgencyMap = {
    [TRIAGE_TIERS.CRITICAL]: { urgency: 'Immediate', timeframe: 'Now - 911' },
    [TRIAGE_TIERS.HIGH_RISK]: { urgency: 'Within 24 Hours', timeframe: 'Urgent Care' },
    [TRIAGE_TIERS.MODERATE]: { urgency: 'Within 3-5 Days', timeframe: 'Primary Care' },
    [TRIAGE_TIERS.LOW]: { urgency: 'As Needed', timeframe: 'Routine' }
  }

  const specialty = specialtyMap[assessment.primarySymptom] || 'General Practitioner'
  const timing = urgencyMap[assessment.tier]

  return {
    specialty,
    urgency: timing.urgency,
    timeframe: timing.timeframe
  }
}
