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
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Number of images to generate
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => setImageCount(num)}
            disabled={loading}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
              imageCount === num
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  )
}
