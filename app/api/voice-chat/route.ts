import { type NextRequest, NextResponse } from "next/server"
import { processVoiceInput } from "@/services/transcribe-audio"

export async function POST(request: NextRequest) {
  try {
    const { audioBase64 } = await request.json()

    if (!audioBase64) {
      return NextResponse.json({ error: "Audio data is required" }, { status: 400 })
    }

    // Procesar audio: STT + LLM
    const result = await processVoiceInput(audioBase64)

    return NextResponse.json({
      success: true,
      userText: result.userText,
      botResponse: result.botResponse,
    })
  } catch (error) {
    console.error("Voice chat API error:", error)
    return NextResponse.json({ error: "Failed to process voice input" }, { status: 500 })
  }
}
