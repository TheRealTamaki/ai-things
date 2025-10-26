'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import WorkflowForm from '@/components/workflows/WorkflowForm'
import { useAuthStore } from '@/store/authStore'
import { createWorkflow } from '@/lib/database/workflows'

export default function NewWorkflowPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthStore()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (data: { name: string; description: string }) => {
    if (!user) return

    const newWorkflow = await createWorkflow({
      user_id: user.id,
      name: data.name,
      description: data.description || null,
    })

    // Redirect to workflow detail page to add steps
    router.push(`/workflows/${newWorkflow.id}`)
  }

  const handleCancel = () => {
    router.push('/workflows')
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Workflow
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Build a multi-step prompt workflow
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <WorkflowForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Create Workflow"
          />
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Next step:</strong> After creating the workflow, you&apos;ll be able to add steps using saved prompts or custom prompts.
          </p>
        </div>
      </main>
    </div>
  )
}
