'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import Navbar from '@/components/Navbar'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { useAuthStore } from '@/store/authStore'
import {
  getPromptById,
  deletePrompt,
  pinPrompt,
  unpinPrompt,
} from '@/lib/database/prompts'
import type { PromptWithTags } from '@/types/database'

export default function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user, loading: authLoading } = useAuthStore()
  const [prompt, setPrompt] = useState<PromptWithTags | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadPrompt()
    }
  }, [user, resolvedParams.id])

  const loadPrompt = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPromptById(resolvedParams.id)
      if (!data) {
        setError('Prompt not found')
      } else {
        setPrompt(data)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load prompt')
    } finally {
      setLoading(false)
    }
  }

  const handlePin = async () => {
    if (!user || !prompt) return

    try {
      if (prompt.isPinned) {
        await unpinPrompt(prompt.id, user.id)
      } else {
        await pinPrompt(prompt.id, user.id)
      }
      await loadPrompt()
    } catch (err: any) {
      setError(err.message || 'Failed to update pin status')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!prompt) return

    try {
      setDeleteLoading(true)
      await deletePrompt(prompt.id)
      router.push('/prompts')
    } catch (err: any) {
      setError(err.message || 'Failed to delete prompt')
    } finally {
      setDeleteLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!prompt) return
    try {
      await navigator.clipboard.writeText(prompt.content)
      // You could add a toast notification here
      alert('Prompt copied to clipboard!')
    } catch (err) {
      alert('Failed to copy to clipboard')
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading prompt...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error || 'Prompt not found'}
            </p>
          </div>
          <button
            onClick={() => router.push('/prompts')}
            className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            ← Back to prompts
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/prompts')}
          className="mb-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to prompts
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {prompt.title}
                </h1>
                {prompt.description && (
                  <p className="text-gray-600 dark:text-gray-400">{prompt.description}</p>
                )}
              </div>
              <button
                onClick={handlePin}
                className="ml-4 p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                title={prompt.isPinned ? 'Unpin' : 'Pin'}
              >
                {prompt.isPinned ? (
                  <svg className="w-6 h-6 fill-yellow-500" viewBox="0 0 24 24">
                    <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                )}
              </button>
            </div>

            {prompt.tags && prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {prompt.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 text-sm rounded-full text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Created: {new Date(prompt.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span>Updated: {new Date(prompt.updated_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Prompt Content
              </h2>
              <button
                onClick={copyToClipboard}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">
              {prompt.content}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {prompt.content.length} characters
            </p>
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            <button
              onClick={() => router.push(`/prompts/${prompt.id}/edit`)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Prompt
            </button>
            <button
              onClick={() => setDeleteDialog(true)}
              className="px-6 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </main>

      <DeleteConfirmDialog
        isOpen={deleteDialog}
        title="Delete Prompt"
        message={`Are you sure you want to delete "${prompt.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog(false)}
        loading={deleteLoading}
      />
    </div>
  )
}
