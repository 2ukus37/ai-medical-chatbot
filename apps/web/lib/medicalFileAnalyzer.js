/**
 * Medical File Analyzer
 * Extracts context from uploaded medical files (images, documents)
 * Provides diagnostic insights based on file type and content
 */

// Simulate medical file analysis based on file type
export function analyzeUploadedFile(file) {
  const { mimeType, originalName, category } = file
  
  let analysis = {
    fileType: category,
    fileName: originalName,
    detectedConditions: [],
    findings: [],
    recommendations: [],
    confidence: 0.65,
    requiresSpecialist: false
  }

  // Analyze based on file type and name hints
  const nameLower = originalName.toLowerCase()

  // X-ray analysis
  if (nameLower.includes('xray') || nameLower.includes('x-ray') || nameLower.includes('radiograph')) {
    analysis.findings = [
      'Radiographic imaging detected',
      'Analysis: Skeletal or chest imaging detected',
      'Potential findings may include bone density, fractures, or pulmonary patterns'
    ]
    analysis.requiresSpecialist = true
    analysis.recommendations = [
      'Radiologist review recommended',
      'Compare with baseline studies if available',
      'Clinical correlation with patient symptoms advised'
    ]
  }

  // CT Scan analysis
  if (nameLower.includes('ct') || nameLower.includes('computed tomography') || nameLower.includes('scan')) {
    analysis.findings = [
      'CT imaging detected',
      'Cross-sectional imaging analysis',
      'Multiple tissue densities and anatomical relationships evaluable'
    ]
    analysis.requiresSpecialist = true
    analysis.recommendations = [
      'Radiologist or imaging specialist consultation recommended',
      'Review imaging with clinical symptoms',
      'Consider follow-up imaging if acute findings present'
    ]
  }

  // MRI analysis
  if (nameLower.includes('mri') || nameLower.includes('magnetic resonance')) {
    analysis.findings = [
      'MRI imaging detected',
      'Soft tissue and neural structure imaging',
      'High sensitivity for detecting tissue pathology'
    ]
    analysis.requiresSpecialist = true
    analysis.recommendations = [
      'Neurology or specialist consultation recommended',
      'Compare with prior imaging studies',
      'Correlate findings with clinical presentation'
    ]
  }

  // Ultrasound analysis
  if (nameLower.includes('ultrasound') || nameLower.includes('echo') || nameLower.includes('sonography')) {
    analysis.findings = [
      'Ultrasound imaging detected',
      'Real-time imaging capability',
      'Dynamic assessment possible'
    ]
    analysis.requiresSpecialist = true
    analysis.recommendations = [
      'Sonographer/Radiologist review recommended',
      'Dynamic imaging may reveal additional findings',
      'Consider confirmatory imaging if needed'
    ]
  }

  // Lab Report analysis
  if (nameLower.includes('lab') || nameLower.includes('blood') || nameLower.includes('test') || nameLower.includes('report')) {
    analysis.findings = [
      'Laboratory report detected',
      'Quantitative analysis available',
      'Values can be compared to reference ranges'
    ]
    analysis.requiresSpecialist = false
    analysis.recommendations = [
      'Review all abnormal values',
      'Correlate with clinical symptoms',
      'Consider repeat testing if results are borderline'
    ]
  }

  // ECG/EKG analysis
  if (nameLower.includes('ecg') || nameLower.includes('ekg') || nameLower.includes('cardiac')) {
    analysis.findings = [
      'Cardiac monitoring data detected',
      'Electrical activity of heart recorded',
      'Rhythm and wave patterns analyzable'
    ]
    analysis.requiresSpecialist = true
    analysis.recommendations = [
      'Cardiologist review recommended',
      'Compare with previous ECG if available',
      'Clinical correlation essential for interpretation'
    ]
  }

  // Pathology report analysis
  if (nameLower.includes('pathology') || nameLower.includes('biopsy') || nameLower.includes('histology')) {
    analysis.findings = [
      'Pathology report detected',
      'Tissue diagnosis available',
      'Microscopic examination results included'
    ]
    analysis.requiresSpecialist = true
    analysis.recommendations = [
      'Pathologist consultation recommended',
      'Correlate with clinical history',
      'Consider immunohistochemical staining if diagnosis unclear'
    ]
  }

  // Medical Record analysis
  if (nameLower.includes('medical') || nameLower.includes('record') || nameLower.includes('history')) {
    analysis.findings = [
      'Medical documentation detected',
      'Patient history and clinical information available',
      'Comprehensive patient context'
    ]
    analysis.requiresSpecialist = false
    analysis.recommendations = [
      'Review complete medical history',
      'Identify key clinical events and medications',
      'Correlate with current presentation'
    ]
  }

  // Default analysis if no specific match
  if (analysis.findings.length === 0) {
    analysis.findings = [
      'Medical file detected',
      'File analysis in progress',
      'Content available for clinical review'
    ]
    analysis.recommendations = [
      'Review file contents carefully',
      'Correlate with patient symptoms and clinical presentation',
      'Seek specialist consultation if unclear'
    ]
  }

  return analysis
}

// Extract text context from file metadata
export function getFileContext(file) {
  const context = {
    fileName: file.originalName,
    fileType: file.category,
    mimeType: file.mimeType,
    uploadTime: file.uploadedAt,
    summary: generateFileSummary(file)
  }
  return context
}

// Generate a summary description of what the file contains
function generateFileSummary(file) {
  const name = file.originalName.toLowerCase()
  
  const summaries = {
    'xray': 'Radiographic imaging - skeletal or chest X-ray',
    'ct': 'Computed Tomography scan - cross-sectional imaging',
    'mri': 'Magnetic Resonance Imaging - soft tissue and neural imaging',
    'ultrasound': 'Ultrasound imaging - real-time dynamic imaging',
    'echo': 'Echocardiography - cardiac imaging',
    'lab': 'Laboratory test results and blood work',
    'ecg': 'Electrocardiogram - cardiac electrical activity',
    'ekg': 'Electrocardiogram - cardiac electrical activity',
    'pathology': 'Pathology report - tissue diagnosis',
    'biopsy': 'Biopsy findings - tissue analysis',
    'medical': 'Medical record - clinical documentation'
  }

  for (const [key, summary] of Object.entries(summaries)) {
    if (name.includes(key)) {
      return summary
    }
  }

  return `Medical document - ${file.category}`
}

// Build medical context for AI/diagnosis system
export function buildMedicalContext(files, patientInfo) {
  const context = {
    patient: patientInfo,
    uploadedFiles: [],
    clinicalContext: '',
    priority: 'NORMAL'
  }

  for (const file of files) {
    const analysis = analyzeUploadedFile(file)
    context.uploadedFiles.push({
      ...file,
      analysis
    })

    if (analysis.requiresSpecialist) {
      context.priority = 'HIGH'
    }
  }

  // Build clinical context string for LLM integration
  context.clinicalContext = generateClinicalContextString(context.uploadedFiles, patientInfo)

  return context
}

function generateClinicalContextString(files, patient) {
  let contextStr = `Patient: ${patient?.name || 'Unknown'}, Age: ${patient?.age || 'Unknown'}\n`
  contextStr += `Chief Complaint: ${patient?.symptoms || 'Not specified'}\n`
  contextStr += `Severity: ${patient?.severity || 'Not specified'}/10\n\n`
  
  contextStr += `Medical Files Reviewed:\n`
  
  for (const file of files) {
    contextStr += `\n- ${file.analysis.fileName} (${file.analysis.fileType})\n`
    contextStr += `  Findings:\n`
    for (const finding of file.analysis.findings) {
      contextStr += `    • ${finding}\n`
    }
  }

  return contextStr
}

// Determine diagnostic urgency based on files
export function assessFileUrgency(files) {
  let urgency = 'ROUTINE'
  let reasons = []

  for (const file of files) {
    const analysis = analyzeUploadedFile(file)
    
    if (analysis.requiresSpecialist) {
      urgency = 'EXPEDITED'
      reasons.push(`Specialist imaging: ${file.originalName}`)
    }
  }

  return { urgency, reasons }
}
