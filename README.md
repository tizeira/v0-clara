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

## 🔐 Configuración de entorno

Antes de ejecutar, configura tus variables de entorno:

1. Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

2. Completa los valores:

Para habilitar el avatar interactivo de HeyGen, crea un archivo `.env.local` en la raíz del proyecto (puedes usar `.env.local.example` como plantilla) con las siguientes variables:

```
NEXT_PUBLIC_BASE_API_URL=https://api.heygen.com
HEYGEN_API_KEY=sk-tu-clave-de-heygen
```

- `HEYGEN_API_KEY` es obligatoria y se usa del lado del servidor para generar el token de sesión seguro.
- `NEXT_PUBLIC_BASE_API_URL` es opcional; por defecto apunta a `https://api.heygen.com`.

Luego instala dependencias y levanta el entorno de desarrollo:

```
npm install
npm run dev
```

Prueba el endpoint de token localmente:

```
curl -X POST http://localhost:3000/api/heygen-token
```

Si ves un `500`, verifica:
- Que `HEYGEN_API_KEY` esté definida correctamente en `.env.local` y reinicia el servidor de Next.js.
- Que el firewall/red permita salir a `api.heygen.com`.
- Los logs del servidor: debería imprimirse el detalle del error si la API de HeyGen responde con fallo.
Reinicia el servidor de desarrollo después de cambiar `.env.local`.
