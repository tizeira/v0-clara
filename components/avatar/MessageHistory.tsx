import { useStreamingAvatarContext, MessageSender } from "@/hooks/avatar";
import { cn } from "@/lib/utils";

export function MessageHistory() {
  const { messages } = useStreamingAvatarContext();

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500/60">
        <p className="text-sm">Los mensajes aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === MessageSender.CLIENT ? "justify-end" : "items-start gap-2"}`}
        >
          {message.sender === MessageSender.AVATAR && (
            <div
              className="flex items-center justify-center w-8 h-8 mt-1 backdrop-blur-2xl rounded-full"
              style={{
                background: "rgba(0, 0, 0, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 4.5L18.5 8L15 11.5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.5 19.5L5 16L8.5 12.5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.5 8H9.5C6.73858 8 4.5 10.2386 4.5 13V16"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
          <div
            className={cn(
              "rounded-2xl p-3 max-w-[80%] backdrop-blur-2xl transition-all duration-200 glass-message",
              message.sender === MessageSender.CLIENT
                ? "text-white user-message-refraction"
                : "text-gray-800/90 assistant-message-refraction",
            )}
            style={
              message.sender === MessageSender.CLIENT
                ? {
                    background: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                  }
                : {
                    background: "rgba(255, 255, 255, 0.25)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                  }
            }
          >
            {message.sender === MessageSender.AVATAR && (
              <div className="absolute inset-0 pointer-events-none message-refraction-effect rounded-2xl"></div>
            )}
            <span className="relative z-10">{message.content}</span>
          </div>
        </div>
      ))}
    </div>
  );
}