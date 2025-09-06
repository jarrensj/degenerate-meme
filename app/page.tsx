'use client'

import { useState } from 'react'
import Image from 'next/image'


export default function Home() {
  const [selectedOption, setSelectedOption] = useState('')
  const [customText, setCustomText] = useState('')
  const [useCustomInput, setUseCustomInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imageDataArray, setImageDataArray] = useState<string[]>([])
  const [imageCount, setImageCount] = useState<number>(1)
  const [error, setError] = useState('')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState<{[key: string]: boolean}>({})

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

  const copyImageToClipboard = async (imageData: string, imageId: string) => {
    try {
      // Convert base64 to blob
      const response = await fetch(`data:image/png;base64,${imageData}`)
      const blob = await response.blob()
      
      // Create ClipboardItem and copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      
      // Show success feedback
      setCopySuccess(prev => ({ ...prev, [imageId]: true }))
      setTimeout(() => {
        setCopySuccess(prev => ({ ...prev, [imageId]: false }))
      }, 2000)
    } catch (error) {
      console.error('Failed to copy image:', error)
      setError('Failed to copy image to clipboard')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const textToSend = useCustomInput ? customText : selectedOption
    if (!textToSend.trim()) return

    setLoading(true)
    setError('')
    setImageDataArray([])

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
          text: textToSend,
          image: imageBase64,
          mimeType: uploadedImage?.type,
          imageCount: imageCount
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      if (data.imageDataArray && data.imageDataArray.length > 0) {
        setImageDataArray(data.imageDataArray)
      }
    } catch (error) {
      console.error('Network error:', error)
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
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Choose what to create
            </label>
            <button
              type="button"
              onClick={() => setUseCustomInput(!useCustomInput)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {useCustomInput ? 'Use presets' : 'Use custom input'}
            </button>
          </div>
          
          {useCustomInput ? (
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter your custom prompt here... (e.g., 'Create a sushi unicorn')"
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              disabled={loading}
            />
          ) : (
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              disabled={loading}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an option...</option>
              <option value="Create meme sticker">Create Meme Sticker</option>
              <option value="Create Christmas sticker">Create Christmas Sticker</option>
              <option value="Create motivational sticker">Create Motivational Sticker</option>
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of images to generate
          </label>
          <select
            value={imageCount}
            onChange={(e) => setImageCount(Number(e.target.value))}
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
          >
            <option value={1}>1 image</option>
            <option value={2}>2 images</option>
            <option value={3}>3 images</option>
            <option value={4}>4 images</option>
          </select>
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
              <Image 
                src={uploadedImagePreview} 
                alt="uploaded preview" 
                width={400}
                height={192}
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
          disabled={loading || (!useCustomInput && !selectedOption.trim()) || (useCustomInput && !customText.trim())}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {loading ? 'Generating Image...' : `Generate ${imageCount === 1 ? 'Image' : `${imageCount} Images`}`}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 w-full max-w-2xl">
          <strong>Error:</strong> {error}
        </div>
      )}

      {imageDataArray.length > 0 && (
        <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg w-full max-w-4xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Generated Image{imageDataArray.length > 1 ? 's' : ''}:
          </h3>
          <div className={`grid gap-4 mb-4 ${
            imageDataArray.length === 1 ? 'grid-cols-1 justify-items-center' :
            imageDataArray.length === 2 ? 'grid-cols-2' :
            imageDataArray.length <= 4 ? 'grid-cols-2' :
            'grid-cols-3'
          }`}>
            {imageDataArray.map((imgData, index) => (
              <div key={index} className="flex flex-col items-center">
                <Image 
                  src={`data:image/png;base64,${imgData}`} 
                  alt={`generated image ${index + 1}`} 
                  width={imageDataArray.length === 1 ? 500 : 300}
                  height={imageDataArray.length === 1 ? 500 : 300}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
                <div className="flex gap-2 mt-2">
                  <a
                    href={`data:image/png;base64,${imgData}`}
                    download={`image-${index + 1}.png`}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    Download #{index + 1}
                  </a>
                  <button
                    onClick={() => copyImageToClipboard(imgData, `image-${index}`)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                  >
                    {copySuccess[`image-${index}`] ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </main>
  );
}