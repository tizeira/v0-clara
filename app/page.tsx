import HelpAssistantWidget from "@/components/help-assistant-widget"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Minimal background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50/30"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]">
          <svg className="w-full h-full" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className="text-slate-900"/>
          </svg>
        </div>
      </div>

      {/* Mobile-first container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 p-4 text-center border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Clara AI</h1>
          <p className="text-sm text-slate-600">Tu consultora virtual de skincare</p>
        </header>

        {/* Main content - centered */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm mx-auto">
            <HelpAssistantWidget />
          </div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 p-4 text-center text-xs text-slate-500 border-t border-slate-100">
          Powered by Beta Skincare
        </footer>
      </div>
    </div>
  )
}
