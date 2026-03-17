import React, { useState, useRef, useEffect } from 'react'
import { marked } from 'marked'
import Layout from './Layout'

// Configure marked for safe rendering
marked.setOptions({ breaks: true, gfm: true })

export default function MedicalChat({ initialPatientInfo = {} }) {
  const messagesEndRef = useRef(null)
  const [isClient, setIsClient] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')
  const [patientInfo, setPatientInfo] = useState(initialPatientInfo)
  const [showPatientForm, setShowPatientForm] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setSessionId(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm HealthGuard AI, your medical consultant powered by advanced AI.\n\nI can help you:\n• Analyze symptoms and suggest possible conditions\n• Review medical files (X-rays, lab reports, ECGs, scans)\n• Recommend the right level of care\n• Answer health questions with clinical depth\n\nUpload your medical files or describe your symptoms to get started.`,
      timestamp: new Date().toISOString(),
    }])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleFileSelect = (e) => {
    setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)])
    setError('')
    e.target.value = ''
  }

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (!selectedFiles.length) return setError('Please select at least one file')
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      selectedFiles.forEach(f => formData.append('file', f))
      const res = await fetch('/api/upload', { method: 'POST', body: formData, headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error((await res.json()).error || 'Upload failed')
      const data = await res.json()
      setUploadedFiles(prev => [...prev, ...data.files])
      setSelectedFiles([])
      setInputMessage(`I've uploaded ${data.files.map(f => f.originalName).join(', ')}. Please analyze them.`)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e, overrideMessage) => {
    e?.preventDefault()
    const text = overrideMessage || inputMessage
    if (!text.trim() && !uploadedFiles.length) return setError('Please enter a message or upload a file')

    setStreaming(true)
    setError('')

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      files: uploadedFiles.map(f => ({ id: f.id, name: f.originalName })),
    }
    setMessages(prev => [...prev, userMsg])
    setInputMessage('')

    // Placeholder streaming message
    const streamId = `stream-${Date.now()}`
    setMessages(prev => [...prev, { id: streamId, role: 'assistant', content: '', timestamp: new Date().toISOString(), streaming: true }])

    try {
      // Build history for context (exclude the streaming placeholder)
      const history = messages
        .filter(m => m.role === 'user' || (m.role === 'assistant' && !m.streaming))
        .map(m => ({ role: m.role, content: m.content }))

      let res
      let useStream = true

      try {
        res = await fetch('/api/chat-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, patientInfo, files: uploadedFiles, history, sessionId }),
          signal: AbortSignal.timeout(90000),
        })
        if (!res.ok) useStream = false
      } catch {
        useStream = false
      }

      if (!useStream) {
        // Fallback to non-streaming endpoint
        const fallbackRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, patientInfo, files: uploadedFiles, history, sessionId }),
        })
        if (!fallbackRes.ok) throw new Error('Chat request failed')
        const data = await fallbackRes.json()
        setMessages(prev => prev.map(m =>
          m.id === streamId
            ? { ...m, content: data.message.content, streaming: false, diagnosticData: data.message.diagnosticData }
            : m
        ))
        if (uploadedFiles.length > 0) setUploadedFiles([])
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let finalDiagnosticData = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const parsed = JSON.parse(line.slice(6))
            if (parsed.type === 'delta') {
              setMessages(prev => prev.map(m =>
                m.id === streamId ? { ...m, content: m.content + parsed.content } : m
              ))
            } else if (parsed.type === 'done') {
              finalDiagnosticData = parsed.diagnosticData
              setMessages(prev => prev.map(m =>
                m.id === streamId
                  ? { ...m, content: parsed.content, streaming: false, diagnosticData: parsed.diagnosticData }
                  : m
              ))
            } else if (parsed.type === 'error') {
              throw new Error(parsed.error)
            }
          } catch {}
        }
      }

      if (uploadedFiles.length > 0) setUploadedFiles([])
    } catch (err) {
      setError(err.message || 'Failed to send message')
      setMessages(prev => prev.filter(m => m.id !== streamId))
    } finally {
      setStreaming(false)
    }
  }

  const quickPrompts = ['Analyze my symptoms', 'Review my files', 'When should I see a doctor?', 'Medication side effects', 'Diet & nutrition tips']

  if (!isClient) return null

  return (
    <Layout noScroll>
      <div className="flex flex-col h-full overflow-hidden">

        {/* Chat Header */}
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">AI Medical Chat</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${streaming ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {streaming ? 'AI is thinking...' : 'Live · healer-alpha'}
              </span>
            </div>
          </div>
          {!showPatientForm && patientInfo.name && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{patientInfo.name}</p>
              {patientInfo.age && <p className="text-xs text-slate-500">Age: {patientInfo.age}</p>}
            </div>
          )}
          <button onClick={() => setShowPatientForm(v => !v)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-sm">person</span>
            {patientInfo.name ? patientInfo.name : 'Add Info'}
          </button>
        </div>

        {/* Patient Info Form - Optional */}
        {showPatientForm && (
          <div className="px-6 py-4 bg-primary/5 dark:bg-primary/10 border-b border-primary/20 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">person</span>
                Patient Information (Optional)
              </h3>
              <button onClick={() => setShowPatientForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" placeholder="Full Name" value={patientInfo.name || ''}
                onChange={e => setPatientInfo({ ...patientInfo, name: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <input type="number" placeholder="Age" value={patientInfo.age || ''}
                onChange={e => setPatientInfo({ ...patientInfo, age: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <input type="email" placeholder="Email (optional)" value={patientInfo.email || ''}
                onChange={e => setPatientInfo({ ...patientInfo, email: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <button onClick={() => setShowPatientForm(false)}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all">
              <span className="material-symbols-outlined text-sm">check</span>
              Save & Continue
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-background-dark">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0 mr-3 mt-1">
                  <span className="material-symbols-outlined text-sm">smart_toy</span>
                </div>
              )}
              <div className={`max-w-2xl rounded-xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none shadow-sm'
              }`}>
                {msg.streaming && !msg.content ? (
                  <div className="flex items-center gap-1 py-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                ) : msg.role === 'assistant' ? (
                  <div
                    className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-h1:text-base prose-h2:text-sm prose-h3:text-sm prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:font-semibold dark:prose-p:text-slate-200 dark:prose-li:text-slate-200 dark:prose-strong:text-white prose-a:text-primary"
                    dangerouslySetInnerHTML={{ __html: marked.parse(msg.content || '') }}
                  />
                ) : (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                )}

                {/* Diagnostic data card */}
                {msg.diagnosticData && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold text-white ${
                      msg.diagnosticData.assessment.tier === 1 ? 'bg-red-500' :
                      msg.diagnosticData.assessment.tier === 2 ? 'bg-orange-500' :
                      msg.diagnosticData.assessment.tier === 3 ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      <span className="material-symbols-outlined text-xs">
                        {msg.diagnosticData.assessment.tier === 1 ? 'emergency' :
                         msg.diagnosticData.assessment.tier === 2 ? 'warning' :
                         msg.diagnosticData.assessment.tier === 3 ? 'schedule' : 'check_circle'}
                      </span>
                      Risk: {['', 'CRITICAL', 'HIGH RISK', 'MODERATE', 'LOW'][msg.diagnosticData.assessment.tier]}
                    </div>
                    {msg.diagnosticData.reasoningTokens > 0 && (
                      <p className="text-[10px] text-slate-400">
                        Reasoning tokens used: {msg.diagnosticData.reasoningTokens}
                      </p>
                    )}
                  </div>
                )}

                {/* Attached files */}
                {msg.files?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.files.map(f => (
                      <div key={f.id} className="flex items-center gap-1 text-xs opacity-70">
                        <span className="material-symbols-outlined text-xs">attach_file</span>
                        {f.name}
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[10px] mt-2 opacity-40">{new Date(msg.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex-shrink-0">
          {error && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          {/* Files pending upload */}
          {selectedFiles.length > 0 && (
            <div className="mb-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs">
                    <span className="material-symbols-outlined text-sm text-slate-500">description</span>
                    <span className="text-slate-700 dark:text-slate-300 max-w-[120px] truncate">{f.name}</span>
                    <button onClick={() => removeSelectedFile(i)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={uploadFiles} disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:bg-slate-400 transition-all">
                <span className="material-symbols-outlined text-sm">cloud_upload</span>
                {loading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
              </button>
            </div>
          )}

          {/* Uploaded files ready */}
          {uploadedFiles.length > 0 && (
            <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {uploadedFiles.length} file(s) ready for analysis
              </p>
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map(f => (
                  <div key={f.id} className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded text-xs text-emerald-800 dark:text-emerald-300">
                    <span className="material-symbols-outlined text-xs">{f.category === 'image' ? 'image' : 'description'}</span>
                    {f.originalName}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Describe symptoms, ask questions, or send uploaded files for analysis..."
              disabled={streaming}
              className="flex-1 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-50 outline-none"
            />
            <label className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">attach_file</span>
              <span className="hidden sm:inline">Upload</span>
              <input type="file" multiple onChange={handleFileSelect} accept="image/*,.pdf,.txt,.doc,.docx" disabled={loading} className="hidden" />
            </label>
            <button type="submit" disabled={streaming}
              className="px-5 py-3 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 disabled:bg-slate-400 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
              {streaming
                ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                : <span className="material-symbols-outlined text-sm">send</span>
              }
              <span className="hidden sm:inline">{streaming ? 'Thinking...' : 'Send'}</span>
            </button>
          </form>

          {/* Quick prompts */}
          <div className="mt-3 flex flex-wrap gap-2">
            {quickPrompts.map(prompt => (
              <button key={prompt} onClick={() => handleSendMessage(null, prompt)}
                disabled={streaming}
                className="text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors font-medium disabled:opacity-40">
                {prompt}
              </button>
            ))}
          </div>

          <p className="text-[10px] text-slate-400 mt-3 text-center">
            Powered by OpenRouter healer-alpha · Supported files: JPEG, PNG, PDF, DOC, TXT (max 10MB) · For emergencies call 911
          </p>
        </div>
      </div>
    </Layout>
  )
}
