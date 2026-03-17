import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Layout({ children, noScroll = false }) {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Persist dark mode to <html> element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const isActive = (path) =>
    path === '/'
      ? router.pathname === '/'
      : router.pathname.startsWith(path)

  const navLinks = [
    { href: '/', icon: 'dashboard', label: 'Dashboard' },
    { href: '/triage', icon: 'medical_services', label: 'Triage Assessment' },
    { href: '/chat', icon: 'chat', label: 'Medical Chat' },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary size-10 rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">health_metrics</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">HealthGuard</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI Health Platform</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2">
          {navLinks.map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive(href)
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">AI Powered</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Triage, chat, and file analysis — all in one place.
            </p>
            <Link
              href="/chat"
              className="block w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors text-center"
            >
              Start Consultation
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg mr-2"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 text-sm outline-none"
                placeholder="Search health records..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Toggle dark mode"
            >
              <span className="material-symbols-outlined">
                {darkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">Patient</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-0.5">#HG-001</p>
              </div>
              <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center text-primary border-2 border-transparent group-hover:border-primary transition-all">
                <span className="material-symbols-outlined text-xl">account_circle</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile nav overlay */}
        {mobileNavOpen && (
          <div className="md:hidden absolute inset-0 z-50 bg-black/50" onClick={() => setMobileNavOpen(false)}>
            <div className="w-64 h-full bg-white dark:bg-slate-900 p-4 space-y-1" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 p-3 mb-4">
                <div className="bg-primary size-8 rounded-lg flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-lg">health_metrics</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">HealthGuard</span>
              </div>
              {navLinks.map(({ href, icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive(href)
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="material-symbols-outlined">{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Page content */}
        <div className={`flex-1 ${noScroll ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {children}
        </div>
      </main>
    </div>
  )
}
