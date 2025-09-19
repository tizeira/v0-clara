import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
  TaskMode,
  VoiceEmotion,
  STTProvider,
} from "@heygen/streaming-avatar"

interface AvatarConfig {
  token: string
  avatarId?: string
  voiceId?: string
  quality?: AvatarQuality
  language?: string
  // URL base para apuntar a distintos entornos de HeyGen (opcional)
  basePath?: string
}

interface AvatarCallbacks {
  onReady?: () => void
  onStartTalking?: () => void
  onStopTalking?: () => void
  onError?: (error: string) => void
  onUserMessage?: (message: string) => void
  onStream?: (stream: MediaStream) => void
}

export class HeyGenAvatarService {
  private avatar: StreamingAvatar | null = null
  private isInitialized = false
  private callbacks: AvatarCallbacks = {}
  private stream: MediaStream | null = null

  constructor(
    private config: AvatarConfig,
    callbacks: AvatarCallbacks = {},
  ) {
    this.callbacks = callbacks
  }

  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return

      this.avatar = new StreamingAvatar({
        token: this.config.token,
        basePath: this.config.basePath,
      })

      // Configurar event listeners
      this.setupEventListeners()

      // Crear y iniciar avatar
      await this.avatar.createStartAvatar({
        quality: this.config.quality || AvatarQuality.Medium,
        avatarName: this.config.avatarId || "Alessandra_Chair_Sitting_public",
        voice: {
          voiceId: this.config.voiceId || "1e080de3d73e4225a7454797a848bffe",
          rate: 1.0,
          emotion: VoiceEmotion.FRIENDLY,
        },
        sttSettings: {
          provider: STTProvider.DEEPGRAM,
          confidence: 0.6,
        },
        language: this.config.language || "es",
      })

      this.isInitialized = true
    } catch (error) {
      console.error("Error initializing HeyGen avatar:", error)
      this.callbacks.onError?.(`Error al inicializar avatar: ${error}`)
      throw error
    }
  }

  private setupEventListeners(): void {
    if (!this.avatar) return

    this.avatar.on(StreamingEvents.STREAM_READY, ({ detail }) => {
      console.log("Avatar stream ready")
      this.stream = detail as MediaStream
      this.callbacks.onStream?.(this.stream)
      this.callbacks.onReady?.()
    })

    this.avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
      console.log("Avatar started talking")
      this.callbacks.onStartTalking?.()
    })

    this.avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
      console.log("Avatar stopped talking")
      this.callbacks.onStopTalking?.()
    })

    this.avatar.on(StreamingEvents.USER_START, () => {
      console.log("User started speaking")
    })

    this.avatar.on(StreamingEvents.USER_STOP, (event) => {
      console.log("User stopped speaking:", event)
      if (event.userInput) {
        this.callbacks.onUserMessage?.(event.userInput)
      }
    })

    this.avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log("Avatar stream disconnected")
      this.isInitialized = false
      this.stream = null
    })
  }

  async startVoiceChat(): Promise<void> {
    if (!this.avatar || !this.isInitialized) {
      throw new Error("Avatar not initialized")
    }

    try {
      await this.avatar.startVoiceChat({
        // Algunos SDK solo aceptan 'isInputAudioMuted' en las opciones
        isInputAudioMuted: false,
      })
    } catch (error) {
      console.error("Error starting voice chat:", error)
      this.callbacks.onError?.(`Error al iniciar chat de voz: ${error}`)
      throw error
    }
  }

  async speak(text: string): Promise<void> {
    if (!this.avatar || !this.isInitialized) {
      throw new Error("Avatar not initialized")
    }

    try {
      await this.avatar.speak({
        text,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC,
      })
    } catch (error) {
      console.error("Error making avatar speak:", error)
      this.callbacks.onError?.(`Error al hacer hablar al avatar: ${error}`)
      throw error
    }
  }

  async stopVoiceChat(): Promise<void> {
    if (!this.avatar) return

    try {
      await this.avatar.closeVoiceChat()
    } catch (error) {
      console.error("Error stopping voice chat:", error)
    }
  }

  async destroy(): Promise<void> {
    if (!this.avatar) return

    try {
      await this.avatar.stopAvatar()
      this.avatar = null
      this.isInitialized = false
    } catch (error) {
      console.error("Error destroying avatar:", error)
    }
  }

  async keepAlive(): Promise<void> {
    if (!this.avatar) return

    try {
      await this.avatar.keepAlive()
    } catch (error) {
      console.error("Error keeping avatar alive:", error)
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.avatar !== null
  }

  getStream(): MediaStream | null {
    return this.stream
  }
}

// Función helper para crear token de sesión
export async function createHeyGenToken(apiKey: string): Promise<string> {
  try {
    const baseApiUrl =
      process.env.NEXT_PUBLIC_BASE_API_URL?.replace(/\/$/, "") ||
      "https://api.heygen.com"

    const response = await fetch(`${baseApiUrl}/v1/streaming.create_token`, {
      method: "POST",
      headers: {
        // Header estándar según la demo y docs
        "x-api-key": apiKey,
      },
    })

    if (!response.ok) {
      // Intentar extraer detalle del error para el log del servidor
      let detail = ""
      try {
        const errBody = await response.json()
        detail = JSON.stringify(errBody)
      } catch {
        try {
          detail = await response.text()
        } catch {
          detail = "<no-body>"
        }
      }
      throw new Error(`HeyGen token request failed: ${response.status} ${response.statusText} - ${detail}`)
    }

    const data = await response.json()
    return data.data.token
  } catch (error) {
    console.error("Error creating HeyGen token:", error)
    throw new Error("Failed to create HeyGen session token")
  }
}
