'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import Navbar from '@/components/Navbar'
import WorkflowForm from '@/components/workflows/WorkflowForm'
import { useAuthStore } from '@/store/authStore'
import { getWorkflowById, updateWorkflow } from '@/lib/database/workflows'
import type { Workflow } from '@/types/database'

export default function EditWorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user, loading: authLoading } = useAuthStore()
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadWorkflow()
    }
  }, [user, resolvedParams.id])

  const loadWorkflow = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getWorkflowById(resolvedParams.id)
      if (!data) {
        setError('Workflow not found')
      } else {
        setWorkflow(data)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load workflow')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: { name: string; description: string }) => {
    if (!workflow) return

    await updateWorkflow(workflow.id, {
      name: data.name,
      description: data.description || null,
    })

    router.push(`/workflows/${workflow.id}`)
  }

  const handleCancel = () => {
    router.push(`/workflows/${resolvedParams.id}`)
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
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading workflow...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !workflow) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error || 'Workflow not found'}</p>
          </div>
          <button
            onClick={() => router.push('/workflows')}
            className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            ← Back to workflows
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Workflow</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Update workflow information
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <WorkflowForm
            initialData={{
              name: workflow.name,
              description: workflow.description || '',
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Save Changes"
          />
        </div>
      </main>
    </div>
  )
}
