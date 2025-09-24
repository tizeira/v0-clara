"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Mic, ArrowLeft, ChevronDown, MessageCircle, RotateCcw, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import {
  StreamingAvatarProvider,
  StreamingAvatarSessionState,
  useStreamingAvatarSession,
  useVoiceChat,
  useStreamingAvatarContext
} from "@/hooks/avatar"
import { AvatarVideo } from "@/components/avatar/AvatarVideo"
import { MessageHistory } from "@/components/avatar/MessageHistory"
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

function ClaraWidget() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } = useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { isVoiceChatActive } = useStreamingAvatarContext();

  const [isMinimized, setIsMinimized] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const mediaStream = useRef<HTMLVideoElement>(null);
  const isMobile = useMobile();

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

  const handleMinimize = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsMinimized(true);
      setIsTransitioning(false);
    }, 300);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
  };

  const handleStopSession = useCallback(async () => {
    await stopAvatar();
    setIsVoiceMode(false);
  }, [stopAvatar]);

  const widgetWidth = isMobile ? "w-full" : "w-full max-w-md";

  return (
    <>
      {/* Floating Button (when minimized) */}
      {isMinimized && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleMaximize}
            className="flex items-center justify-center w-16 h-16 backdrop-blur-3xl text-gray-700 rounded-full transition-all duration-300 hover:scale-105 glass-refraction floating-glass"
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow:
                "0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="absolute inset-0 pointer-events-none light-ray-animation rounded-full"></div>
            <MessageCircle className="w-7 h-7 relative z-10" />
            {isVoiceChatActive && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            )}
          </button>
        </div>
      )}

      {/* Main Widget (when expanded) */}
      {!isMinimized && (
        <div
          className={cn(
            widgetWidth,
            "mx-auto overflow-hidden rounded-3xl transition-all duration-300 glass-refraction",
            isTransitioning ? "scale-95 opacity-0" : "scale-100 opacity-100",
          )}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 32px 64px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
          }}
        >
          {/* Light refraction overlay */}
          <div className="absolute inset-0 pointer-events-none light-refraction-overlay rounded-3xl"></div>

          <div
            className={cn(
              "flex flex-col h-[600px] relative backdrop-blur-3xl glass-surface",
              sessionState === StreamingAvatarSessionState.CONNECTED && isVoiceMode
                ? "bg-gradient-to-b from-purple-50/20 to-pink-50/10"
                : sessionState === StreamingAvatarSessionState.CONNECTING
                  ? "bg-gradient-to-b from-purple-50/20 to-blue-50/10"
                  : "bg-gradient-to-b from-white/10 to-white/5",
            )}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 backdrop-blur-3xl border-b"
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                borderColor: "rgba(255, 255, 255, 0.15)",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center w-8 h-8 backdrop-blur-2xl rounded-full relative"
                  style={{
                    background: "rgba(0, 0, 0, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                  {isVoiceChatActive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white animate-pulse"></div>
                  )}
                </div>
                <h1 className="text-base font-medium text-gray-800/90">Clara – Asistente de Belleza de Beta</h1>
              </div>
              <button
                onClick={handleMinimize}
                className="flex items-center justify-center w-8 h-8 text-gray-600/80 hover:text-gray-800 rounded-full transition-all duration-200 hover:backdrop-blur-xl"
                style={{
                  background: "rgba(0, 0, 0, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                aria-label="Minimizar widget"
                title="Minimizar"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <div className="w-full h-full flex flex-col">
                {sessionState === StreamingAvatarSessionState.CONNECTED ? (
                  <div className="relative w-full flex-1 overflow-hidden flex flex-col">
                    <AvatarVideo ref={mediaStream} />
                  </div>
                ) : sessionState === StreamingAvatarSessionState.CONNECTING ? (
                  <div className="flex-1 flex items-center justify-center text-white">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin mb-4">
                        <RotateCcw className="w-8 h-8 text-gray-600/80" />
                      </div>
                      <span className="text-gray-600/80">Conectando con Clara...</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center bg-zinc-800/5 p-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800/90 mb-2">Clara AI Setup</h2>
                      <p className="text-gray-600/80 text-sm">Configura tu consulta de skincare</p>
                    </div>

                    <div className="flex flex-col gap-4 w-full max-w-md">
                      <div className="flex flex-col gap-2">
                        <label className="text-gray-600/80 text-sm">Avatar</label>
                        <div className="text-gray-800/90 text-sm bg-white/20 backdrop-blur-xl py-2 px-4 rounded-lg border border-white/30">
                          Clara - Skincare Expert
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-gray-600/80 text-sm">Voice</label>
                        <div className="text-gray-800/90 text-sm bg-white/20 backdrop-blur-xl py-2 px-4 rounded-lg border border-white/30">
                          Fernanda Olea (Spanish)
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-gray-600/80 text-sm">Knowledge Base</label>
                        <div className="text-gray-800/90 text-sm bg-white/20 backdrop-blur-xl py-2 px-4 rounded-lg border border-white/30">
                          Clara's Skincare Database
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row gap-4 mt-8">
                      <button
                        onClick={() => startSession(true)}
                        className="flex items-center gap-2 px-6 py-3 backdrop-blur-2xl text-white font-medium rounded-lg transition-all duration-200 hover:scale-105"
                        style={{
                          background: "rgba(147, 51, 234, 0.8)",
                          border: "1px solid rgba(147, 51, 234, 0.5)",
                          boxShadow: "0 8px 16px rgba(147, 51, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                        }}
                      >
                        <Mic className="w-5 h-5" />
                        Iniciar Chat de Voz
                      </button>
                      <button
                        onClick={() => startSession(false)}
                        className="flex items-center gap-2 px-6 py-3 backdrop-blur-2xl text-purple-800 font-medium rounded-lg transition-all duration-200 hover:scale-105"
                        style={{
                          background: "rgba(255, 255, 255, 0.25)",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                        }}
                      >
                        <Video className="w-5 h-5" />
                        Iniciar Chat de Texto
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Controls */}
            {sessionState === StreamingAvatarSessionState.CONNECTED && (
              <div
                className="flex flex-col gap-3 items-center justify-center p-4 border-t border-white/15 backdrop-blur-3xl"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                }}
              >
                {isVoiceMode ? (
                  <VoiceInterface isActive={true} />
                ) : (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleStopSession}
                      className="px-4 py-2 backdrop-blur-2xl text-red-600 font-medium rounded-lg transition-all duration-200 hover:scale-105"
                      style={{
                        background: "rgba(239, 68, 68, 0.2)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        boxShadow: "0 8px 16px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                      }}
                    >
                      Terminar Consulta
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Message History for text mode */}
            {sessionState === StreamingAvatarSessionState.CONNECTED && !isVoiceMode && (
              <div className="p-4 border-t border-white/15">
                <MessageHistory />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function HelpAssistantWidget() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <ClaraWidget />
    </StreamingAvatarProvider>
  );
}