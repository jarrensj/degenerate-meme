'use client'

import { stickerOptions } from '../data/stickerOptions'

interface PromptSelectorProps {
  selectedOption: string
  setSelectedOption: (option: string) => void
  customText: string
  setCustomText: (text: string) => void
  useCustomInput: boolean
  setUseCustomInput: (use: boolean) => void
  loading: boolean
}

export default function PromptSelector({
  selectedOption,
  setSelectedOption,
  customText,
  setCustomText,
  useCustomInput,
  setUseCustomInput,
  loading
}: PromptSelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Choose what to create
        </label>
        <button
          type="button"
          onClick={() => setUseCustomInput(!useCustomInput)}
          className="text-sm text-green-600 hover:text-green-800 underline"
        >
          {useCustomInput ? 'Use presets' : 'Use custom input'}
        </button>
      </div>
      
      {useCustomInput ? (
        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Enter your custom prompt here... (e.g., 'Create a sushi unicorn')"
          className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          disabled={loading}
        />
      ) : (
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          disabled={loading}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select an option...</option>
          {stickerOptions.map((option) => (
            <option key={option.id} value={option.prompt}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
