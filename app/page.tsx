'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { stickerOptions } from '../data/stickerOptions'


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
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processImageFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImageFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processImageFile(files[0])
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          processImageFile(file)
        }
        break
      }
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    setUploadedImagePreview(null)
    // Reset the file input value so the same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
              {stickerOptions.map((option) => (
                <option key={option.id} value={option.prompt}>
                  {option.label}
                </option>
              ))}
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
            {uploadedImagePreview ? 'Replace your character/subject' : 'Upload your character/subject (optional)'}
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Upload one image of the character or subject you want to use in your stickers
          </p>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
            tabIndex={0}
            className={`relative border-2 border-dashed rounded-lg transition-colors ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
              uploadedImagePreview ? 'p-2' : 'p-6'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={loading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {uploadedImagePreview ? (
              <div className="relative">
                <Image 
                  src={uploadedImagePreview} 
                  alt="uploaded preview" 
                  width={400}
                  height={192}
                  className="w-full h-48 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg"
                >
                  ×
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Click, drag, or paste to replace
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-center">
                <div className="text-gray-400">
                  <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    {isDragOver ? 'Drop image here' : 'Click to upload, drag & drop, or paste'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>
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
                    {imageDataArray.length === 1 ? 'Download' : `Download #${index + 1}`}
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