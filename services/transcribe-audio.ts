import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function transcribeAudio(audioBase64: string): Promise<string> {
  try {
    // Convertir base64 a buffer
    const buffer = Buffer.from(audioBase64, "base64")

    // Crear un archivo temporal en memoria para Whisper
    const audioFile = new File([buffer], "audio.webm", { type: "audio/webm" })

    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "es", // Español para Clara
      response_format: "text",
    })

    return response
  } catch (error) {
    console.error("Error transcribing audio:", error)
    throw new Error("Failed to transcribe audio")
  }
}

export async function generateResponse(userText: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres Clara, una asistente especializada en belleza y cosmética. 
          Respondes de forma amigable, personalizada y con conocimiento experto sobre:
          - Rutinas de skincare
          - Productos de belleza
          - Tipos de piel
          - Recomendaciones personalizadas
          - Tendencias en cosmética
          
          Mantén un tono cálido, profesional y usa emojis ocasionalmente. 
          Responde en español y de forma concisa pero útil.`,
        },
        { role: "user", content: userText },
      ],
      max_tokens: 200,
      temperature: 0.7,
      stream: false,
    })

    return response.choices[0].message.content || "Lo siento, no pude procesar tu consulta."
  } catch (error) {
    console.error("Error generating response:", error)
    throw new Error("Failed to generate response")
  }
}

// Función para procesar audio completo (STT + LLM)
export async function processVoiceInput(audioBase64: string): Promise<{
  userText: string
  botResponse: string
}> {
  try {
    // 1. Transcribir audio
    const userText = await transcribeAudio(audioBase64)

    // 2. Generar respuesta con LLM
    const botResponse = await generateResponse(userText)

    return {
      userText,
      botResponse,
    }
  } catch (error) {
    console.error("Error processing voice input:", error)
    throw error
  }
}
