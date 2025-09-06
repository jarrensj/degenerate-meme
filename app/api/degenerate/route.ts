import { NextRequest, NextResponse } from "next/server"
import { getPromptsForQuantity } from "../../../data/stickerOptions"

export async function POST(req: NextRequest) {
  try {
    const { text, image, mimeType, imageCount = 1 } = await req.json()
    
    if (!text) {
      return NextResponse.json({ error: "Text input is required" }, { status: 400 })
    }

    // Validate imageCount
    if (imageCount < 1 || imageCount > 4) {
      return NextResponse.json({ error: "Image count must be between 1 and 4" }, { status: 400 })
    }

    // Get different prompts for each image based on quantity
    const prompts = getPromptsForQuantity(text, imageCount)

    // Function to make a single API call with specific prompt
    const makeApiCall = async (promptText: string) => {
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [{ text: promptText }]
      
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
        throw new Error(`API call failed: ${JSON.stringify(data)}`)
      }

      return data
    }

    // Make API calls with different prompts
    const apiCalls = prompts.map((prompt: string) => makeApiCall(prompt))

    let allResponses
    try {
      allResponses = await Promise.all(apiCalls)
    } catch (error) {
      console.error("Gemini API Error:", error)
      return NextResponse.json({ error: "Failed to generate content", details: error }, { status: 500 })
    }

    // Extract base64 image data from all responses
    const imageDataArray: string[] = []
    
    for (const data of allResponses) {
      if (data.candidates?.[0]?.content?.parts) {
        for (const part of data.candidates[0].content.parts) {
          if (part.inline_data?.data) {
            imageDataArray.push(part.inline_data.data)
            break
          }
          if (part.inlineData?.data) {
            imageDataArray.push(part.inlineData.data)
            break
          }
        }
      }
    }

    // Return the array of images
    return NextResponse.json({ 
      success: true, 
      imageDataArray: imageDataArray
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 