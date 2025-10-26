'use client'

import { useState, useEffect } from 'react'
import { Prompt } from '@/types/database'
import { getPrompts } from '@/lib/database/prompts'

interface AddStepDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: {
    promptId: string | null
    customPrompt: string | null
    notes: string
  }) => Promise<void>
  initialData?: {
    promptId: string | null
    customPrompt: string | null
    notes: string
  }
  editMode?: boolean
}

export default function AddStepDialog({
  isOpen,
  onClose,
  onAdd,
  initialData,
  editMode = false,
}: AddStepDialogProps) {
  const [mode, setMode] = useState<'saved' | 'custom'>(
    initialData?.promptId ? 'saved' : 'custom'
  )
  const [promptId, setPromptId] = useState(initialData?.promptId || '')
  const [customPrompt, setCustomPrompt] = useState(initialData?.customPrompt || '')
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPrompts, setLoadingPrompts] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadPrompts()
    }
  }, [isOpen])

  const loadPrompts = async () => {
    try {
      setLoadingPrompts(true)
      const data = await getPrompts()
      setPrompts(data)
    } catch (err) {
      console.error('Failed to load prompts:', err)
    } finally {
      setLoadingPrompts(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === 'saved' && !promptId) {
      setError('Please select a prompt')
      return
    }

    if (mode === 'custom' && !customPrompt.trim()) {
      setError('Please enter a custom prompt')
      return
    }

    setLoading(true)
    try {
      await onAdd({
        promptId: mode === 'saved' ? promptId : null,
        customPrompt: mode === 'custom' ? customPrompt : null,
        notes: notes.trim() || '',
      })
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Failed to add step')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setMode('saved')
    setPromptId('')
    setCustomPrompt('')
    setNotes('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Dialog */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {editMode ? 'Edit Step' : 'Add Step to Workflow'}
          </h3>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Mode Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Step Type
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setMode('saved')}
                  className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                    mode === 'saved'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                    <span className="font-medium">Saved Prompt</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('custom')}
                  className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                    mode === 'custom'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span className="font-medium">Custom Prompt</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Saved Prompt Selection */}
            {mode === 'saved' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Prompt <span className="text-red-500">*</span>
                </label>
                {loadingPrompts ? (
                  <div className="text-sm text-gray-500">Loading prompts...</div>
                ) : prompts.length === 0 ? (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-200">
                    No prompts available. Create a prompt first.
                  </div>
                ) : (
                  <select
                    value={promptId}
                    onChange={(e) => setPromptId(e.target.value)}
                    required={mode === 'saved'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a prompt...</option>
                    {prompts.map((prompt) => (
                      <option key={prompt.id} value={prompt.id}>
                        {prompt.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Custom Prompt Input */}
            {mode === 'custom' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Prompt <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  required={mode === 'custom'}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  placeholder="Enter your custom prompt..."
                />
              </div>
            )}

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Add any notes or instructions for this step..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : editMode ? 'Update Step' : 'Add Step'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
