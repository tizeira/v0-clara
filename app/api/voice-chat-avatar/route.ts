import { type NextRequest, NextResponse } from "next/server"
import { generateResponseWithSession } from "@/services/transcribe-audio"

export async function POST(request: NextRequest) {
  try {
    const { userText, sessionId } = await request.json()

    if (!userText) {
      return NextResponse.json({ error: "User text is required" }, { status: 400 })
    }

    // Generar respuesta con memoria conversacional
    // Si no hay sessionId, la función genera uno nuevo automáticamente
    const botResponse = await generateResponseWithSession(userText, sessionId || `heygen_${Date.now()}`)

    return NextResponse.json({
      success: true,
      botResponse,
      sessionId: sessionId || `heygen_${Date.now()}`, // Devolver sessionId para mantener contexto
    })
  } catch (error) {
    console.error("Voice chat avatar API error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
