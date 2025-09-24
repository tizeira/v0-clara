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
  avatarName: "Alessandra_Chair_Sitting_public",
  knowledgeId: "251ae2b8b812448d9d03efbc354c9b98",
  voice: {
    voiceId: "ab9346d254a94ed8a4e662da7a5972d6",
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

  return (
    <div className="w-full space-y-6">
      {/* Landing State - Before connection */}
      {sessionState === StreamingAvatarSessionState.INACTIVE && (
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Video className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Habla con Clara
            </h2>
            <p className="text-sm text-slate-600 max-w-xs mx-auto">
              Tu consultora virtual de skincare está lista para ayudarte con recomendaciones personalizadas
            </p>
          </div>

          {/* Main CTA Button */}
          <button
            onClick={() => startSession(true)}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Iniciar Llamada con Clara
          </button>

          {/* Secondary option */}
          <button
            onClick={() => startSession(false)}
            className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <Video className="w-5 h-5" />
            Iniciar Chat de Video
          </button>
        </div>
      )}

      {/* Connecting State */}
      {sessionState === StreamingAvatarSessionState.CONNECTING && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">Conectando...</h3>
            <p className="text-sm text-slate-600">Iniciando video llamada con Clara</p>
          </div>
        </div>
      )}

      {/* Connected State - Video Active */}
      {sessionState === StreamingAvatarSessionState.CONNECTED && (
        <div className="space-y-4">
          {/* Status */}
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">{getStatusText()}</p>
            {isVoiceChatActive && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Conectada</span>
              </div>
            )}
          </div>

          {/* Video Container - Fixed size for mobile */}
          <div className="relative">
            <div className="w-full max-w-[280px] mx-auto bg-slate-100 rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-[4/3] relative">
                {stream ? (
                  <AvatarVideo
                    ref={mediaStream}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50">
                    <div className="text-center space-y-2">
                      <Video className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-500">Iniciando video...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Voice activity indicators */}
            {isUserTalking && (
              <div className="absolute top-2 left-2">
                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Mic className="w-3 h-3" />
                  Hablando
                </div>
              </div>
            )}

            {isAvatarTalking && (
              <div className="absolute top-2 right-2">
                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Clara respondiendo
                </div>
              </div>
            )}
          </div>

          {/* Controls - Touch friendly */}
          <div className="space-y-3">
            {isVoiceMode && <VoiceInterface isActive={true} />}

            {/* End call button */}
            <button
              onClick={handleStopSession}
              className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <PhoneOff className="w-5 h-5" />
              Terminar Llamada
            </button>
          </div>
        </div>
      )}
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