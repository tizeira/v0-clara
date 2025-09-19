"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { HeyGenAvatarService } from "@/services/heygen-avatar"
import type { AvatarQuality } from "@heygen/streaming-avatar"

interface UseHeyGenAvatarOptions {
  avatarId?: string
  voiceId?: string
  quality?: AvatarQuality
  language?: string
  onMessage?: (message: string, isUser: boolean) => void
  onError?: (error: string) => void
  onStatusChange?: (status: AvatarStatus) => void
}

type AvatarStatus = "disconnected" | "connecting" | "ready" | "speaking" | "listening"

export function useHeyGenAvatar({
  avatarId,
  voiceId,
  quality,
  language = "es-ES",
  onMessage,
  onError,
  onStatusChange,
}: UseHeyGenAvatarOptions) {
  const [status, setStatus] = useState<AvatarStatus>("disconnected")
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const avatarServiceRef = useRef<HeyGenAvatarService | null>(null)

  const updateStatus = useCallback(
    (newStatus: AvatarStatus) => {
      setStatus(newStatus)
      onStatusChange?.(newStatus)
    },
    [onStatusChange],
  )

  const initializeAvatar = useCallback(async () => {
    try {
      setError(null)
      updateStatus("connecting")

      // Obtener token de sesión
      const response = await fetch("/api/heygen-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to get HeyGen token")
      }

      const { token } = await response.json()

      // Crear servicio de avatar
      avatarServiceRef.current = new HeyGenAvatarService(
        {
          token,
          avatarId,
          voiceId,
          quality,
          language,
        },
        {
          onReady: () => {
            updateStatus("ready")
            setIsInitialized(true)
          },
          onStartTalking: () => {
            updateStatus("speaking")
          },
          onStopTalking: () => {
            updateStatus("listening")
          },
          onError: (error) => {
            setError(error)
            onError?.(error)
            updateStatus("disconnected")
          },
          onUserMessage: (message) => {
            onMessage?.(message, true)
          },
        },
      )

      // Inicializar avatar
      await avatarServiceRef.current.initialize()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      onError?.(errorMessage)
      updateStatus("disconnected")
    }
  }, [avatarId, voiceId, quality, language, onMessage, onError, updateStatus])

  const startVoiceChat = useCallback(async () => {
    if (!avatarServiceRef.current || !isInitialized) {
      await initializeAvatar()
    }

    try {
      await avatarServiceRef.current?.startVoiceChat()
      updateStatus("listening")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al iniciar chat de voz"
      setError(errorMessage)
      onError?.(errorMessage)
    }
  }, [initializeAvatar, isInitialized, onError, updateStatus])

  const speak = useCallback(
    async (text: string) => {
      if (!avatarServiceRef.current || !isInitialized) {
        throw new Error("Avatar not initialized")
      }

      try {
        await avatarServiceRef.current.speak(text)
        // El estado se actualiza automáticamente via eventos
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al hacer hablar al avatar"
        setError(errorMessage)
        onError?.(errorMessage)
      }
    },
    [isInitialized, onError],
  )

  const stopVoiceChat = useCallback(async () => {
    if (!avatarServiceRef.current) return

    try {
      await avatarServiceRef.current.stopVoiceChat()
      updateStatus("ready")
    } catch (err) {
      console.error("Error stopping voice chat:", err)
    }
  }, [updateStatus])

  const disconnect = useCallback(async () => {
    if (!avatarServiceRef.current) return

    try {
      await avatarServiceRef.current.destroy()
      avatarServiceRef.current = null
      setIsInitialized(false)
      updateStatus("disconnected")
    } catch (err) {
      console.error("Error disconnecting avatar:", err)
    }
  }, [updateStatus])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (avatarServiceRef.current) {
        avatarServiceRef.current.destroy()
      }
    }
  }, [])

  // Keep alive every 30 seconds
  useEffect(() => {
    if (!isInitialized || !avatarServiceRef.current) return

    const keepAliveInterval = setInterval(() => {
      avatarServiceRef.current?.keepAlive()
    }, 30000)

    return () => clearInterval(keepAliveInterval)
  }, [isInitialized])

  return {
    initializeAvatar,
    startVoiceChat,
    speak,
    stopVoiceChat,
    disconnect,
    status,
    error,
    isInitialized,
    isReady: status === "ready" || status === "listening",
    isSpeaking: status === "speaking",
    isListening: status === "listening",
  }
}
