"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Mic, ArrowLeft, ChevronDown, MessageCircle, RotateCcw, MicOff, Video, VideoOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { useVoiceChat } from "@/hooks/use-voice-chat"
import { useHeyGenAvatar } from "@/hooks/use-heygen-avatar"
import { AvatarQuality } from "@heygen/streaming-avatar"

type WidgetState = "chat" | "voice" | "avatar" | "connecting"

interface Message {
  text: string
  isUser: boolean
  timestamp: Date
}

export default function HelpAssistantWidget() {
  const [state, setState] = useState<WidgetState>("chat")
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isMinimized, setIsMinimized] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const isMobile = useMobile()

  // Hook para chat de voz tradicional (STT + LLM)
  const {
    toggleRecording,
    isRecording,
    status: voiceStatus,
    error: voiceError,
  } = useVoiceChat({
    onMessage: (message, isUser) => {
      setMessages((prev) => [
        ...prev,
        {
          text: message,
          isUser,
          timestamp: new Date(),
        },
      ])
    },
    onError: (error) => {
      console.error("Voice chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          text: `Error: ${error}`,
          isUser: false,
          timestamp: new Date(),
        },
      ])
    },
  })

  // Hook para HeyGen Avatar
  const {
    initializeAvatar,
    startVoiceChat: startAvatarChat,
    speak: avatarSpeak,
    stopVoiceChat: stopAvatarChat,
    disconnect: disconnectAvatar,
    status: avatarStatus,
    error: avatarError,
    isReady: avatarReady,
    isSpeaking: avatarSpeaking,
    isListening: avatarListening,
    stream: avatarStream,
  } = useHeyGenAvatar({
    // Use proper defaults from the official demo
    avatarId: process.env.NEXT_PUBLIC_HEYGEN_AVATAR_ID || "Alessandra_Chair_Sitting_public",
    voiceId: process.env.NEXT_PUBLIC_HEYGEN_VOICE_ID || "1e080de3d73e4225a7454797a848bffe",
    quality: AvatarQuality.Medium,
    language: "es",
    onMessage: async (message, isUser) => {
      // Agregar mensaje del usuario
      setMessages((prev) => [
        ...prev,
        {
          text: message,
          isUser,
          timestamp: new Date(),
        },
      ])

      if (isUser) {
        // Procesar mensaje del usuario con LLM
        try {
          const response = await fetch("/api/voice-chat-avatar", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userText: message }),
          })

          const result = await response.json()

          if (result.success) {
            // Hacer que el avatar hable la respuesta
            await avatarSpeak(result.botResponse)

            // Agregar respuesta a los mensajes
            setMessages((prev) => [
              ...prev,
              {
                text: result.botResponse,
                isUser: false,
                timestamp: new Date(),
              },
            ])
          }
        } catch (error) {
          console.error("Error processing user message:", error)
        }
      }
    },
    onError: (error) => {
      console.error("Avatar error:", error)
      setMessages((prev) => [
        ...prev,
        {
          text: `Error del avatar: ${error}`,
          isUser: false,
          timestamp: new Date(),
        },
      ])
    },
    onStatusChange: (status) => {
      if (status === "ready" || status === "listening" || status === "speaking") {
        setState("avatar")
      } else if (status === "connecting") {
        setState("connecting")
      }
    },
  })

  const handleVoiceMode = () => {
    setState("voice")
    toggleRecording()
  }

  const handleAvatarMode = useCallback(async () => {
    setState("connecting")
    try {
      await startAvatarChat()
    } catch (error) {
      console.error("Failed to start avatar chat:", error)
      setState("chat")
    }
  }, [startAvatarChat])

  const handleReturnToChat = useCallback(async () => {
    if (isRecording) {
      toggleRecording()
    }
    if (state === "avatar") {
      await stopAvatarChat()
    }
    setState("chat")
  }, [isRecording, state, toggleRecording, stopAvatarChat])

  const handleMinimize = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setIsMinimized(true)
      setIsTransitioning(false)
    }, 300)
  }

  const handleMaximize = () => {
    setIsMinimized(false)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      const userMessage = {
        text: inputValue,
        isUser: true,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue("")

      // Simular respuesta del asistente
      setState("connecting")
      setTimeout(() => {
        setState("chat")
        setMessages((prev) => [
          ...prev,
          {
            text: "¡Perfecto! Estoy analizando tu consulta para darte la mejor recomendación de belleza. Para una experiencia más personalizada, puedes usar el modo de voz o avatar.",
            isUser: false,
            timestamp: new Date(),
          },
        ])
      }, 1500)
    }
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const messageContainer = document.getElementById("message-container")
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight
    }
  }, [messages])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectAvatar()
    }
  }, [disconnectAvatar])

  const widgetWidth = isMobile ? "w-full" : "w-full max-w-md"

  const getStatusText = () => {
    if (state === "voice") {
      switch (voiceStatus) {
        case "recording":
          return "Escuchando..."
        case "processing":
          return "Procesando..."
        case "speaking":
          return "Clara está respondiendo..."
        default:
          return "Toca para hablar con Clara"
      }
    }

    if (state === "avatar") {
      switch (avatarStatus) {
        case "connecting":
          return "Conectando avatar..."
        case "ready":
          return "Avatar listo - Habla conmigo"
        case "listening":
          return "Avatar escuchando..."
        case "speaking":
          return "Clara está hablando..."
        default:
          return "Iniciando avatar..."
      }
    }

    return "Conectando..."
  }

  const isVoiceActive = voiceStatus !== "idle" || avatarStatus !== "disconnected"

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
            {isVoiceActive && (
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
              state === "voice"
                ? "bg-gradient-to-b from-green-50/20 to-blue-50/10"
                : state === "avatar"
                  ? "bg-gradient-to-b from-purple-50/20 to-pink-50/10"
                  : state === "connecting"
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
                  {isVoiceActive && (
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.05)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.02)"
                }}
                aria-label="Minimizar widget"
                title="Minimizar"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div
              id="message-container"
              className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
            >
              {state === "chat" && messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500/60">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">Inicia una conversación</p>
                  </div>
                </div>
              )}

              {(state === "chat" || state === "voice" || state === "avatar") && messages.length > 0 && (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.isUser ? "justify-end" : "items-start gap-2"}`}>
                      {!message.isUser && (
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
                          message.isUser
                            ? "text-white user-message-refraction"
                            : "text-gray-800/90 assistant-message-refraction",
                        )}
                        style={
                          message.isUser
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
                        {!message.isUser && (
                          <div className="absolute inset-0 pointer-events-none message-refraction-effect rounded-2xl"></div>
                        )}
                        <span className="relative z-10">{message.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(state === "voice" || state === "avatar") && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  {/* Mostrar el video del avatar si hay stream */}
                  {state === "avatar" && avatarStream && (
                    <div className="relative w-full max-w-sm mb-4">
                      <video
                        autoPlay
                        muted
                        playsInline
                        className="w-full aspect-video rounded-xl shadow-lg"
                        ref={(el) => {
                          if (el && avatarStream) {
                            el.srcObject = avatarStream
                            el.onloadedmetadata = () => {
                              el.play().catch(console.error)
                            }
                          }
                        }}
                      />
                      {!avatarReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                          <div className="text-white text-sm">Cargando avatar...</div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    {state === "voice" ? (
                      <Mic
                        className={cn("w-5 h-5", voiceStatus === "recording" ? "text-green-600" : "text-gray-600/80")}
                      />
                    ) : (
                      <Video className={cn("w-5 h-5", avatarListening ? "text-green-600" : "text-purple-600/80")} />
                    )}
                    <span className="text-gray-600/80">{state === "voice" ? "Modo voz" : "Modo avatar"}</span>
                    {isVoiceActive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                  </div>
                  <h2 className="text-xl font-medium mb-4 text-gray-800/90">{getStatusText()}</h2>

                  {/* Voice Activity Indicators */}
                  {(voiceStatus === "recording" || avatarListening) && (
                    <div className="flex items-center gap-1 mb-8">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-8 bg-green-500/60 rounded-full animate-pulse"
                          style={{
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: "0.8s",
                          }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {(voiceStatus === "speaking" || avatarSpeaking) && (
                    <div className="flex items-center gap-1 mb-8">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-blue-500/60 rounded-full animate-bounce"
                          style={{
                            height: `${Math.random() * 20 + 10}px`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: "0.6s",
                          }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {voiceStatus === "processing" && (
                    <div className="animate-spin mb-4">
                      <RotateCcw className="w-6 h-6 text-gray-600/80" />
                    </div>
                  )}

                  <div
                    className="w-full border-t border-dashed mt-4"
                    style={{ borderColor: "rgba(255, 255, 255, 0.3)" }}
                  ></div>

                  {(voiceError || avatarError) && (
                    <div className="mt-4 p-3 bg-red-100/20 border border-red-200/30 rounded-lg">
                      <p className="text-red-600/80 text-sm">{voiceError || avatarError}</p>
                    </div>
                  )}
                </div>
              )}

              {state === "connecting" && (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin mb-4">
                    <RotateCcw className="w-6 h-6 text-gray-600/80" />
                  </div>
                  <p className="text-gray-600/80">Conectando con el asistente...</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {state === "chat" && (
              <div className="p-4 space-y-2">
                <div
                  className="flex items-center justify-center w-full rounded-full backdrop-blur-2xl px-4 py-3 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                  style={{
                    background: "rgba(255, 255, 255, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                  }}
                  onClick={handleVoiceMode}
                >
                  <Mic className="w-5 h-5 text-gray-700 mr-2" />
                  <span className="text-gray-800 font-medium">Llamada de voz con Clara</span>
                </div>

                <div
                  className="flex items-center justify-center w-full rounded-full backdrop-blur-2xl px-4 py-3 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                  style={{
                    background: "rgba(147, 51, 234, 0.2)",
                    border: "1px solid rgba(147, 51, 234, 0.3)",
                    boxShadow: "0 8px 16px rgba(147, 51, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                  }}
                  onClick={handleAvatarMode}
                >
                  <Video className="w-5 h-5 text-purple-700 mr-2" />
                  <span className="text-purple-800 font-medium">Video llamada con Clara</span>
                </div>
              </div>
            )}

            {(state === "voice" || state === "avatar") && (
              <div
                className="grid grid-cols-2 gap-2 p-2 backdrop-blur-3xl border-t"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                }}
              >
                <button
                  onClick={state === "voice" ? toggleRecording : handleMuteToggle}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 backdrop-blur-2xl rounded-xl transition-all duration-200 hover:scale-[1.02]",
                    isRecording || isMuted ? "bg-red-500/20 border-red-300/30" : "",
                  )}
                  style={{
                    background: isRecording || isMuted ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.25)",
                    border:
                      isRecording || isMuted
                        ? "1px solid rgba(239, 68, 68, 0.3)"
                        : "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                  }}
                >
                  {state === "voice" ? (
                    <>
                      {isRecording ? (
                        <MicOff className="w-5 h-5 text-red-600/90" />
                      ) : (
                        <Mic className="w-5 h-5 text-gray-700/90" />
                      )}
                      <span className="text-gray-700/90">{isRecording ? "Detener" : "Hablar"}</span>
                    </>
                  ) : (
                    <>
                      {isMuted ? (
                        <VideoOff className="w-5 h-5 text-red-600/90" />
                      ) : (
                        <Video className="w-5 h-5 text-gray-700/90" />
                      )}
                      <span className="text-gray-700/90">{isMuted ? "Activar" : "Silenciar"}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleReturnToChat}
                  className="flex items-center justify-center gap-2 py-3 backdrop-blur-2xl rounded-xl transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: "rgba(255, 255, 255, 0.25)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                  }}
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700/90" />
                  <span className="text-gray-700/90">Volver al chat</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
