'use client'

interface ErrorDisplayProps {
  error: string
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) {
    return null
  }

  return (
    <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 w-full max-w-2xl">
      <strong>Error:</strong> {error}
    </div>
  )
}
