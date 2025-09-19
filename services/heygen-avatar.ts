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
}

interface AvatarCallbacks {
  onReady?: () => void
  onStartTalking?: () => void
  onStopTalking?: () => void
  onError?: (error: string) => void
  onUserMessage?: (message: string) => void
}

export class HeyGenAvatarService {
  private avatar: StreamingAvatar | null = null
  private isInitialized = false
  private callbacks: AvatarCallbacks = {}

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

    this.avatar.on(StreamingEvents.STREAM_READY, () => {
      console.log("Avatar stream ready")
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
    })
  }

  async startVoiceChat(): Promise<void> {
    if (!this.avatar || !this.isInitialized) {
      throw new Error("Avatar not initialized")
    }

    try {
      await this.avatar.startVoiceChat({
        useSilencePrompt: true,
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
        task_type: TaskType.REPEAT,
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
}

// Función helper para crear token de sesión
export async function createHeyGenToken(apiKey: string): Promise<string> {
  try {
    const response = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.data.token
  } catch (error) {
    console.error("Error creating HeyGen token:", error)
    throw new Error("Failed to create HeyGen session token")
  }
}
