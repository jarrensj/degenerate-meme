'use client'

import { useState, useRef, useEffect } from 'react'
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
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null)
  const [uploadedImageType, setUploadedImageType] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState<{[key: string]: boolean}>({})
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Local storage helpers
  const saveImageToLocalStorage = (file: File, preview: string) => {
    try {
      const imageData = {
        name: file.name,
        type: file.type,
        preview: preview
      }
      localStorage.setItem('uploadedImage', JSON.stringify(imageData))
    } catch (error) {
      console.warn('Failed to save image to localStorage:', error)
    }
  }

  const loadImageFromLocalStorage = () => {
    try {
      const savedImageData = localStorage.getItem('uploadedImage')
      if (savedImageData) {
        const imageData = JSON.parse(savedImageData)
        setUploadedImagePreview(imageData.preview)
        setUploadedImageType(imageData.type)
      }
    } catch (error) {
      console.warn('Failed to load image from localStorage:', error)
      // Clear corrupted data
      localStorage.removeItem('uploadedImage')
    }
  }

  const clearImageFromLocalStorage = () => {
    try {
      localStorage.removeItem('uploadedImage')
    } catch (error) {
      console.warn('Failed to clear image from localStorage:', error)
    }
  }

  // Load saved image on component mount
  useEffect(() => {
    loadImageFromLocalStorage()
  }, [])

  const processImageFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setUploadedImageType(file.type)
      const reader = new FileReader()
      reader.onload = (e) => {
        const preview = e.target?.result as string
        setUploadedImagePreview(preview)
        // Save to localStorage
        saveImageToLocalStorage(file, preview)
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
    setUploadedImagePreview(null)
    setUploadedImageType(null)
    // Clear from localStorage
    clearImageFromLocalStorage()
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
      if (uploadedImagePreview) {
        imageBase64 = uploadedImagePreview.split(',')[1]
      }

      const response = await fetch('/api/degenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: textToSend,
          image: imageBase64,
          mimeType: uploadedImageType,
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
        turn your images into memes and stickers
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {uploadedImagePreview ? 'Replace your character' : 'Upload your character'}
          </label>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
            tabIndex={0}
            className={`relative border-2 border-dashed rounded-lg transition-colors ${
              isDragOver 
                ? 'border-green-400 bg-green-50' 
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

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Choose what to create
            </label>
            <button
              type="button"
              onClick={() => setUseCustomInput(!useCustomInput)}
              className="text-sm text-green-600 hover:text-green-800 underline"
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
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Number of images to generate
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setImageCount(num)}
                disabled={loading}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
                  imageCount === num
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !uploadedImagePreview || (!useCustomInput && !selectedOption.trim()) || (useCustomInput && !customText.trim())}
          className="matcha-progress-button w-full py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed sketch-element"
        >
            {/* Calculate form completion progress */}
            {(() => {
              const hasImage = !!uploadedImagePreview;
              const hasPrompt = useCustomInput ? !!customText.trim() : !!selectedOption.trim();
              const hasImageCount = imageCount > 0;

              const completedSteps = [hasImage, hasPrompt, hasImageCount].filter(Boolean).length;
              const formProgress = (completedSteps / 3) * 100;
              
              return (
                <>
                  {/* Progress fill - shows form completion + full when loading */}
                  <div 
                    className="absolute inset-1 transition-all duration-700 ease-out rounded-md"
                    style={{ 
                      width: loading ? 'calc(100% - 8px)' : `calc(${formProgress}% - 8px)`,
                    }}
                  >
                    <div className="absolute inset-0 rounded-md overflow-hidden"
                      style={{
                        animation: (() => {
                          const isFormComplete = hasImage && hasPrompt && hasImageCount;
                          return !loading && isFormComplete && formProgress === 100 ? 'rainbow-glow 6s ease-in-out infinite' : 'none';
                        })()
                      }}
                    >
                      {/* Animated matcha gradient wave background */}
                      <div
                        className="absolute inset-0 rounded-md"
                        style={{
                          background: loading 
                            ? `linear-gradient(135deg, 
                                #5cb3a6 0%, 
                                #7ec5ba 25%,
                                #4a9b8e 50%,
                                #7ec5ba 75%, 
                                #5cb3a6 100%)`
                            : `linear-gradient(135deg, 
                                rgba(92, 179, 166, 0.6) 0%, 
                                rgba(92, 179, 166, 0.8) 50%,
                                rgba(92, 179, 166, 0.6) 100%)`,
                          backgroundSize: loading ? '200% 100%' : '100% 100%',
                          animation: loading ? 'gradient-wave 2.5s ease-in-out infinite' : 'none'
                        }}
                      />
                  
                  {loading && (
                    <div 
                      className="absolute inset-0 opacity-20 rounded-md"
                      style={{
                        background: `repeating-linear-gradient(
                          135deg,
                          transparent,
                          transparent 12px,
                          rgba(92, 179, 166, 0.1) 12px,
                          rgba(92, 179, 166, 0.1) 24px
                        )`,
                        animation: 'gentle-drift 3s ease-in-out infinite'
                      }}
                    />
                  )}
                  </div>
                </div>
                
                {/* Button content */}
                <span 
                  className="relative z-10 font-medium tracking-wide transition-colors duration-300"
                  style={{
                    color: loading ? 'var(--matcha-dark)' : 'var(--soft-charcoal)',
                    textShadow: loading ? '0 0 2px rgba(255,255,255,0.8)' : 'none'
                  }}
                >
                  {loading ? 'Generating Image...' : `Generate ${imageCount === 1 ? 'Image' : `${imageCount} Images`}`}
                </span>
              </>
            );
          })()}
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
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                  >
                    {imageDataArray.length === 1 ? 'Download' : `Download #${index + 1}`}
                  </a>
                  <button
                    onClick={() => copyImageToClipboard(imgData, `image-${index}`)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
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