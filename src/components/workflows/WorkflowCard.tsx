'use client'

import { Workflow } from '@/types/database'
import Link from 'next/link'

interface WorkflowCardProps {
  workflow: Workflow & { stepCount?: number }
  onDelete?: (id: string) => void
}

export default function WorkflowCard({ workflow, onDelete }: WorkflowCardProps) {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete) {
      onDelete(workflow.id)
    }
  }

  return (
    <Link href={`/workflows/${workflow.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700 h-full flex flex-col cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 line-clamp-2">
            {workflow.name}
          </h3>
          <svg
            className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </div>

        {workflow.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
            {workflow.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(workflow.created_at).toLocaleDateString()}
            </span>
            {workflow.stepCount !== undefined && (
              <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                {workflow.stepCount} {workflow.stepCount === 1 ? 'step' : 'steps'}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/workflows/${workflow.id}/edit`}
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
