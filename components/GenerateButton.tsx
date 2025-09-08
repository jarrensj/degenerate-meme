'use client'

interface GenerateButtonProps {
  loading: boolean
  uploadedImagePreview: string | null
  useCustomInput: boolean
  selectedOption: string
  customText: string
  imageCount: number
}

export default function GenerateButton({
  loading,
  uploadedImagePreview,
  useCustomInput,
  selectedOption,
  customText,
  imageCount
}: GenerateButtonProps) {
  const isDisabled = loading || 
    !uploadedImagePreview || 
    (!useCustomInput && !selectedOption.trim()) || 
    (useCustomInput && !customText.trim())

  return (
    <div className="max-w-xs mx-auto">
      <button
        type="submit"
        disabled={isDisabled}
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
{loading ? (imageCount > 4 ? 'Generating Batch...' : 'Generating Image...') : `Generate ${imageCount === 1 ? 'Image' : `${imageCount} Images`}${imageCount > 4 ? ' (in batches)' : ''}`}
          </span>
        </>
      );
    })()}
    </button>
    </div>
  )
}
