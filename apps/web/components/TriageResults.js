import React from 'react'

const tierConfig = {
  1: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-400',
    text: 'text-red-900 dark:text-red-200',
    badge: 'bg-red-500',
    icon: 'emergency',
    label: 'CRITICAL'
  },
  2: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-400',
    text: 'text-orange-900 dark:text-orange-200',
    badge: 'bg-orange-500',
    icon: 'warning',
    label: 'HIGH RISK'
  },
  3: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-400',
    text: 'text-blue-900 dark:text-blue-200',
    badge: 'bg-blue-500',
    icon: 'schedule',
    label: 'MODERATE'
  },
  4: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-400',
    text: 'text-green-900 dark:text-green-200',
    badge: 'bg-green-500',
    icon: 'check_circle',
    label: 'LOW'
  }
}

export default function TriageResults({ assessment, patientData }) {
  const config = tierConfig[assessment.tier] || tierConfig[4]

  return (
    <div className="space-y-6">
      {/* Risk Level Card */}
      <div className={`border-2 ${config.border} ${config.bg} rounded-xl p-6`}>
        <div className="flex items-start gap-4">
          <div className={`${config.badge} p-3 rounded-xl text-white flex-shrink-0`}>
            <span className="material-symbols-outlined text-2xl">{config.icon}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white ${config.badge}`}>
                {config.label}
              </span>
            </div>
            <h2 className={`text-xl font-bold ${config.text} mb-1`}>
              {assessment.impression}
            </h2>
            {assessment.action && (
              <p className={`text-sm font-semibold ${config.text} opacity-80`}>
                {assessment.action}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Patient Summary */}
      {patientData && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Patient Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1">Name</p>
              <p className="font-semibold text-slate-900 dark:text-white">{patientData.name}</p>
            </div>
            {patientData.age && (
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1">Age</p>
                <p className="font-semibold text-slate-900 dark:text-white">{patientData.age} years</p>
              </div>
            )}
            <div className="col-span-2">
              <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1">Reported Symptoms</p>
              <p className="font-semibold text-slate-900 dark:text-white">{patientData.symptoms}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1">Severity Score</p>
              <p className="font-semibold text-slate-900 dark:text-white">{patientData.severity}/10</p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">lightbulb</span>
          Recommendations
        </h3>
        <ul className="space-y-3">
          {assessment.recommendations?.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm">
              <span className="material-symbols-outlined text-primary text-sm mt-0.5 flex-shrink-0">check_circle</span>
              <span className="text-slate-700 dark:text-slate-300">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Appointment Info */}
      {assessment.appointmentInfo && (
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">calendar_today</span>
            Appointment Guidance
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Specialty', value: assessment.appointmentInfo.specialty },
              { label: 'Urgency', value: assessment.appointmentInfo.urgency },
              { label: 'Timeframe', value: assessment.appointmentInfo.timeframe }
            ].map(({ label, value }) => (
              <div key={label} className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-500 text-sm mt-0.5">warning</span>
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            <strong>Important:</strong> This triage assessment is AI-generated for informational purposes only.
            It does not replace professional medical evaluation. Please consult with a healthcare provider for accurate diagnosis and treatment.
            In case of emergency, call 911 immediately.
          </p>
        </div>
      </div>
    </div>
  )
}
