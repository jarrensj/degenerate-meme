'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
  uploadedImagePreview: string | null
  setUploadedImagePreview: (preview: string | null) => void
  uploadedImageType: string | null
  setUploadedImageType: (type: string | null) => void
  loading: boolean
}

export default function ImageUpload({
  uploadedImagePreview,
  setUploadedImagePreview,
  uploadedImageType,
  setUploadedImageType,
  loading
}: ImageUploadProps) {
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

  return (
    <div className="max-w-xs mx-auto">
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
  )
}
