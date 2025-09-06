import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    
    if (!text) {
      return NextResponse.json({ error: "Text input is required" }, { status: 400 })
    }

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY || "",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: text
              }
            ]
          }
        ]
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error("Gemini API Error:", data)
      return NextResponse.json({ error: "Failed to generate content", details: data }, { status: response.status })
    }

    // Extract base64 image data if present
    let imageData = null
    
    // Check multiple possible locations for image data
    if (data.candidates?.[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        // Check inlineData.data
        if (part.inlineData?.data) {
          imageData = part.inlineData.data
          break
        }
        // Check inline_data.data (snake_case variant)
        if (part.inline_data?.data) {
          imageData = part.inline_data.data
          break
        }
        // Check if data is directly in the part
        if (part.data) {
          imageData = part.data
          break
        }
      }
    }
    
    // Check if there's a direct data field at root level
    if (!imageData && data.data) {
      imageData = data.data
    }

    return NextResponse.json({ success: true, data, imageData })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 