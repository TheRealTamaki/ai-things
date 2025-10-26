'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import WorkflowCard from '@/components/workflows/WorkflowCard'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { useAuthStore } from '@/store/authStore'
import { getWorkflows, deleteWorkflow, getWorkflowSteps } from '@/lib/database/workflows'
import type { Workflow } from '@/types/database'

export default function WorkflowsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthStore()
  const [workflows, setWorkflows] = useState<(Workflow & { stepCount?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    workflowId: string | null
    workflowName: string
  }>({
    isOpen: false,
    workflowId: null,
    workflowName: '',
  })
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadWorkflows()
    }
  }, [user])

  const loadWorkflows = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getWorkflows()

      // Load step counts for each workflow
      const workflowsWithCounts = await Promise.all(
        data.map(async (workflow) => {
          const steps = await getWorkflowSteps(workflow.id)
          return {
            ...workflow,
            stepCount: steps.length,
          }
        })
      )

      setWorkflows(workflowsWithCounts)
    } catch (err: any) {
      setError(err.message || 'Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (workflowId: string, workflowName: string) => {
    setDeleteDialog({
      isOpen: true,
      workflowId,
      workflowName,
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.workflowId) return

    try {
      setDeleteLoading(true)
      await deleteWorkflow(deleteDialog.workflowId)
      setDeleteDialog({ isOpen: false, workflowId: null, workflowName: '' })
      await loadWorkflows()
    } catch (err: any) {
      setError(err.message || 'Failed to delete workflow')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, workflowId: null, workflowName: '' })
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
              Workflows
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create and manage multi-step prompt workflows
            </p>
          </div>
          <button
            onClick={() => router.push('/workflows/new')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Workflow
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
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
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No workflows
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first workflow
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/workflows/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Workflow
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onDelete={(id) => handleDeleteClick(id, workflow.name)}
              />
            ))}
          </div>
        )}
      </main>

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Workflow"
        message={`Are you sure you want to delete "${deleteDialog.workflowName}"? This will also delete all steps in this workflow. This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
      />
    </div>
  )
}
