'use client'

import { useState } from 'react'

export default function Home() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [imageData, setImageData] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    setLoading(true)
    setError('')
    setResult(null)
    setImageData(null)

    try {
      const response = await fetch('/api/degenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
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
            placeholder="Enter your image prompt here... (e.g., 'Create a sushi unicorn')"
            className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            disabled={loading}
          />
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