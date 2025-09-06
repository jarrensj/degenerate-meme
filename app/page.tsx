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
    <main className="min-h-screen relative overflow-hidden">
      {/* Chaotic floating elements */}
      <div className="absolute top-10 left-5 w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rotate-45 opacity-70 animate-pulse"></div>
      <div className="absolute top-32 right-12 w-16 h-16 bg-gradient-to-tr from-green-400 to-yellow-500 rounded-full opacity-60 animate-bounce"></div>
      <div className="absolute bottom-20 left-20 w-24 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 transform -rotate-12 opacity-50"></div>
      <div className="absolute bottom-40 right-8 w-14 h-14 bg-gradient-to-bl from-red-500 to-orange-600 rotate-12 opacity-80 animate-spin"></div>
      
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center text-center max-w-6xl mx-auto min-h-screen">
        <div className="relative mb-8 transform rotate-1 hover:rotate-2 transition-transform">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 glitch-text unstable-text relative">
            <span className="font-mono text-yellow-300 text-3xl absolute -top-6 -left-4 rotate-12">✧</span>
            <span className="font-serif">degen</span><span className="font-mono text-pink-400">erate</span><span className="font-sans text-cyan-300">.meme</span>
            <span className="text-green-400 text-2xl absolute -bottom-2 -right-8 rotate-45">★</span>
          </h1>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse pointer-events-none"></div>
        </div>
        
        <div className="relative transform -rotate-1">
          <p className="text-xl sm:text-2xl mb-8 font-bold tracking-wide">
            <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              turn your images into </span>
            <span className="font-mono text-yellow-300 text-shadow-lg glitch-text">CHAOTIC</span>
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"> memes</span>
          </p>
        </div>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-8 relative transform rotate-1 hover:rotate-0 transition-all duration-300">
        {/* Chaotic form background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-800/10 to-cyan-900/20 rounded-3xl transform -rotate-2 scale-105 blur-sm"></div>
        <div className="relative z-10 p-6 rounded-2xl backdrop-blur-sm border border-pink-500/30 shadow-2xl chaotic-shadow">
        <div className="relative">
          <label className="block text-lg font-bold mb-4 transform -skew-x-3">
            <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 bg-clip-text text-transparent glitch-text">
              {uploadedImagePreview ? '⚡ REPLACE CHAOS ⚡' : '🔥 UPLOAD CHAOS 🔥'}
            </span>
          </label>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
            tabIndex={0}
            className={`relative border-4 border-dashed rounded-2xl transition-all duration-300 transform hover:scale-105 ${
              isDragOver 
                ? 'border-pink-400 bg-gradient-to-br from-pink-900/30 to-purple-900/30 shadow-lg shadow-pink-500/50' 
                : 'border-cyan-400 hover:border-yellow-400 bg-gradient-to-tr from-purple-900/20 to-blue-900/20'
            } ${loading ? 'opacity-50 cursor-not-allowed animate-pulse' : 'cursor-pointer hover:shadow-xl hover:shadow-cyan-500/30'} ${
              uploadedImagePreview ? 'p-3' : 'p-8'
            } corrupt-border`}
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
                <div className="relative transform hover:rotate-1 transition-transform">
                  <Image 
                    src={uploadedImagePreview} 
                    alt="uploaded preview" 
                    width={400}
                    height={192}
                    className="w-full h-48 object-contain rounded-xl jpeg-artifact border-2 border-pink-500/50 shadow-lg shadow-purple-500/30"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold hover:from-red-600 hover:to-pink-700 shadow-lg transform hover:scale-110 transition-all animate-pulse"
                  >
                    ✕
                  </button>
                  <div className="absolute bottom-2 left-2 bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-yellow-300 text-xs px-3 py-1 rounded-full font-bold animate-bounce">
                    🔄 CHAOS MODE
                  </div>
              </div>
              ) : (
                <div className="space-y-4 text-center transform hover:scale-105 transition-transform">
                  <div className="text-cyan-400 animate-bounce">
                    <svg className="mx-auto h-16 w-16 filter drop-shadow-lg" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-lg font-bold bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 bg-clip-text text-transparent glitch-text">
                      {isDragOver ? '🎯 DROP THE CHAOS!' : '📸 FEED THE MACHINE!'}
                    </span>
                  </div>
                  <p className="text-sm font-mono text-green-400 animate-pulse">PNG, JPG, GIF → MAXIMUM CORRUPTION</p>
                </div>
            )}
          </div>
        </div>

        <div className="relative transform -rotate-1 hover:rotate-0 transition-all">
          <div className="flex items-center justify-between mb-6">
            <label className="block text-xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent glitch-text transform skew-x-3">
              🎨 CHAOS GENERATOR 🎨
            </label>
            <button
              type="button"
              onClick={() => setUseCustomInput(!useCustomInput)}
              className="text-sm font-bold bg-gradient-to-r from-pink-500 to-yellow-500 text-black px-4 py-2 rounded-full hover:from-yellow-500 hover:to-pink-500 transform hover:scale-110 transition-all shadow-lg animate-pulse"
            >
              {useCustomInput ? '📋 PRESETS' : '✏️ CUSTOM'}
            </button>
          </div>
          
          {useCustomInput ? (
            <div className="relative">
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="UNLEASH YOUR CHAOS... (e.g., 'Create a glitched rainbow unicorn eating pizza in space')"
                className="w-full p-6 bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-3 border-cyan-400 rounded-2xl resize-none focus:ring-4 focus:ring-pink-500 focus:border-yellow-400 text-white placeholder-gray-300 font-mono text-lg backdrop-blur-sm corrupt-border transform hover:scale-105 transition-all"
                rows={5}
                disabled={loading}
              />
              <div className="absolute top-2 right-2 text-yellow-300 animate-spin">⚡</div>
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                disabled={loading}
                className="w-full p-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-3 border-pink-400 rounded-2xl focus:ring-4 focus:ring-cyan-500 focus:border-yellow-400 text-white text-lg font-bold backdrop-blur-sm corrupt-border transform hover:scale-105 transition-all appearance-none"
              >
              <option value="" className="bg-black text-pink-400">🎯 SELECT YOUR CHAOS...</option>
              {stickerOptions.map((option) => (
                <option key={option.id} value={option.prompt} className="bg-black text-cyan-400 font-bold">
                  🔥 {option.label.toUpperCase()}
                </option>
              ))}
            </select>
              <div className="absolute top-6 right-6 text-yellow-300 pointer-events-none animate-bounce">▼</div>
            </div>
          )}
        </div>

        <div className="relative transform rotate-1 hover:rotate-0 transition-all">
          <label className="block text-xl font-bold mb-6 bg-gradient-to-r from-red-400 via-yellow-500 to-green-400 bg-clip-text text-transparent glitch-text transform -skew-x-2">
            💥 CHAOS MULTIPLIER 💥
          </label>
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setImageCount(num)}
                disabled={loading}
                className={`flex-1 py-4 px-6 text-xl font-bold rounded-2xl border-3 transition-all transform hover:scale-110 ${
                  imageCount === num
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-yellow-400 shadow-lg shadow-pink-500/50 animate-pulse'
                    : 'bg-gradient-to-r from-gray-800 to-gray-900 text-cyan-400 border-cyan-400 hover:from-gray-700 hover:to-gray-800 hover:border-pink-400'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} corrupt-border`}
              >
                <span className="glitch-text">{num}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="relative mt-8">
          <button
            type="submit"
            disabled={loading || !uploadedImage || (!useCustomInput && !selectedOption.trim()) || (useCustomInput && !customText.trim())}
            className="w-full bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white py-6 px-8 rounded-2xl font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-700 hover:via-pink-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-xl chaotic-shadow animate-pulse"
          >
            <span className="glitch-text">
              {loading ? '⚡ GENERATING CHAOS...' : `🚀 UNLEASH ${imageCount === 1 ? 'CHAOS' : `${imageCount}X CHAOS`}!`}
            </span>
          </button>
          {loading && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-ping rounded-2xl"></div>
          )}
        </div>
        </div>
      </form>

      {error && (
        <div className="mt-8 p-6 bg-gradient-to-r from-red-900/70 to-pink-900/70 border-3 border-red-400 rounded-2xl text-red-200 w-full max-w-2xl transform rotate-1 hover:rotate-0 transition-all corrupt-border backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">💀</span>
            <div>
              <strong className="text-yellow-300 glitch-text">CHAOS ERROR:</strong>
              <p className="font-mono text-lg">{error}</p>
            </div>
          </div>
        </div>
      )}

      {imageDataArray.length > 0 && (
        <div className="mt-8 p-8 bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-cyan-900/30 border-3 border-yellow-400 rounded-3xl w-full max-w-6xl transform -rotate-1 hover:rotate-0 transition-all corrupt-border backdrop-blur-sm relative">
          <div className="absolute top-4 right-4 text-3xl animate-spin">⚡</div>
          <h3 className="text-3xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 bg-clip-text text-transparent glitch-text unstable-text">
              🎨 CHAOS GENERATED{imageDataArray.length > 1 ? ' (MULTIPLE!)' : ''} 🎨
            </span>
          </h3>
          <div className={`grid gap-8 mb-8 ${
            imageDataArray.length === 1 ? 'grid-cols-1 justify-items-center' :
            imageDataArray.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
            imageDataArray.length <= 4 ? 'grid-cols-1 sm:grid-cols-2' :
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {imageDataArray.map((imgData, index) => (
              <div key={index} className="flex flex-col items-center transform hover:scale-105 transition-all">
                <div className="relative p-2 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-2xl border-2 border-cyan-400">
                  <Image 
                    src={`data:image/png;base64,${imgData}`} 
                    alt={`generated image ${index + 1}`} 
                    width={imageDataArray.length === 1 ? 500 : 300}
                    height={imageDataArray.length === 1 ? 500 : 300}
                    className="w-full h-auto rounded-xl shadow-2xl jpeg-artifact transform hover:rotate-1 transition-transform"
                  />
                  <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-black text-sm font-bold px-2 py-1 rounded-full animate-bounce">
                    #{index + 1}
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <a
                    href={`data:image/png;base64,${imgData}`}
                    download={`chaos-${index + 1}.png`}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold rounded-full hover:from-blue-700 hover:to-cyan-600 transition-all transform hover:scale-110 shadow-lg animate-pulse"
                  >
                    💾 {imageDataArray.length === 1 ? 'DOWNLOAD' : `GET #${index + 1}`}
                  </a>
                  <button
                    onClick={() => copyImageToClipboard(imgData, `image-${index}`)}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-yellow-500 text-white text-sm font-bold rounded-full hover:from-green-700 hover:to-yellow-600 transition-all transform hover:scale-110 shadow-lg"
                  >
                    {copySuccess[`image-${index}`] ? '✅ COPIED!' : '📋 COPY'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </main>
  );
}