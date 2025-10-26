'use client'

import { PromptWithTags } from '@/types/database'
import Link from 'next/link'

interface PromptCardProps {
  prompt: PromptWithTags
  onPin?: (id: string, isPinned: boolean) => void
  onDelete?: (id: string) => void
}

export default function PromptCard({ prompt, onPin, onDelete }: PromptCardProps) {
  const handlePinClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onPin) {
      onPin(prompt.id, prompt.isPinned || false)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete) {
      onDelete(prompt.id)
    }
  }

  return (
    <Link href={`/prompts/${prompt.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700 h-full flex flex-col cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 line-clamp-2">
            {prompt.title}
          </h3>
          <button
            onClick={handlePinClick}
            className="ml-2 text-gray-400 hover:text-yellow-500 transition-colors"
            title={prompt.isPinned ? 'Unpin' : 'Pin'}
          >
            {prompt.isPinned ? (
              <svg className="w-5 h-5 fill-yellow-500" viewBox="0 0 24 24">
                <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>
        </div>

        {prompt.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {prompt.description}
          </p>
        )}

        <div className="mb-3 flex-1">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {prompt.content}
          </p>
        </div>

        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {prompt.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 text-xs rounded-full text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(prompt.created_at).toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            <Link
              href={`/prompts/${prompt.id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
            >
              Edit
            </Link>
            <button
              onClick={handleDeleteClick}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
