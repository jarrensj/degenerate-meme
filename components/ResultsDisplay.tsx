'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ResultsDisplayProps {
  imageDataArray: string[]
}

export default function ResultsDisplay({ imageDataArray }: ResultsDisplayProps) {
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

  if (imageDataArray.length === 0) {
    return null
  }

  return (
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
