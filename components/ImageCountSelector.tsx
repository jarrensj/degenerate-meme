'use client'

interface ImageCountSelectorProps {
  imageCount: number
  setImageCount: (count: number) => void
  loading: boolean
}

export default function ImageCountSelector({
  imageCount,
  setImageCount,
  loading
}: ImageCountSelectorProps) {
  const quickOptions = [1, 4, 8, 12, 16, 20]
  
  return (
    <div className="max-w-md mx-auto">
      <label className="block text-xs font-medium text-gray-700 mb-3">
        Number of images to generate (up to 20)
      </label>
      
      {/* Quick select buttons */}
      <div className="flex gap-2 mb-3 flex-wrap justify-center">
        {quickOptions.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => setImageCount(num)}
            disabled={loading}
            className={`py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
              imageCount === num
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {num}
          </button>
        ))}
      </div>
      
      {/* Custom input for any number */}
      <div className="flex items-center gap-2 justify-center">
        <label htmlFor="custom-count" className="text-sm text-gray-600">
          Custom:
        </label>
        <input
          id="custom-count"
          type="number"
          min="1"
          max="20"
          value={imageCount}
          onChange={(e) => {
            const value = Math.min(20, Math.max(1, parseInt(e.target.value) || 1))
            setImageCount(value)
          }}
          disabled={loading}
          className={`w-16 px-2 py-1 text-sm border rounded text-center ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
      </div>
      
      {imageCount > 4 && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Images will be generated in batches of 4 for faster results
        </p>
      )}
    </div>
  )
}
