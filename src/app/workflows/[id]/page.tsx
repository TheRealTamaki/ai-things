'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import Navbar from '@/components/Navbar'
import StepCard from '@/components/workflows/StepCard'
import AddStepDialog from '@/components/workflows/AddStepDialog'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { useAuthStore } from '@/store/authStore'
import {
  getWorkflowById,
  deleteWorkflow,
  createWorkflowStep,
  updateWorkflowStep,
  deleteWorkflowStep,
  reorderWorkflowSteps,
} from '@/lib/database/workflows'
import type { WorkflowWithSteps, WorkflowStepWithPrompt } from '@/types/database'

export default function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user, loading: authLoading } = useAuthStore()
  const [workflow, setWorkflow] = useState<WorkflowWithSteps | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addStepDialog, setAddStepDialog] = useState(false)
  const [editingStep, setEditingStep] = useState<WorkflowStepWithPrompt | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    type: 'workflow' | 'step'
    id: string | null
    name: string
  }>({
    isOpen: false,
    type: 'workflow',
    id: null,
    name: '',
  })
  const [deleteLoading, setDeleteLoading] = useState(false)

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

  const handleAddStep = async (data: {
    promptId: string | null
    customPrompt: string | null
    notes: string
  }) => {
    if (!workflow) return

    const nextOrder = workflow.steps.length + 1

    await createWorkflowStep({
      workflow_id: workflow.id,
      prompt_id: data.promptId,
      custom_prompt: data.customPrompt,
      notes: data.notes || null,
      step_order: nextOrder,
    })

    await loadWorkflow()
  }

  const handleEditStep = async (data: {
    promptId: string | null
    customPrompt: string | null
    notes: string
  }) => {
    if (!editingStep) return

    await updateWorkflowStep(editingStep.id, {
      prompt_id: data.promptId,
      custom_prompt: data.customPrompt,
      notes: data.notes || null,
    })

    setEditingStep(null)
    await loadWorkflow()
  }

  const handleDeleteStep = async (stepId: string) => {
    const step = workflow?.steps.find((s) => s.id === stepId)
    if (!step) return

    setDeleteDialog({
      isOpen: true,
      type: 'step',
      id: stepId,
      name: step.prompt?.title || 'Custom Prompt',
    })
  }

  const handleDeleteWorkflow = () => {
    if (!workflow) return

    setDeleteDialog({
      isOpen: true,
      type: 'workflow',
      id: workflow.id,
      name: workflow.name,
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.id) return

    try {
      setDeleteLoading(true)
      if (deleteDialog.type === 'workflow') {
        await deleteWorkflow(deleteDialog.id)
        router.push('/workflows')
      } else {
        await deleteWorkflowStep(deleteDialog.id)
        await loadWorkflow()
        setDeleteDialog({ isOpen: false, type: 'step', id: null, name: '' })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleMoveStep = async (stepId: string, direction: 'up' | 'down') => {
    if (!workflow) return

    const currentIndex = workflow.steps.findIndex((s) => s.id === stepId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= workflow.steps.length) return

    // Create new order
    const newSteps = [...workflow.steps]
    const [movedStep] = newSteps.splice(currentIndex, 1)
    newSteps.splice(newIndex, 0, movedStep)

    // Update order in database
    await reorderWorkflowSteps(
      workflow.id,
      newSteps.map((s) => s.id)
    )

    await loadWorkflow()
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
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/workflows')}
          className="mb-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to workflows
        </button>

        {/* Workflow Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {workflow.name}
                </h1>
                {workflow.description && (
                  <p className="text-gray-600 dark:text-gray-400">{workflow.description}</p>
                )}
              </div>
              <svg
                className="w-12 h-12 text-green-600 dark:text-green-400 opacity-50"
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

            <div className="flex gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Created: {new Date(workflow.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span>{workflow.steps.length} {workflow.steps.length === 1 ? 'step' : 'steps'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900 flex gap-3">
            <button
              onClick={() => setAddStepDialog(true)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Step
            </button>
            <button
              onClick={() => router.push(`/workflows/${workflow.id}/edit`)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Details
            </button>
            <button
              onClick={handleDeleteWorkflow}
              className="px-6 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Steps */}
        {workflow.steps.length === 0 ? (
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No steps yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding your first step to this workflow
            </p>
            <div className="mt-6">
              <button
                onClick={() => setAddStepDialog(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add First Step
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Workflow Steps
            </h2>
            {workflow.steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                stepNumber={index + 1}
                onEdit={setEditingStep}
                onDelete={handleDeleteStep}
                onMoveUp={(id) => handleMoveStep(id, 'up')}
                onMoveDown={(id) => handleMoveStep(id, 'down')}
                isFirst={index === 0}
                isLast={index === workflow.steps.length - 1}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Step Dialog */}
      <AddStepDialog
        isOpen={addStepDialog}
        onClose={() => setAddStepDialog(false)}
        onAdd={handleAddStep}
      />

      {/* Edit Step Dialog */}
      {editingStep && (
        <AddStepDialog
          isOpen={true}
          onClose={() => setEditingStep(null)}
          onAdd={handleEditStep}
          initialData={{
            promptId: editingStep.prompt_id,
            customPrompt: editingStep.custom_prompt,
            notes: editingStep.notes || '',
          }}
          editMode={true}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={deleteDialog.type === 'workflow' ? 'Delete Workflow' : 'Delete Step'}
        message={
          deleteDialog.type === 'workflow'
            ? `Are you sure you want to delete "${deleteDialog.name}"? This will also delete all steps. This action cannot be undone.`
            : `Are you sure you want to delete this step? This action cannot be undone.`
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ isOpen: false, type: 'step', id: null, name: '' })}
        loading={deleteLoading}
      />
    </div>
  )
}
