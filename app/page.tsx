'use client'

import { useState } from 'react'

export default function Home() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [imageData, setImageData] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    setUploadedImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    setLoading(true)
    setError('')
    setResult(null)
    setImageData(null)

    try {
      let imageBase64 = null
      if (uploadedImage) {
        const reader = new FileReader()
        imageBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string
            // Remove the data URL prefix to get just the base64 data
            const base64Data = result.split(',')[1]
            resolve(base64Data)
          }
          reader.readAsDataURL(uploadedImage)
        })
      }

      const response = await fetch('/api/degenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          image: imageBase64,
          mimeType: uploadedImage?.type 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setResult(data.data)
      if (data.imageData) {
        setImageData(data.imageData)
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">
        degenerate.meme
      </h1>
      <p className="text-lg mb-8 text-gray-600">
        generate memes with your image
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your image prompt here... (e.g., 'Create a sushi unicorn' or 'Describe what you want to do with the uploaded image')"
            className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload an image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {uploadedImagePreview && (
            <div className="mt-3 relative">
              <img 
                src={uploadedImagePreview} 
                alt="uploaded preview" 
                className="max-w-full h-48 object-contain rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {loading ? 'Generating Image...' : 'Generate Image'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 w-full max-w-2xl">
          <strong>Error:</strong> {error}
        </div>
      )}

      {imageData && (
        <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg w-full max-w-2xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Generated Image:</h3>
          <div className="flex justify-center mb-4">
            <img 
              src={`data:image/png;base64,${imageData}`} 
              alt="generated image" 
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          <div className="flex gap-2 justify-center">
            <a
              href={`data:image/png;base64,${imageData}`}
              download="image.png"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Download Image
            </a>
          </div>
        </div>
      )}

      {result && !imageData && (
        <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg w-full max-w-2xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Generated Content:</h3>
          <div className="space-y-4">
            {result.candidates?.map((candidate: any, index: number) => (
              <div key={index} className="bg-white p-4 rounded border">
                {candidate.content?.parts?.map((part: any, partIndex: number) => (
                  <div key={partIndex} className="text-gray-700 whitespace-pre-wrap">
                    {part.text}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}