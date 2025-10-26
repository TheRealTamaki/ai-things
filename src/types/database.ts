// Database types for AI Prompt Lab
// Auto-generated types matching Supabase schema

export interface Prompt {
  id: string
  user_id: string
  title: string
  description: string | null
  content: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface PromptTag {
  prompt_id: string
  tag_id: string
  created_at: string
}

export interface PinnedPrompt {
  id: string
  user_id: string
  prompt_id: string
  pinned_at: string
}

export interface Workflow {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface WorkflowStep {
  id: string
  workflow_id: string
  prompt_id: string | null
  step_order: number
  custom_prompt: string | null
  notes: string | null
  created_at: string
}

// Extended types with relationships
export interface PromptWithTags extends Prompt {
  tags: Tag[]
  isPinned?: boolean
}

export interface WorkflowWithSteps extends Workflow {
  steps: WorkflowStepWithPrompt[]
}

export interface WorkflowStepWithPrompt extends WorkflowStep {
  prompt?: Prompt | null
}

// Insert types (without auto-generated fields)
export type PromptInsert = Omit<Prompt, 'id' | 'created_at' | 'updated_at'>
export type TagInsert = Omit<Tag, 'id' | 'created_at'>
export type PromptTagInsert = Omit<PromptTag, 'created_at'>
export type PinnedPromptInsert = Omit<PinnedPrompt, 'id' | 'pinned_at'>
export type WorkflowInsert = Omit<Workflow, 'id' | 'created_at' | 'updated_at'>
export type WorkflowStepInsert = Omit<WorkflowStep, 'id' | 'created_at'>

// Update types (all fields optional except id)
export type PromptUpdate = Partial<Omit<Prompt, 'id' | 'user_id' | 'created_at'>>
export type TagUpdate = Partial<Omit<Tag, 'id' | 'user_id' | 'created_at'>>
export type WorkflowUpdate = Partial<Omit<Workflow, 'id' | 'user_id' | 'created_at'>>
export type WorkflowStepUpdate = Partial<Omit<WorkflowStep, 'id' | 'workflow_id' | 'created_at'>>

// Database response types
export interface Database {
  public: {
    Tables: {
      prompts: {
        Row: Prompt
        Insert: PromptInsert
        Update: PromptUpdate
      }
      tags: {
        Row: Tag
        Insert: TagInsert
        Update: TagUpdate
      }
      prompt_tags: {
        Row: PromptTag
        Insert: PromptTagInsert
        Update: never
      }
      pinned_prompts: {
        Row: PinnedPrompt
        Insert: PinnedPromptInsert
        Update: never
      }
      workflows: {
        Row: Workflow
        Insert: WorkflowInsert
        Update: WorkflowUpdate
      }
      workflow_steps: {
        Row: WorkflowStep
        Insert: WorkflowStepInsert
        Update: WorkflowStepUpdate
      }
    }
  }
}
