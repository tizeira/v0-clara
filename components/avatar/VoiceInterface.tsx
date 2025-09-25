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
    <button
      onClick={handleMicToggle}
      disabled={isVoiceChatLoading}
      className={cn(
        "w-14 h-14 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center backdrop-blur-md border shadow-lg",
        isMuted
          ? "bg-red-500/80 hover:bg-red-500 text-white border-red-400/30"
          : "bg-white/20 hover:bg-white/30 text-slate-700 border-white/30"
      )}
    >
      {isMuted ? (
        <MicOff className="w-6 h-6" />
      ) : (
        <Mic className="w-6 h-6" />
      )}
    </button>
  );
}