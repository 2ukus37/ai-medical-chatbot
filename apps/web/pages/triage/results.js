import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'
import TriageResults from '../../components/TriageResults'

export default function ResultsPage() {
  const router = useRouter()
  const { id } = router.query
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/triage?id=${id}`)
        if (!response.ok) throw new Error('Could not load triage result')
        setData(await response.json())
      } catch (err) {
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchResult()
  }, [id])

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <span className="material-symbols-outlined text-primary text-5xl animate-spin block mb-4">progress_activity</span>
            <p className="text-slate-600 dark:text-slate-400">Loading assessment results...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-lg bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg">
            <span className="material-symbols-outlined text-red-500 text-5xl block mb-4">error</span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Error Loading Results</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{error || 'Could not load triage result'}</p>
            <Link href="/triage" className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-6 rounded-lg hover:bg-primary/90 transition-all">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Start New Assessment
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Assessment Results
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              ID: {data.id} &middot; {new Date(data.timestamp).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              Print
            </button>
            <Link href="/triage" className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-4 rounded-lg hover:bg-primary/90 transition-all text-sm shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-sm">add</span>
              New Assessment
            </Link>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-3xl">
          <TriageResults assessment={data.assessment} patientData={data.patient} />
        </div>
      </div>
    </Layout>
  )
}
