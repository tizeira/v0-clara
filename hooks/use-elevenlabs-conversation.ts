"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface ConversationOptions {
  agentId: string
  onMessage?: (message: string, isUser: boolean) => void
  onError?: (error: string) => void
  onStatusChange?: (status: ConnectionStatus) => void
}

type ConnectionStatus = "disconnected" | "connecting" | "connected"

export function useElevenLabsConversation({ agentId, onMessage, onError, onStatusChange }: ConversationOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected")

  const conversationRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  const updateConnectionStatus = useCallback(
    (status: ConnectionStatus) => {
      setConnectionStatus(status)
      onStatusChange?.(status)
    },
    [onStatusChange],
  )

  const startConversation = useCallback(async () => {
    try {
      setError(null)
      updateConnectionStatus("connecting")

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      // For demo purposes, we'll simulate the ElevenLabs conversation
      // In a real implementation, you would use:
      // const { Conversation } = await import('@elevenlabs/client')
      // const conversation = await Conversation.startSession({ agentId })

      // Simulate connection
      setTimeout(() => {
        setIsConnected(true)
        setIsListening(true)
        updateConnectionStatus("connected")

        onMessage?.("¡Hola! Ahora estamos conectados por voz. Puedes hablar conmigo directamente.", false)

        // Simulate voice activity detection
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

        conversationRef.current = {
          interval: activityInterval,
          endSession: () => {
            clearInterval(activityInterval)
            if (mediaStreamRef.current) {
              mediaStreamRef.current.getTracks().forEach((track) => track.stop())
            }
          },
        }
      }, 1500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al iniciar la conversación"
      setError(errorMessage)
      onError?.(errorMessage)
      updateConnectionStatus("disconnected")
    }
  }, [agentId, onMessage, onError, updateConnectionStatus])

  const endConversation = useCallback(async () => {
    try {
      if (conversationRef.current) {
        conversationRef.current.endSession()
        conversationRef.current = null
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
        mediaStreamRef.current = null
      }

      setIsConnected(false)
      setIsListening(false)
      setIsSpeaking(false)
      updateConnectionStatus("disconnected")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al finalizar la conversación"
      setError(errorMessage)
      onError?.(errorMessage)
    }
  }, [onError, updateConnectionStatus])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (conversationRef.current) {
        conversationRef.current.endSession()
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return {
    startConversation,
    endConversation,
    isConnected,
    isListening,
    isSpeaking,
    error,
    connectionStatus,
  }
}
