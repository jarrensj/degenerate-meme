'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'

interface ResultsDisplayProps {
  imageDataArray: string[]
}

interface FavoriteImage {
  id: string
  imageData: string
  timestamp: number
}

export default function ResultsDisplay({ imageDataArray }: ResultsDisplayProps) {
  const [copySuccess, setCopySuccess] = useState<{[key: string]: boolean}>({})
  const [favorites, setFavorites] = useState<FavoriteImage[]>([])
  const [favoriteSuccess, setFavoriteSuccess] = useState<{[key: string]: boolean}>({})

  // Load favorites from localStorage on component mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favoriteMemes')
      console.log('ResultsDisplay loading favorites:', savedFavorites ? 'found data' : 'no data')
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites)
        console.log('ResultsDisplay loaded', favorites.length, 'favorites')
        setFavorites(favorites)
      } else {
        console.log('ResultsDisplay: No favorites in localStorage, keeping empty state')
        setFavorites([])
      }
    } catch (error) {
      console.warn('Failed to load favorites from localStorage:', error)
      setFavorites([])
    }
  }, [])

  // Don't automatically save to localStorage on every state change - only save when explicitly adding/removing
  // This prevents overwriting localStorage with empty state when component mounts

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

  const toggleFavorite = (imageData: string, imageId: string) => {
    try {
      // Load current favorites from localStorage
      const savedFavorites = localStorage.getItem('favoriteMemes')
      let currentFavorites: FavoriteImage[] = savedFavorites ? JSON.parse(savedFavorites) : []
      
      const existingIndex = currentFavorites.findIndex(fav => fav.imageData === imageData)
      
      if (existingIndex >= 0) {
        // Remove from favorites
        currentFavorites = currentFavorites.filter(fav => fav.imageData !== imageData)
        console.log('Removed from favorites, new count:', currentFavorites.length)
      } else {
        // Add to favorites - store the full base64 image data like ImageUpload does
        const newFavorite: FavoriteImage = {
          id: `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          imageData: imageData, // This is the full base64 string like "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
          timestamp: Date.now()
        }
        currentFavorites = [...currentFavorites, newFavorite]
        console.log('Added to favorites, new count:', currentFavorites.length)
        console.log('Image data length:', imageData.length, 'characters')
        
        // Show success feedback
        setFavoriteSuccess(prev => ({ ...prev, [imageId]: true }))
        setTimeout(() => {
          setFavoriteSuccess(prev => ({ ...prev, [imageId]: false }))
        }, 2000)
      }
      
      // Try to save to localStorage with error handling for quota exceeded
      try {
        const dataToSave = JSON.stringify(currentFavorites)
        console.log('Attempting to save', dataToSave.length, 'characters to localStorage')
        localStorage.setItem('favoriteMemes', dataToSave)
        console.log('Successfully saved to localStorage')
      } catch (storageError) {
        console.error('localStorage quota exceeded or other storage error:', storageError)
        // If storage fails, remove the most recent addition and try again
        if (existingIndex < 0 && currentFavorites.length > 1) {
          currentFavorites.pop() // Remove the item we just added
          console.log('Removed latest favorite due to storage limit, trying again with', currentFavorites.length, 'items')
          localStorage.setItem('favoriteMemes', JSON.stringify(currentFavorites))
        }
        throw storageError
      }
      
      // Update local state
      setFavorites(currentFavorites)
      
      // Dispatch custom event to update navigation
      window.dispatchEvent(new Event('favoritesUpdated'))
    } catch (error) {
      console.error('Error toggling favorite:', error)
      // Show error feedback
      setFavoriteSuccess(prev => ({ ...prev, [imageId]: 'error' }))
      setTimeout(() => {
        setFavoriteSuccess(prev => ({ ...prev, [imageId]: false }))
      }, 3000)
    }
  }

  const isFavorited = (imageData: string) => {
    try {
      const savedFavorites = localStorage.getItem('favoriteMemes')
      if (savedFavorites) {
        const currentFavorites: FavoriteImage[] = JSON.parse(savedFavorites)
        return currentFavorites.some(fav => fav.imageData === imageData)
      }
      return false
    } catch (error) {
      return false
    }
  }

  // Always render component to show favorites even if no new images

  return (
    <>
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
                Download
              </a>
              <button
                onClick={() => copyImageToClipboard(imgData, `image-${index}`)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                {copySuccess[`image-${index}`] ? '✓ Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => toggleFavorite(imgData, `image-${index}`)}
                className="flex items-center group px-3 py-1 text-sm transition-colors"
              >
                <Star 
                  size={14} 
                  className={`mr-1 transition-colors ${
                    isFavorited(imgData)
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-gray-300 group-hover:text-yellow-500'
                  }`} 
                />
                <span className={`text-xs ${
                  favoriteSuccess[`image-${index}`] ? 'text-green-500' :
                  isFavorited(imgData)
                    ? 'text-yellow-500' 
                    : 'text-gray-400 group-hover:text-yellow-500'
                }`}>
                  {favoriteSuccess[`image-${index}`] ? 'Saved!' : 
                   isFavorited(imgData) ? 'Favorited :)' : 'Favorite'}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
        </div>
      )}
    </>
  )
}
