# Clara - Widget de Diseño UI

Widget de chat con efectos de cristal (glassmorphism) y animaciones de refracción de luz.

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación

\`\`\`bash
# Clonar el repositorio
git clone [url-del-repositorio]
cd clara

# Instalar dependencias
npm install
\`\`\`

### Desarrollo

\`\`\`bash
# Ejecutar en modo desarrollo
npm run dev

# Abrir http://localhost:3000
\`\`\`

### Producción

\`\`\`bash
# Construir para producción
npm run build

# Ejecutar en producción
npm start
\`\`\`

## 🏗️ Estructura del Proyecto

\`\`\`
clara/
├── app/                    # App Router de Next.js
│   ├── globals.css        # Estilos globales y efectos de cristal
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── help-assistant-widget.tsx  # Widget principal
│   └── ui/                # Componentes UI básicos
│       ├── button.tsx
│       └── card.tsx
├── hooks/                 # Hooks personalizados
│   └── use-mobile.tsx     # Detección de dispositivos móviles
└── lib/                   # Utilidades
    └── utils.ts           # Función cn para clases CSS
\`\`\`

## 🎯 Características de Diseño

- ✅ Efectos de cristal (glassmorphism)
- ✅ Animaciones de refracción de luz
- ✅ Diseño responsivo
- ✅ Widget minimizable/expandible
- ✅ Estados visuales (chat, voz, conectando)
- ✅ Indicadores de actividad animados
- ✅ Scrollbar personalizado con efectos de cristal

## 🎨 Personalización

### Colores y Efectos

Los efectos de cristal se pueden personalizar en \`app/globals.css\`:

- Variables CSS en \`:root\` para colores base
- Clases \`.glass-*\` para efectos de cristal
- Animaciones \`@keyframes\` para refracciones de luz

### Componente Principal

El widget se puede personalizar modificando:
- Estados visuales en \`components/help-assistant-widget.tsx\`
- Colores en \`tailwind.config.ts\`
- Efectos de cristal en \`app/globals.css\`

## 📱 Estados del Widget

1. **Minimizado**: Botón flotante con efectos de luz
2. **Chat**: Interfaz de mensajes con burbujas de cristal
3. **Voz**: Indicadores visuales de actividad de audio
4. **Conectando**: Estado de carga con spinner

## 🛠️ Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + CSS personalizado
- **Icons**: Lucide React
- **TypeScript**: Tipado estático
- **Efectos**: CSS backdrop-filter y animaciones

## 📄 Uso

\`\`\`tsx
import HelpAssistantWidget from "@/components/help-assistant-widget"

export default function Page() {
  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <HelpAssistantWidget />
    </div>
  )
}
\`\`\`

## 📄 Licencia

MIT License
