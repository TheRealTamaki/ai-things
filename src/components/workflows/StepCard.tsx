'use client'

import { WorkflowStepWithPrompt } from '@/types/database'

interface StepCardProps {
  step: WorkflowStepWithPrompt
  stepNumber: number
  onEdit?: (step: WorkflowStepWithPrompt) => void
  onDelete?: (stepId: string) => void
  onMoveUp?: (stepId: string) => void
  onMoveDown?: (stepId: string) => void
  isFirst?: boolean
  isLast?: boolean
}

export default function StepCard({
  step,
  stepNumber,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: StepCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start gap-4">
        {/* Step Number Badge */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
            {stepNumber}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 min-w-0">
          {step.prompt ? (
            <div>
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {step.prompt.title}
                </h4>
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded">
                  Saved Prompt
                </span>
              </div>
              {step.prompt.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {step.prompt.description}
                </p>
              )}
              <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 mt-2">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 font-mono">
                  {step.prompt.content}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Custom Prompt
                </h4>
                <span className="ml-2 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 rounded">
                  Custom
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 font-mono">
                  {step.custom_prompt}
                </p>
              </div>
            </div>
          )}

          {step.notes && (
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-400">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> {step.notes}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {!isFirst && onMoveUp && (
            <button
              onClick={() => onMoveUp(step.id)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title="Move up"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
          {!isLast && onMoveDown && (
            <button
              onClick={() => onMoveDown(step.id)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title="Move down"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(step)}
              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              title="Edit step"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(step.id)}
              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              title="Delete step"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
