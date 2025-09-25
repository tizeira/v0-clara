"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Mic, Video, Phone, PhoneOff, MicOff } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  StreamingAvatarProvider,
  StreamingAvatarSessionState,
  useStreamingAvatarSession,
  useVoiceChat,
  useStreamingAvatarContext
} from "@/hooks/avatar"
import { AvatarVideo } from "@/components/avatar/AvatarVideo"
import { VoiceInterface } from "@/components/avatar/VoiceInterface"
import { AvatarQuality, VoiceEmotion, STTProvider, VoiceChatTransport, StartAvatarRequest } from "@heygen/streaming-avatar"
import { useMemoizedFn, useUnmount } from "ahooks"

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.High,
  avatarName: "Alessandra_CasualLook_public",
  knowledgeId: "251ae2b8b812448d9d03efbc354c9b98",
  voice: {
    voiceId: "1e080de3d73e4225a7454797a848bffe",
    rate: 1,
    emotion: VoiceEmotion.FRIENDLY,
  },
  language: "es",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
    confidence: 0.55,
  },
};

function ClaraWidgetMobile() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } = useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { isVoiceChatActive, isUserTalking, isAvatarTalking, isMuted } = useStreamingAvatarContext();

  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const mediaStream = useRef<HTMLVideoElement>(null);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      if (process.env.NODE_ENV === 'development') {
        console.log("Access Token:", token);
      }

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startSession = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      setIsVoiceMode(isVoiceChat);
      const newToken = await fetchAccessToken();
      initAvatar(newToken);

      await startAvatar(DEFAULT_CONFIG);

      if (isVoiceChat) {
        await startVoiceChat();
      }
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });

  const handleStopSession = useCallback(async () => {
    await stopAvatar();
    setIsVoiceMode(false);
  }, [stopAvatar]);

  useUnmount(() => {
    stopAvatar();
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  const getStatusText = () => {
    if (sessionState === StreamingAvatarSessionState.CONNECTING) {
      return "Conectando con Clara...";
    }
    if (sessionState === StreamingAvatarSessionState.CONNECTED) {
      if (isUserTalking) return "Te escucho...";
      if (isAvatarTalking) return "Clara está hablando...";
      if (isMuted) return "Micrófono silenciado";
      return "Lista para ayudarte";
    }
    return "";
  };

  // Landing State - Before connection
  if (sessionState === StreamingAvatarSessionState.INACTIVE) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="text-center space-y-8 max-w-sm mx-auto">
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg">
              <Video className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Habla con Clara
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Tu consultora virtual de skincare está lista para ayudarte con recomendaciones personalizadas
            </p>
          </div>

          {/* Main CTA Button */}
          <button
            onClick={() => startSession(true)}
            className="w-full h-14 bg-blue-500/80 hover:bg-blue-500 backdrop-blur-md text-white font-semibold rounded-2xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 border border-blue-400/30 shadow-lg"
          >
            <Phone className="w-6 h-6" />
            Iniciar Llamada con Clara
          </button>

          {/* Secondary option */}
          <button
            onClick={() => startSession(false)}
            className="w-full h-14 bg-white/20 hover:bg-white/30 backdrop-blur-md text-slate-700 font-medium rounded-2xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 border border-white/30 shadow-sm"
          >
            <Video className="w-6 h-6" />
            Iniciar Chat de Video
          </button>
        </div>
      </div>
    );
  }

  // Connecting State
  if (sessionState === StreamingAvatarSessionState.CONNECTING) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-800">Conectando...</h3>
            <p className="text-slate-600">Iniciando video llamada con Clara</p>
          </div>
        </div>
      </div>
    );
  }

  // Connected State - Fixed Vertical Layout
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {/* Top Status Bar - Fixed Height */}
      <div className="flex-shrink-0 px-6 pt-4 pb-2">
        <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/30 mx-auto max-w-xs shadow-lg">
          <p className="text-slate-800 font-medium text-center text-sm">{getStatusText()}</p>
          {isVoiceChatActive && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Conectada</span>
            </div>
          )}
        </div>
      </div>

      {/* Clara Video Container - Maximum Height */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 p-4">
          {/* Video Frame - Full available space */}
          <div className="w-full h-full bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-slate-200/40 relative">
            <div className="w-full h-full relative">
              {stream ? (
                <AvatarVideo
                  ref={mediaStream}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
                  <div className="text-center space-y-4">
                    <Video className="w-12 h-12 text-slate-400 mx-auto" />
                    <p className="text-slate-600">Iniciando video...</p>
                  </div>
                </div>
              )}

              {/* Voice Activity Indicators Over Video */}
              {isUserTalking && (
                <div className="absolute top-6 left-6">
                  <div className="bg-green-500/90 backdrop-blur-md text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg border border-green-400/30">
                    <Mic className="w-3 h-3" />
                    <span className="text-xs font-medium">Te escucho</span>
                  </div>
                </div>
              )}

              {isAvatarTalking && (
                <div className="absolute top-6 right-6">
                  <div className="bg-blue-500/90 backdrop-blur-md text-white text-sm px-3 py-1.5 rounded-full shadow-lg border border-blue-400/30">
                    <span className="text-xs font-medium">Clara respondiendo</span>
                  </div>
                </div>
              )}

              {/* Bottom Controls Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex flex-col items-center space-y-4">
                  {/* Voice Interface Button */}
                  {isVoiceMode && (
                    <VoiceInterface isActive={true} />
                  )}

                  {/* End Call Button */}
                  <button
                    onClick={handleStopSession}
                    className="bg-red-500/90 hover:bg-red-500 backdrop-blur-md text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 active:scale-95 flex items-center gap-3 shadow-lg border border-red-400/30 min-h-[56px]"
                  >
                    <PhoneOff className="w-6 h-6" />
                    Terminar Llamada
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HelpAssistantWidgetMobile() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <ClaraWidgetMobile />
    </StreamingAvatarProvider>
  );
}