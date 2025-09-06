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

  // Initialize confetti
  useEffect(() => {
    const confetti = new JSConfetti()
    setJsConfetti(confetti)
  }, [])

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
        const errorMessage = data.message || data.error || 'Something went wrong'
        setError(errorMessage)
        return
      }

      if (data.imageDataArray && data.imageDataArray.length > 0) {
        setImageDataArray(data.imageDataArray)
        // Trigger confetti when generation is successful
        if (jsConfetti) {
          jsConfetti.addConfetti({
            emojis: ['🚀', '✨'],
            emojiSize: 100,
            confettiNumber: 24,
          })
        }
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

      <ErrorDisplay error={error} />
      <ResultsDisplay imageDataArray={imageDataArray} />

    </main>
  );
}