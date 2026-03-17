import React from 'react'
import Layout from '../../components/Layout'
import TriageForm from '../../components/TriageForm'

export default function TriagePage() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Medical Triage Assessment
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Rapid symptom analysis and risk assessment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-800">
              <TriageForm />
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* How It Works */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                How It Works
              </h2>
              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  <span>Describe your symptoms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  <span>AI analyzes severity and risk</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  <span>Receive triage assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  <span>Get care recommendations</span>
                </li>
              </ul>
            </div>

            {/* Risk Levels */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">priority_high</span>
                Risk Levels
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300"><strong>Critical:</strong> Emergency (call 911)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300"><strong>High Risk:</strong> Urgent care (&lt;24h)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300"><strong>Moderate:</strong> Routine (3-5 days)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300"><strong>Low:</strong> Monitor/self-care</span>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-500 text-sm mt-0.5">warning</span>
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  <strong>Disclaimer:</strong> This tool is for informational purposes only and does not replace professional medical evaluation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
