'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ResultsDisplayProps {
  imageDataArray: string[]
  selectedImages: Set<number>
  setSelectedImages: (selected: Set<number>) => void
}

export default function ResultsDisplay({ imageDataArray, selectedImages, setSelectedImages }: ResultsDisplayProps) {
  const [copySuccess, setCopySuccess] = useState<{[key: string]: boolean}>({})

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
    }
  }

  const toggleImageSelection = (index: number) => {
    const newSelected = new Set(selectedImages)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedImages(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedImages.size === imageDataArray.length) {
      setSelectedImages(new Set())
    } else {
      setSelectedImages(new Set(Array.from({ length: imageDataArray.length }, (_, i) => i)))
    }
  }

  const downloadSelectedImages = async () => {
    const selectedIndices = Array.from(selectedImages).sort()
    
    if (selectedIndices.length === 1) {
      // Single image download
      const index = selectedIndices[0]
      const link = document.createElement('a')
      link.href = `data:image/png;base64,${imageDataArray[index]}`
      link.download = `meme-${index + 1}.png`
      link.click()
    } else {
      // Multiple images download - create a zip file
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      
      selectedIndices.forEach((index) => {
        const imageData = imageDataArray[index]
        // Convert base64 to binary data
        const binaryString = atob(imageData)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        zip.file(`meme-${index + 1}.png`, bytes)
      })
      
      const content = await zip.generateAsync({ type: 'blob' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      link.download = `selected-memes-${selectedIndices.length}.zip`
      link.click()
      URL.revokeObjectURL(link.href)
    }
  }

  if (imageDataArray.length === 0) {
    return null
  }

  return (
    <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg w-full max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Generated Image{imageDataArray.length > 1 ? 's' : ''}:
        </h3>
        <div className="flex gap-2 items-center">
          <button
            onClick={toggleSelectAll}
            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
          >
            {selectedImages.size === imageDataArray.length ? 'Deselect All' : 'Select All'}
          </button>
          {selectedImages.size > 0 && (
            <button
              onClick={downloadSelectedImages}
              className="px-4 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors font-medium"
            >
              Download Selected ({selectedImages.size})
            </button>
          )}
        </div>
      </div>
      <div className={`grid gap-4 mb-4 ${
        imageDataArray.length === 1 ? 'grid-cols-1 justify-items-center' :
        imageDataArray.length === 2 ? 'grid-cols-2' :
        imageDataArray.length <= 4 ? 'grid-cols-2' :
        'grid-cols-3'
      }`}>
        {imageDataArray.map((imgData, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="relative">
              <Image 
                src={`data:image/png;base64,${imgData}`} 
                alt={`generated image ${index + 1}`} 
                width={imageDataArray.length === 1 ? 500 : 300}
                height={imageDataArray.length === 1 ? 500 : 300}
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedImages.has(index)}
                  onChange={() => toggleImageSelection(index)}
                  className="w-5 h-5 text-purple-600 bg-white border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <a
                href={`data:image/png;base64,${imgData}`}
                download={`image-${index + 1}.png`}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
              >
                Download
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
  )
}
