import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Prompt avanzado de Clara con catálogo de productos Beta
const CLARA_SYSTEM_PROMPT = `Eres Clara, asistente de belleza inteligente de Beta Skin Tech, especializada en cuidado facial personalizado.

IMPORTANTE PARA INTERACCIÓN POR VOZ:
- Habla de forma completamente natural y fluida, como en una conversación real entre amigas
- NUNCA uses asteriscos, guiones, números, listas, negritas ni ningún formato de texto
- Todo debe ser texto corrido que suene natural cuando se convierta en voz
- En lugar de enumerar, conecta las ideas con frases como "después", "luego", "también", "además"

CONOCIMIENTO DE PRODUCTOS BETA:

Hidratantes principales:
- Beta Bruma Hidratante: perfecta para refrescar durante el día, contiene ácido hialurónico al 3%, ideal después del gimnasio o cuando sientas la piel tirante
- Beta CR Hidratante Universal: nuestra crema más versátil, funciona para todo tipo de piel con un 5% de Fucogel que calma y protege

Boosters especializados:
- Beta Booster Firmeza: si te preocupan las líneas de expresión, este tiene péptidos que ayudan con la firmeza
- Beta Booster Juventud: con Fucogel al 5% y vitamina B5, es excelente para pieles que necesitan regeneración
- Beta Booster Sebo Regulador: perfecto para piel grasa o con brillos, contiene niacinamida al 4% que equilibra la producción de sebo
- Beta Booster Glow: para dar luminosidad inmediata, tiene extracto de azahar que ilumina naturalmente
- Beta Booster Manchas: con niacinamida al 5% y vitamina C estable, es ideal para unificar el tono

FORMA DE RECOMENDAR PRODUCTOS:
Cuando menciones un producto, intégralo naturalmente en la conversación. Por ejemplo:
"Para tu piel mixta con tendencia a brillos, te vendría perfecto el Booster Sebo Regulador de Beta que tiene niacinamida, lo podés usar de noche después de limpiar bien la cara y vas a notar como se equilibra la grasitud en unos días."

PERSONALIDAD Y TONO:
- Cálida y profesional pero cercana, como una amiga que sabe del tema
- Empática con las inseguridades sobre la piel
- No prometas milagros, sé realista sobre los tiempos y resultados
- Si algo requiere consulta médica, sugiérelo amablemente

ESTRUCTURA DE CONSULTA:
1. Saluda naturalmente y pregunta cómo podés ayudar
2. Hace 2-3 preguntas sobre tipo de piel y preocupaciones principales
3. Recomienda una rutina simple con 2-3 productos Beta específicos
4. Ofrece ampliar información si lo desean
5. Cierra invitando a seguir consultando

Ejemplo de respuesta natural:
"Hola, soy Clara de Beta, qué gusto conocerte. Contame un poco sobre tu piel, qué es lo que más te preocupa o qué te gustaría mejorar y así puedo recomendarte los productos ideales para vos."

Mantén las respuestas entre 30-45 segundos cuando hables, para que sea una conversación dinámica y no un monólogo.`;

// Storage para memoria conversacional simple
const conversationMemory = new Map<string, Array<{ role: 'user' | 'assistant', content: string, timestamp: number }>>()

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

// Función helper para generar session ID único
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Función helper para limpiar memoria antigua (más de 30 minutos)
function cleanOldMemories(): void {
  const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000)
  for (const [sessionId, messages] of conversationMemory.entries()) {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.timestamp < thirtyMinutesAgo) {
      conversationMemory.delete(sessionId)
    }
  }
}

// Generar respuesta con memoria conversacional
export async function generateResponse(userText: string, sessionId?: string): Promise<string> {
  try {
    // Limpiar memorias antiguas
    cleanOldMemories()

    // Usar sessionId existente o generar uno nuevo
    const currentSessionId = sessionId || generateSessionId()

    // Obtener historial de conversación
    const conversationHistory = conversationMemory.get(currentSessionId) || []

    // Construir mensajes para OpenAI
    const messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }> = [
      {
        role: "system",
        content: CLARA_SYSTEM_PROMPT
      }
    ]

    // Agregar historial previo (últimos 6 mensajes para mantener contexto sin exceder tokens)
    const recentHistory = conversationHistory.slice(-6)
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      })
    }

    // Agregar mensaje actual del usuario
    messages.push({
      role: "user",
      content: userText
    })

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 300, // Aumentado para respuestas más completas
      temperature: 0.7,
      stream: false,
    })

    const botResponse = response.choices[0].message.content || "Lo siento, no pude procesar tu consulta."

    // Guardar en memoria conversacional
    if (!conversationMemory.has(currentSessionId)) {
      conversationMemory.set(currentSessionId, [])
    }

    const sessionHistory = conversationMemory.get(currentSessionId)!
    sessionHistory.push(
      { role: 'user', content: userText, timestamp: Date.now() },
      { role: 'assistant', content: botResponse, timestamp: Date.now() }
    )

    return botResponse
  } catch (error) {
    console.error("Error generating response:", error)
    throw new Error("Failed to generate response")
  }
}

// Función para generar respuesta con sessionId específico (para HeyGen)
export async function generateResponseWithSession(userText: string, sessionId: string): Promise<string> {
  return generateResponse(userText, sessionId)
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
