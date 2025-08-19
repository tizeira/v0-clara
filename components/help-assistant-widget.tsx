"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Mic, ArrowLeft, ChevronDown, MessageCircle, RotateCcw, Send, MicOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

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
      text: "Hola ✨ Soy Clara, tu asistente en Beta. Me entrené con pasión por la cosmética para ayudarte a descubrir lo mejor para tu piel. Puedo guiarte paso a paso según tu tipo de piel, tus objetivos o simplemente recomendarte productos que te hagan sentir increíble. ¿Te gustaría empezar con una recomendación personalizada?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isMinimized, setIsMinimized] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const isMobile = useMobile()

  const handleVoiceMode = () => {
    setState("connecting")
    // Simular conexión
    setTimeout(() => {
      setIsConnected(true)
      setIsListening(true)
      setMessages((prev) => [
        ...prev,
        {
          text: "¡Hola! ✨ Ahora estamos conectados por voz. Cuéntame sobre tu tipo de piel, tus preocupaciones o qué productos te interesan, y te daré recomendaciones personalizadas.",
          isUser: false,
          timestamp: new Date(),
        },
      ])
      setState("voice")

      // Simular actividad de voz
      const activityInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          setIsListening(false)
          setIsSpeaking(true)
          setTimeout(
            () => {
              setIsSpeaking(false)
              setIsListening(true)
            },
            2000 + Math.random() * 3000,
          )
        }
      }, 5000)

      // Limpiar después de 30 segundos para demo
      setTimeout(() => {
        clearInterval(activityInterval)
      }, 30000)
    }, 1500)
  }

  const handleReturnToChat = () => {
    setIsConnected(false)
    setIsListening(false)
    setIsSpeaking(false)
    setState("chat")
  }

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
            text: "¡Perfecto! Estoy analizando tu consulta para darte la mejor recomendación de belleza. Para una experiencia más personalizada, puedes usar el modo de voz y contarme más detalles sobre tu piel.",
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

  const widgetWidth = isMobile ? "w-full" : "w-full max-w-md"

  const getVoiceStatusText = () => {
    if (state === "connecting") return "Conectando..."
    if (isConnected && isSpeaking) return "El asistente está hablando..."
    if (isConnected && isListening) return "Escuchando..."
    if (isConnected) return "Listo para conversar"
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
                    placeholder="Pregúntame sobre productos de belleza, rutinas de skincare..."
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
