import { useStreamingAvatarContext, useVoiceChat } from "@/hooks/avatar";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInterfaceProps {
  isActive: boolean;
}

export function VoiceInterface({ isActive }: VoiceInterfaceProps) {
  const {
    isUserTalking,
    isAvatarTalking,
    isVoiceChatLoading,
    isVoiceChatActive
  } = useStreamingAvatarContext();

  const {
    muteInputAudio,
    unmuteInputAudio,
    isMuted,
  } = useVoiceChat();

  const handleMicToggle = () => {
    if (isMuted) {
      unmuteInputAudio();
    } else {
      muteInputAudio();
    }
  };

  if (!isActive) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Voice Activity Indicators - Simplified for mobile */}
      {isUserTalking && (
        <div className="flex items-center gap-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-4 bg-green-500 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {isAvatarTalking && (
        <div className="flex items-center gap-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-blue-500 rounded-full animate-bounce"
              style={{
                height: `${12 + Math.random() * 8}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Mobile-friendly mic control */}
      <button
        onClick={handleMicToggle}
        disabled={isVoiceChatLoading}
        className={cn(
          "w-full h-11 rounded-lg font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2",
          isMuted
            ? "bg-red-100 hover:bg-red-200 text-red-700 border border-red-200"
            : "bg-green-100 hover:bg-green-200 text-green-700 border border-green-200"
        )}
      >
        {isMuted ? (
          <>
            <MicOff className="w-4 h-4" />
            Activar Micrófono
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            Silenciar
          </>
        )}
      </button>
    </div>
  );
}