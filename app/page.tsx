import HelpAssistantWidget from "@/components/help-assistant-widget"

export default function Home() {
return (
  <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    {/* Background Elements for Glass Effect */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-200/30 to-yellow-200/30 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
    </div>

    <div className="flex items-center justify-center min-h-screen relative z-10">
      <HelpAssistantWidget />
    </div>
  </div>
)
}
