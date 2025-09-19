import { type NextRequest, NextResponse } from "next/server"
import { generateResponse } from "@/services/transcribe-audio"

export async function POST(request: NextRequest) {
  try {
    const { userText } = await request.json()

    if (!userText) {
      return NextResponse.json({ error: "User text is required" }, { status: 400 })
    }

    // Solo generar respuesta con LLM (no STT porque HeyGen maneja eso)
    const botResponse = await generateResponse(userText)

    return NextResponse.json({
      success: true,
      botResponse,
    })
  } catch (error) {
    console.error("Voice chat avatar API error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
