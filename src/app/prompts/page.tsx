'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import PromptCard from '@/components/prompts/PromptCard'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { useAuthStore } from '@/store/authStore'
import {
  getPrompts,
  getPinnedPrompts,
  deletePrompt,
  pinPrompt,
  unpinPrompt,
} from '@/lib/database/prompts'
import type { PromptWithTags } from '@/types/database'

export default function PromptsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthStore()
  const [prompts, setPrompts] = useState<PromptWithTags[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pinned'>('all')
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    promptId: string | null
    promptTitle: string
  }>({
    isOpen: false,
    promptId: null,
    promptTitle: '',
  })
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadPrompts()
    }
  }, [user, filter])

  const loadPrompts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = filter === 'pinned' ? await getPinnedPrompts() : await getPrompts()
      setPrompts(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load prompts')
    } finally {
      setLoading(false)
    }
  }

  const handlePin = async (promptId: string, currentlyPinned: boolean) => {
    if (!user) return

    try {
      if (currentlyPinned) {
        await unpinPrompt(promptId, user.id)
      } else {
        await pinPrompt(promptId, user.id)
      }
      await loadPrompts()
    } catch (err: any) {
      setError(err.message || 'Failed to update pin status')
    }
  }

  const handleDeleteClick = (promptId: string, promptTitle: string) => {
    setDeleteDialog({
      isOpen: true,
      promptId,
      promptTitle,
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.promptId) return

    try {
      setDeleteLoading(true)
      await deletePrompt(deleteDialog.promptId)
      setDeleteDialog({ isOpen: false, promptId: null, promptTitle: '' })
      await loadPrompts()
    } catch (err: any) {
      setError(err.message || 'Failed to delete prompt')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, promptId: null, promptTitle: '' })
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Prompts
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage and organize your AI prompts
            </p>
          </div>
          <button
            onClick={() => router.push('/prompts/new')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Prompt
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              filter === 'all'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            All Prompts
          </button>
          <button
            onClick={() => setFilter('pinned')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              filter === 'pinned'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Pinned
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading prompts...</p>
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {filter === 'pinned' ? 'No pinned prompts' : 'No prompts'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filter === 'pinned'
                ? 'Pin prompts to see them here'
                : 'Get started by creating a new prompt'}
            </p>
            {filter === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => router.push('/prompts/new')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Prompt
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onPin={handlePin}
                onDelete={(id) => handleDeleteClick(id, prompt.title)}
              />
            ))}
          </div>
        )}
      </main>

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Prompt"
        message={`Are you sure you want to delete "${deleteDialog.promptTitle}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
      />
    </div>
  )
}
