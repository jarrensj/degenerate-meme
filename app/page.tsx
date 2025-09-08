'use client'

import { useState, useEffect } from 'react'
import JSConfetti from 'js-confetti'
import Typewriter from 'typewriter-effect'
import ImageUpload from '../components/ImageUpload'
import PromptSelector from '../components/PromptSelector'
import ImageCountSelector from '../components/ImageCountSelector'
import GenerateButton from '../components/GenerateButton'
import ResultsDisplay from '../components/ResultsDisplay'
import ErrorDisplay from '../components/ErrorDisplay'

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
  const [jsConfetti, setJsConfetti] = useState<JSConfetti | null>(null)
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set())
  const [currentBatch, setCurrentBatch] = useState(0)
  const [totalBatches, setTotalBatches] = useState(0)
  const [batchProgress, setBatchProgress] = useState({ completed: 0, total: 0 })
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false)

  // Initialize confetti
  useEffect(() => {
    const confetti = new JSConfetti()
    setJsConfetti(confetti)
  }, [])

  const generateBatch = async (batchSize: number, batchIndex: number, textToSend: string, imageBase64: string | null) => {
    const response = await fetch('/api/degenerate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text: textToSend,
        image: imageBase64,
        mimeType: uploadedImageType,
        imageCount: batchSize
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Something went wrong')
    }

    return data.imageDataArray || []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const textToSend = useCustomInput ? customText : selectedOption
    if (!textToSend.trim()) return

    setLoading(true)
    setError('')
    setImageDataArray([])
    setSelectedImages(new Set())
    setCurrentBatch(0)
    
    // Calculate batches
    const batchSize = 4
    const batches = Math.ceil(imageCount / batchSize)
    setTotalBatches(batches)
    setBatchProgress({ completed: 0, total: batches })

    try {
      let imageBase64 = null
      if (uploadedImagePreview) {
        imageBase64 = uploadedImagePreview.split(',')[1]
      }

      let allImages: string[] = []
      
      // Generate images in batches
      for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
        setCurrentBatch(batchIndex + 1)
        setIsGeneratingBatch(true)
        
        const remainingImages = imageCount - (batchIndex * batchSize)
        const currentBatchSize = Math.min(batchSize, remainingImages)
        
        try {
          const batchImages = await generateBatch(currentBatchSize, batchIndex, textToSend, imageBase64)
          allImages = [...allImages, ...batchImages]
          
          // Update images progressively
          setImageDataArray([...allImages])
          
          // Update progress
          setBatchProgress({ completed: batchIndex + 1, total: batches })
          
          // Small delay between batches for better UX
          if (batchIndex < batches - 1) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        } catch (batchError) {
          console.error(`Batch ${batchIndex + 1} failed:`, batchError)
          setError(`Failed to generate batch ${batchIndex + 1}: ${batchError}`)
          break
        }
      }
      
      // Trigger confetti when all generation is successful
      if (allImages.length > 0 && jsConfetti) {
        jsConfetti.addConfetti({
          emojis: ['🚀', '✨'],
          emojiSize: 100,
          confettiNumber: 24,
        })
      }
    } catch (error) {
      console.error('Network error:', error)
      setError('Network error occurred')
    } finally {
      setLoading(false)
      setIsGeneratingBatch(false)
      setCurrentBatch(0)
    }
  }

  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">
        degenerate.meme ✨
      </h1>
      <div className="text-lg mb-4 text-gray-600">
        <Typewriter
          options={{
            strings: [
              'generate memes with your IP',
              'generate memes for your brand',
              'generate memes to express how you feel'
            ],
            autoStart: true,
            loop: true,
            delay: 50,
            deleteSpeed: 25,
          }}
        />
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
        <ImageUpload
          uploadedImagePreview={uploadedImagePreview}
          setUploadedImagePreview={setUploadedImagePreview}
          uploadedImageType={uploadedImageType}
          setUploadedImageType={setUploadedImageType}
          loading={loading}
        />

        <PromptSelector
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          customText={customText}
          setCustomText={setCustomText}
          useCustomInput={useCustomInput}
          setUseCustomInput={setUseCustomInput}
          loading={loading}
        />

        <ImageCountSelector
          imageCount={imageCount}
          setImageCount={setImageCount}
          loading={loading}
        />
        
        <GenerateButton
          loading={loading}
          uploadedImagePreview={uploadedImagePreview}
          useCustomInput={useCustomInput}
          selectedOption={selectedOption}
          customText={customText}
          imageCount={imageCount}
        />
      </form>

      {/* Batch Progress Indicator */}
      {(loading || batchProgress.total > 1) && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg w-full max-w-lg">
          <div className="text-center">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              {loading ? 'Generating Images...' : 'Generation Complete!'}
            </h3>
            
            {batchProgress.total > 1 && (
              <>
                <div className="flex justify-between text-xs text-blue-600 mb-1">
                  <span>Batch {currentBatch > 0 ? currentBatch : batchProgress.completed} of {batchProgress.total}</span>
                  <span>{batchProgress.completed}/{batchProgress.total} completed</span>
                </div>
                
                <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(batchProgress.completed / batchProgress.total) * 100}%` }}
                  ></div>
                </div>
              </>
            )}
            
            {isGeneratingBatch && (
              <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Generating batch {currentBatch}...</span>
              </div>
            )}
            
            {!loading && batchProgress.completed > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                {imageDataArray.length} image{imageDataArray.length !== 1 ? 's' : ''} generated
              </p>
            )}
          </div>
        </div>
      )}

      <ErrorDisplay error={error} />
      <ResultsDisplay 
        imageDataArray={imageDataArray} 
        selectedImages={selectedImages}
        setSelectedImages={setSelectedImages}
      />

    </main>
  );
}