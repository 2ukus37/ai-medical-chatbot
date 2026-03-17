import React from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="p-6 space-y-8">
        {/* Welcome & Summary Section */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back. Your health platform is ready.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="material-symbols-outlined text-primary">calendar_today</span>
              <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </section>

        {/* Quick Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Triage CTA */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-8 border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl text-blue-600">
                <span className="material-symbols-outlined text-3xl">medical_services</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Medical Triage</h3>
                <p className="text-sm text-slate-500">Rapid symptom assessment</p>
              </div>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Get instant risk assessment based on your symptoms. Our AI analyzes severity and provides care recommendations.
            </p>
            <Link href="/triage" className="inline-flex items-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              <span>Start Assessment</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          {/* Chat CTA */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-xl p-8 text-white hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <span className="material-symbols-outlined text-3xl">chat</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Medical Chat</h3>
                <p className="text-sm text-purple-100">AI-powered consultation</p>
              </div>
            </div>
            <p className="text-purple-50 mb-6">
              Upload medical files (X-rays, lab reports) and chat with our AI for insights about your health concerns.
            </p>
            <Link href="/chat" className="inline-flex items-center gap-2 bg-white text-purple-600 font-bold py-3 px-6 rounded-lg hover:bg-purple-50 transition-all">
              <span>Start Chat</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-600">
                <span className="material-symbols-outlined">favorite</span>
              </div>
              <span className="text-xs font-bold text-green-500 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Rapid Assessment</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Triage</h3>
            <p className="text-xs text-slate-500 mt-2">Quick symptom analysis</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600">
                <span className="material-symbols-outlined">chat</span>
              </div>
              <span className="text-xs font-bold text-green-500 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Live</span>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">AI Consultation</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Chat</h3>
            <p className="text-xs text-slate-500 mt-2">Real-time medical support</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600">
                <span className="material-symbols-outlined">upload_file</span>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Ready</span>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">File Analysis</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Upload</h3>
            <p className="text-xs text-slate-500 mt-2">X-rays, labs, reports</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-lg text-teal-600">
                <span className="material-symbols-outlined">insights</span>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Soon</span>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Health Tracking</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Analytics</h3>
            <p className="text-xs text-slate-500 mt-2">Long-term insights</p>
          </div>
        </section>

        {/* How It Works & Risk Levels */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* How It Works */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              How It Works
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Describe Symptoms</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Tell us what you're experiencing</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">AI Assessment</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Our system analyzes your case</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Get Guidance</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Receive care recommendations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Levels */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">priority_high</span>
              Assessment Levels
            </h2>
            <div className="space-y-3">
              <div className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-r-lg">
                <h4 className="font-bold text-red-900 dark:text-red-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">emergency</span>
                  CRITICAL
                </h4>
                <p className="text-red-800 dark:text-red-400 text-sm">Life-threatening. Call 911 immediately.</p>
              </div>
              <div className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-r-lg">
                <h4 className="font-bold text-orange-900 dark:text-orange-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  HIGH RISK
                </h4>
                <p className="text-orange-800 dark:text-orange-400 text-sm">Urgent care within 24 hours.</p>
              </div>
              <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-lg">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  MODERATE
                </h4>
                <p className="text-blue-800 dark:text-blue-400 text-sm">Schedule within 3-5 days.</p>
              </div>
              <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r-lg">
                <h4 className="font-bold text-green-900 dark:text-green-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  LOW
                </h4>
                <p className="text-green-800 dark:text-green-400 text-sm">Monitor and self-care.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-500 text-2xl">warning</span>
            <div>
              <p className="text-yellow-900 dark:text-yellow-200 text-sm font-semibold mb-1">
                Important Medical Disclaimer
              </p>
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                HealthGuard AI is an informational tool only. It does not provide official medical diagnoses and should not replace consultation with licensed healthcare providers. In case of medical emergency, call 911 immediately.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
