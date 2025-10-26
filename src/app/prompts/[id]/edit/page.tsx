'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import Navbar from '@/components/Navbar'
import PromptForm from '@/components/prompts/PromptForm'
import { useAuthStore } from '@/store/authStore'
import {
  getPromptById,
  updatePrompt,
  addTagsToPrompt,
  removeTagFromPrompt,
} from '@/lib/database/prompts'
import { getTags } from '@/lib/database/tags'
import type { PromptWithTags, Tag } from '@/types/database'

export default function EditPromptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user, loading: authLoading } = useAuthStore()
  const [prompt, setPrompt] = useState<PromptWithTags | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, resolvedParams.id])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [promptData, tagsData] = await Promise.all([
        getPromptById(resolvedParams.id),
        getTags(),
      ])

      if (!promptData) {
        setError('Prompt not found')
      } else {
        setPrompt(promptData)
        setTags(tagsData)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: {
    title: string
    description: string
    content: string
    tagIds: string[]
  }) => {
    if (!prompt) return

    // Update the prompt
    await updatePrompt(prompt.id, {
      title: data.title,
      description: data.description || null,
      content: data.content,
    })

    // Handle tag changes
    const currentTagIds = prompt.tags.map((t) => t.id)
    const tagsToAdd = data.tagIds.filter((id) => !currentTagIds.includes(id))
    const tagsToRemove = currentTagIds.filter((id) => !data.tagIds.includes(id))

    // Add new tags
    if (tagsToAdd.length > 0) {
      await addTagsToPrompt(prompt.id, tagsToAdd)
    }

    // Remove old tags
    for (const tagId of tagsToRemove) {
      await removeTagFromPrompt(prompt.id, tagId)
    }

    // Redirect back to prompt detail
    router.push(`/prompts/${prompt.id}`)
  }

  const handleCancel = () => {
    router.push(`/prompts/${resolvedParams.id}`)
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
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={handleCancel}
          className="mb-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Cancel
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Prompt</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Update your prompt information
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <PromptForm
            initialData={{
              title: prompt.title,
              description: prompt.description || '',
              content: prompt.content,
              tagIds: prompt.tags.map((t) => t.id),
            }}
            availableTags={tags}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Save Changes"
          />
        </div>
      </main>
    </div>
  )
}
