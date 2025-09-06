import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { text, image, mimeType } = await req.json()
    
    if (!text) {
      return NextResponse.json({ error: "Text input is required" }, { status: 400 })
    }

    // Build the parts array - always include text, optionally include image
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [{ text: text }]
    
    if (image && mimeType) {
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: image
        }
      })
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
            parts: parts
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
    
    // First check: direct data field (matches curl command expectation)
    if (data.data) {
      imageData = data.data
    }
    // Second check: candidates response structure
    else if (data.candidates?.[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inline_data?.data) {
          imageData = part.inline_data.data
          break
        }
        if (part.inlineData?.data) {
          imageData = part.inlineData.data
          break
        }
      }
    }

    return NextResponse.json({ success: true, data, imageData })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 