import { createClient } from '@/lib/supabase/client'
import type { Tag, TagInsert, TagUpdate } from '@/types/database'

/**
 * Get all tags for the current user
 */
export async function getTags(): Promise<Tag[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Get a single tag by ID
 */
export async function getTagById(id: string): Promise<Tag | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new tag
 */
export async function createTag(tag: TagInsert): Promise<Tag> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tags')
    .insert(tag)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update an existing tag
 */
export async function updateTag(id: string, updates: TagUpdate): Promise<Tag> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tags')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a tag
 */
export async function deleteTag(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Get tags used by a specific prompt
 */
export async function getTagsByPromptId(promptId: string): Promise<Tag[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tags')
    .select(`
      *,
      prompt_tags!inner(prompt_id)
    `)
    .eq('prompt_tags.prompt_id', promptId)

  if (error) throw error
  return data || []
}
