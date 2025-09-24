# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linter
- `npm run type-check` - Run TypeScript type checking

## Architecture Overview

This is a Next.js 14 app that creates a Clara help assistant widget with glassmorphism effects and fully functional HeyGen avatar integration using StreamingAvatar SDK v2.0.13.

### Core Components

- **Main Widget**: `components/help-assistant-widget.tsx` - The primary chat widget with glassmorphism design
- **Avatar Components**: `components/avatar/` - Modular avatar-related components
  - `AvatarVideo.tsx` - Video display component for streaming avatar
  - `MessageHistory.tsx` - Chat message display with glassmorphism styling
  - `VoiceInterface.tsx` - Voice chat controls and indicators
- **Avatar Hooks**: `hooks/avatar/` - Complete hook system for avatar management
  - `context.tsx` - Global state management with React Context
  - `useStreamingAvatarSession.ts` - Avatar session lifecycle management
  - `useVoiceChat.ts` - Voice chat functionality and controls

### API Routes

- `/api/get-access-token` - Creates HeyGen session tokens (functional)
- `/api/voice-chat` - Handles traditional voice chat processing
- `/api/voice-chat-avatar` - Processes avatar-based voice interactions

### Key Features

- **Glassmorphism Design**: Custom CSS effects in `app/globals.css` with `.glass-*` classes
- **Functional Avatar Integration**:
  - HeyGen StreamingAvatar SDK v2.0.13
  - Real-time video streaming with WebRTC
  - Spanish language support (Fernanda Olea voice)
  - Deepgram STT integration
  - Knowledge base integration
- **Context-Based State Management**: Global avatar state using React Context
- **Real-time Communication**: WebSocket-based voice chat transport
- **Responsive Design**: Mobile-first with glassmorphism effects

### Configuration

- **Avatar Config**: Default avatar "Alessandra_Chair_Sitting_public" with Spanish voice
- **Voice**: Fernanda Olea (voiceId: ab9346d254a94ed8a4e662da7a5972d6)
- **Knowledge Base**: Clara's skincare database (knowledgeId: 251ae2b8b812448d9d03efbc354c9b98)
- **Path Alias**: `@/*` maps to project root
- **Styling**: Tailwind CSS + custom glassmorphism effects

### Environment Variables

Required environment variables (see `.env.example`):
- `HEYGEN_API_KEY` - HeyGen API key for authentication
- `NEXT_PUBLIC_BASE_API_URL` - HeyGen API base URL (https://api.heygen.com)
- `OPENAI_API_KEY` - OpenAI API key for additional LLM processing

### Avatar Session States

1. **INACTIVE**: Initial state, shows setup interface
2. **CONNECTING**: Loading state while initializing avatar
3. **CONNECTED**: Active session with streaming video

### Architecture Benefits

- **Modular Design**: Separates concerns with hooks, components, and context
- **Type Safety**: Full TypeScript support with proper typing
- **Error Handling**: Comprehensive error states and recovery
- **Performance**: Optimized with memoization and proper cleanup
- **Maintainability**: Clean separation between UI and business logic

The implementation is based on HeyGen's official demo but adapted to maintain the glassmorphism aesthetic and Clara's branding.