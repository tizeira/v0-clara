"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Mic, ArrowLeft, Minus, MessageCircle, RotateCcw, Send, MicOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { useElevenLabsConversation } from "@/hooks/use-elevenlabs-conversation"

type WidgetState = "chat" | "voice" | "connecting"

interface Message {
  text: string
  isUser: boolean
  timestamp: Date
}

export default function HelpAssistantWidget() {
  const [state, setState] = useState<WidgetState>("chat")
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "¡Hola! Soy tu asistente del Centro de ayuda virtual. Puedo ayudarte a encontrar la información que necesites o a conectarte con nuestro equipo de atención al cliente. ¿Cómo puedo ayudarte?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isMinimized, setIsMinimized] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const isMobile = useMobile()

  const { startConversation, endConversation, isConnected, isListening, isSpeaking, error, connectionStatus } =
    useElevenLabsConversation({
      agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "your-agent-id",
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
        console.error("Conversation error:", error)
        setMessages((prev) => [
          ...prev,
          {
            text: "Lo siento, ha ocurrido un error en la conversación. Por favor, inténtalo de nuevo.",
            isUser: false,
            timestamp: new Date(),
          },
        ])
      },
    })

  const handleVoiceMode = useCallback(async () => {
    setState("connecting")
    try {
      await startConversation()
      setState("voice")
    } catch (error) {
      console.error("Failed to start voice conversation:", error)
      setState("chat")
      setMessages((prev) => [
        ...prev,
        {
          text: "No se pudo iniciar la conversación por voz. Por favor, verifica que el micrófono esté habilitado.",
          isUser: false,
          timestamp: new Date(),
        },
      ])
    }
  }, [startConversation])

  const handleReturnToChat = useCallback(async () => {
    await endConversation()
    setState("chat")
  }, [endConversation])

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      const userMessage = {
        text: inputValue,
        isUser: true,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue("")

      // Simulate AI response for text chat
      setState("connecting")
      setTimeout(() => {
        setState("chat")
        setMessages((prev) => [
          ...prev,
          {
            text: "Gracias por tu pregunta. Estoy procesando la información para ayudarte mejor. Para una experiencia más interactiva, puedes usar el modo de voz.",
            isUser: false,
            timestamp: new Date(),
          },
        ])
      }, 1500)
    }
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
    // Here you would implement actual muting logic with the ElevenLabs SDK
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const messageContainer = document.getElementById("message-container")
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight
    }
  }, [messages])

  const widgetWidth = isMobile ? "w-full" : "w-full max-w-md"

  const getVoiceStatusText = () => {
    if (connectionStatus === "connecting") return "Conectando..."
    if (connectionStatus === "connected" && isSpeaking) return "El asistente está hablando..."
    if (connectionStatus === "connected" && isListening) return "Escuchando..."
    if (connectionStatus === "connected") return "Listo para conversar"
    return "Haz una pregunta"
  }

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
            {isConnected && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
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
                  {isConnected && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white animate-pulse"></div>
                  )}
                </div>
                <h1 className="text-base font-medium text-gray-800/90">Asistente del centro de ayuda</h1>
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
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div
              id="message-container"
              className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
            >
              {state === "chat" && (
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

              {state === "voice" && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className={cn("w-5 h-5", isListening ? "text-green-600" : "text-gray-600/80")} />
                    <span className="text-gray-600/80">Modo voz</span>
                    {isConnected && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                  </div>
                  <h2 className="text-xl font-medium mb-4 text-gray-800/90">{getVoiceStatusText()}</h2>

                  {/* Voice Activity Indicator */}
                  {isListening && (
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

                  {isSpeaking && (
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

                  <div
                    className="w-full border-t border-dashed mt-4"
                    style={{ borderColor: "rgba(255, 255, 255, 0.3)" }}
                  ></div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-100/20 border border-red-200/30 rounded-lg">
                      <p className="text-red-600/80 text-sm">{error}</p>
                    </div>
                  )}
                </div>
              )}

              {state === "connecting" && (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin mb-4">
                    <RotateCcw className="w-6 h-6 text-gray-600/80" />
                  </div>
                  <p className="text-gray-600/80">
                    {connectionStatus === "connecting" ? "Conectando con el asistente..." : "Conectando..."}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {state === "chat" ? (
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t backdrop-blur-3xl"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                }}
              >
                <div
                  className="flex items-center w-full rounded-full backdrop-blur-2xl px-3 transition-all duration-200"
                  style={{
                    background: "rgba(255, 255, 255, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Pregunta cualquier cosa al asistente..."
                    className="flex-1 py-3 px-1 bg-transparent focus:outline-none text-gray-800/90 placeholder-gray-600/60"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  {inputValue.trim() ? (
                    <button
                      type="submit"
                      className="p-2 text-gray-700 hover:text-gray-900 transition-colors rounded-full"
                      style={{
                        background: "rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVoiceMode}
                      className="p-2 text-gray-700 hover:text-gray-900 transition-colors rounded-full"
                      style={{
                        background: "rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div
                className="grid grid-cols-2 gap-2 p-2 backdrop-blur-3xl border-t"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                }}
              >
                <button
                  onClick={handleMuteToggle}
                  className="flex items-center justify-center gap-2 py-3 backdrop-blur-2xl rounded-xl transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: "rgba(255, 255, 255, 0.25)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                  }}
                >
                  {isMuted ? (
                    <MicOff className="w-5 h-5 text-red-600/90" />
                  ) : (
                    <Mic className="w-5 h-5 text-gray-700/90" />
                  )}
                  <span className="text-gray-700/90">{isMuted ? "Activar" : "Silenciar"}</span>
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
