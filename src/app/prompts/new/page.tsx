'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import PromptForm from '@/components/prompts/PromptForm'
import { useAuthStore } from '@/store/authStore'
import { createPrompt, addTagsToPrompt } from '@/lib/database/prompts'
import { getTags } from '@/lib/database/tags'
import type { Tag } from '@/types/database'

export default function NewPromptPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthStore()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadTags()
    }
  }, [user])

  const loadTags = async () => {
    try {
      const data = await getTags()
      setTags(data)
    } catch (err) {
      console.error('Failed to load tags:', err)
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
    if (!user) return

    // Create the prompt
    const newPrompt = await createPrompt({
      user_id: user.id,
      title: data.title,
      description: data.description || null,
      content: data.content,
    })

    // Add tags if any were selected
    if (data.tagIds.length > 0) {
      await addTagsToPrompt(newPrompt.id, data.tagIds)
    }

    // Redirect to prompts list
    router.push('/prompts')
  }

  const handleCancel = () => {
    router.push('/prompts')
  }

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Prompt
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Add a new prompt to your collection
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <PromptForm
            availableTags={tags}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Create Prompt"
          />
        </div>

        {tags.length === 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Tip:</strong> You can create tags in the Tags section to organize your prompts better.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
