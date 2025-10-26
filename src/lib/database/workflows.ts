import { createClient } from '@/lib/supabase/client'
import type {
  Workflow,
  WorkflowInsert,
  WorkflowUpdate,
  WorkflowWithSteps,
  WorkflowStep,
  WorkflowStepInsert,
  WorkflowStepUpdate,
} from '@/types/database'

/**
 * Get all workflows for the current user
 */
export async function getWorkflows(): Promise<Workflow[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get a single workflow by ID with its steps
 */
export async function getWorkflowById(id: string): Promise<WorkflowWithSteps | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workflows')
    .select(`
      *,
      steps:workflow_steps(
        *,
        prompt:prompts(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  if (!data) return null

  // Sort steps by step_order
  const sortedSteps = (data.steps || []).sort((a: any, b: any) => a.step_order - b.step_order)

  return {
    ...data,
    steps: sortedSteps,
  }
}

/**
 * Create a new workflow
 */
export async function createWorkflow(workflow: WorkflowInsert): Promise<Workflow> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workflows')
    .insert(workflow)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update an existing workflow
 */
export async function updateWorkflow(id: string, updates: WorkflowUpdate): Promise<Workflow> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workflows')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a workflow
 */
export async function deleteWorkflow(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Get workflow count for the current user
 */
export async function getWorkflowCount(): Promise<number> {
  const supabase = createClient()

  const { count, error } = await supabase
    .from('workflows')
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return count || 0
}

// ======================================
// WORKFLOW STEPS
// ======================================

/**
 * Get all steps for a workflow
 */
export async function getWorkflowSteps(workflowId: string): Promise<WorkflowStep[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workflow_steps')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('step_order', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Create a new workflow step
 */
export async function createWorkflowStep(step: WorkflowStepInsert): Promise<WorkflowStep> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workflow_steps')
    .insert(step)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update an existing workflow step
 */
export async function updateWorkflowStep(
  id: string,
  updates: WorkflowStepUpdate
): Promise<WorkflowStep> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workflow_steps')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a workflow step
 */
export async function deleteWorkflowStep(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('workflow_steps')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Reorder workflow steps
 */
export async function reorderWorkflowSteps(
  workflowId: string,
  stepIds: string[]
): Promise<void> {
  const supabase = createClient()

  // Update each step with its new order
  const updates = stepIds.map((stepId, index) => ({
    id: stepId,
    step_order: index + 1,
  }))

  for (const update of updates) {
    const { error } = await supabase
      .from('workflow_steps')
      .update({ step_order: update.step_order })
      .eq('id', update.id)
      .eq('workflow_id', workflowId)

    if (error) throw error
  }
}
