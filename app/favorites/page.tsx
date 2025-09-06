'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'

interface FavoriteImage {
  id: string
  imageData: string
  timestamp: number
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteImage[]>([])
  const [copySuccess, setCopySuccess] = useState<{[key: string]: boolean}>({})

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const savedFavorites = localStorage.getItem('favoriteMemes')
        if (savedFavorites && savedFavorites !== '[]' && savedFavorites !== 'null') {
          const parsed = JSON.parse(savedFavorites)
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Sort by timestamp (newest first)
            const sorted = parsed.sort((a: FavoriteImage, b: FavoriteImage) => b.timestamp - a.timestamp)
            setFavorites(sorted)
          } else {
            setFavorites([])
          }
        } else {
          setFavorites([])
        }
      } catch (error) {
        console.warn('Failed to load favorites from localStorage:', error)
        setFavorites([])
      }
    }

    // Small delay to ensure localStorage is ready
    const timer = setTimeout(() => {
      loadFavorites()
    }, 100)

    // Also listen for the custom event to reload when favorites are updated
    const handleFavoritesUpdate = () => {
      setTimeout(loadFavorites, 50) // Small delay to ensure localStorage is updated
    }

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate)
    
    // Also listen for storage events from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'favoriteMemes') {
        loadFavorites()
      }
    })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate)
    }
  }, [])

  // Note: We don't save to localStorage here - that's handled in ResultsDisplay component

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

  const removeFavorite = (imageData: string) => {
    const updatedFavorites = favorites.filter(fav => fav.imageData !== imageData)
    setFavorites(updatedFavorites)
    // Update localStorage immediately
    try {
      localStorage.setItem('favoriteMemes', JSON.stringify(updatedFavorites))
    } catch (error) {
      console.error('Error updating localStorage:', error)
    }
    // Dispatch custom event to update navigation
    window.dispatchEvent(new Event('favoritesUpdated'))
  }

  const clearAllFavorites = () => {
    if (window.confirm('Are you sure you want to clear all favorites? This cannot be undone.')) {
      setFavorites([])
      // Update localStorage immediately
      try {
        localStorage.setItem('favoriteMemes', JSON.stringify([]))
      } catch (error) {
        console.error('Error clearing localStorage:', error)
      }
      // Dispatch custom event to update navigation
      window.dispatchEvent(new Event('favoritesUpdated'))
    }
  }


  return (
    <main className="min-h-screen bg-stone-50 p-8 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
      <div className="w-full flex items-center justify-between mb-8">
        <Link
          href="/"
          className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors border border-stone-200 shadow-sm font-medium"
        >
          ← Back to Generator
        </Link>
        {favorites.length > 0 && (
          <button
            onClick={clearAllFavorites}
            className="px-4 py-2 bg-stone-300 text-stone-700 rounded-lg hover:bg-stone-400 transition-colors border border-stone-300 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <h1 className="text-4xl font-bold mb-2 text-stone-700">
        ❤️ Your Favorite Memes
      </h1>
      <p className="text-lg mb-8 text-stone-600">
        {favorites.length === 0 
          ? 'No favorites yet. Generate some memes and save your favorites!'
          : `You have ${favorites.length} favorite meme${favorites.length === 1 ? '' : 's'}`
        }
      </p>
      

      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-stone-200 shadow-sm">
          <div className="text-6xl mb-4">🤍</div>
          <h2 className="text-2xl font-semibold mb-4 text-stone-700">No favorites yet</h2>
          <p className="text-stone-500 mb-6">
            Start generating memes and click the favorite button to save them here!
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-stone-600 text-stone-50 rounded-lg hover:bg-stone-700 transition-colors font-medium shadow-sm"
          >
            Generate Memes
          </Link>
        </div>
      ) : (
        <div className="mt-6 p-6 bg-white border border-stone-200 rounded-lg w-full max-w-4xl shadow-sm">
          <div className={`grid gap-4 mb-4 ${
            favorites.length === 1 ? 'grid-cols-1 justify-items-center' :
            favorites.length === 2 ? 'grid-cols-2' :
            favorites.length <= 4 ? 'grid-cols-2' :
            'grid-cols-3'
          }`}>
            {favorites.map((favorite, index) => (
              <div key={favorite.id} className="flex flex-col items-center">
                <Image 
                  src={`data:image/png;base64,${favorite.imageData}`} 
                  alt={`favorite meme ${index + 1}`} 
                  width={favorites.length === 1 ? 500 : 300}
                  height={favorites.length === 1 ? 500 : 300}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
                <div className="flex gap-2 mt-2">
                  <a
                    href={`data:image/png;base64,${favorite.imageData}`}
                    download={`favorite-meme-${index + 1}.png`}
                    className="px-3 py-1 bg-stone-600 text-stone-50 text-sm rounded hover:bg-stone-700 transition-colors font-medium shadow-sm"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => copyImageToClipboard(favorite.imageData, `fav-${index}`)}
                    className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded hover:bg-stone-200 transition-colors border border-stone-200"
                  >
                    {copySuccess[`fav-${index}`] ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => removeFavorite(favorite.imageData)}
                    className="flex items-center group px-3 py-1 text-sm transition-colors bg-stone-50 hover:bg-stone-100 rounded border border-stone-200"
                  >
                    <Star 
                      size={14} 
                      className="mr-1 text-stone-400 fill-stone-400 group-hover:text-stone-600 group-hover:fill-stone-600 transition-colors" 
                    />
                    <span className="text-xs text-stone-500 group-hover:text-stone-700 transition-colors">
                      Remove
                    </span>
                  </button>
                </div>
                <p className="text-xs text-stone-400 text-center mt-2">
                  Saved {new Date(favorite.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
