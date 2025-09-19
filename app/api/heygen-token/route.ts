import { type NextRequest, NextResponse } from "next/server"
import { createHeyGenToken } from "@/services/heygen-avatar"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.HEYGEN_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "HeyGen API key not configured" }, { status: 500 })
    }

    const token = await createHeyGenToken(apiKey)

    return NextResponse.json({
      success: true,
      token,
    })
  } catch (error) {
    console.error("HeyGen token API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create HeyGen token" },
      { status: 500 },
    )
  }
}
