"use client"

import { useState, useCallback, useRef } from "react"

interface VoiceChatOptions {
  onMessage?: (message: string, isUser: boolean) => void
  onError?: (error: string) => void
  onStatusChange?: (status: VoiceStatus) => void
}

type VoiceStatus = "idle" | "recording" | "processing" | "speaking"

export function useVoiceChat({ onMessage, onError, onStatusChange }: VoiceChatOptions) {
  const [status, setStatus] = useState<VoiceStatus>("idle")
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const updateStatus = useCallback(
    (newStatus: VoiceStatus) => {
      setStatus(newStatus)
      onStatusChange?.(newStatus)
    },
    [onStatusChange],
  )

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      updateStatus("recording")

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        await processAudio(audioBlob)

        // Detener el stream
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al acceder al micrófono"
      setError(errorMessage)
      onError?.(errorMessage)
      updateStatus("idle")
    }
  }, [onError, updateStatus])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      updateStatus("processing")
    }
  }, [isRecording, updateStatus])

  const processAudio = useCallback(
    async (audioBlob: Blob) => {
      try {
        // Convertir blob a base64
        const arrayBuffer = await audioBlob.arrayBuffer()
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

        // Enviar al API
        const response = await fetch("/api/voice-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audioBase64: base64Audio,
          }),
        })

        if (!response.ok) {
          throw new Error("Error en el servidor")
        }

        const result = await response.json()

        if (result.success) {
          // Mostrar mensaje del usuario
          onMessage?.(result.userText, true)

          // Simular que el asistente está hablando
          updateStatus("speaking")

          // Mostrar respuesta del bot después de un delay
          setTimeout(() => {
            onMessage?.(result.botResponse, false)
            updateStatus("idle")
          }, 1000)
        } else {
          throw new Error(result.error || "Error procesando audio")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error procesando audio"
        setError(errorMessage)
        onError?.(errorMessage)
        updateStatus("idle")
      }
    },
    [onMessage, onError, updateStatus],
  )

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  return {
    startRecording,
    stopRecording,
    toggleRecording,
    isRecording,
    status,
    error,
  }
}
