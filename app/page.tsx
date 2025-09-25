import HelpAssistantWidget from "@/components/help-assistant-widget"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Subtle background pattern for clean white theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/20 to-white"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]">
          <svg className="w-full h-full" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className="text-slate-100"/>
          </svg>
        </div>
      </div>

      {/* Full screen container */}
      <div className="relative z-10 min-h-screen">
        <HelpAssistantWidget />
      </div>
    </div>
  )
}
