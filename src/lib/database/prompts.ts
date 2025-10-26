import { createClient } from '@/lib/supabase/client'
import type { Prompt, PromptInsert, PromptUpdate, PromptWithTags } from '@/types/database'

/**
 * Get all prompts for the current user
 */
export async function getPrompts(): Promise<PromptWithTags[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      tags:prompt_tags(tag:tags(*)),
      pinned_prompts(id)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Transform the data to include tags and isPinned
  return (data || []).map(prompt => ({
    ...prompt,
    tags: prompt.tags?.map((pt: any) => pt.tag) || [],
    isPinned: !!prompt.pinned_prompts?.length,
  }))
}

/**
 * Get a single prompt by ID
 */
export async function getPromptById(id: string): Promise<PromptWithTags | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      tags:prompt_tags(tag:tags(*)),
      pinned_prompts(id)
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  if (!data) return null

  return {
    ...data,
    tags: data.tags?.map((pt: any) => pt.tag) || [],
    isPinned: !!data.pinned_prompts?.length,
  }
}

/**
 * Search prompts by title or content
 */
export async function searchPrompts(query: string): Promise<PromptWithTags[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      tags:prompt_tags(tag:tags(*)),
      pinned_prompts(id)
    `)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map(prompt => ({
    ...prompt,
    tags: prompt.tags?.map((pt: any) => pt.tag) || [],
    isPinned: !!prompt.pinned_prompts?.length,
  }))
}

/**
 * Get prompts filtered by tag
 */
export async function getPromptsByTag(tagId: string): Promise<PromptWithTags[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      tags:prompt_tags!inner(tag:tags(*)),
      pinned_prompts(id)
    `)
    .eq('tags.tag_id', tagId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map(prompt => ({
    ...prompt,
    tags: prompt.tags?.map((pt: any) => pt.tag) || [],
    isPinned: !!prompt.pinned_prompts?.length,
  }))
}

/**
 * Get pinned prompts for the current user
 */
export async function getPinnedPrompts(): Promise<PromptWithTags[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      tags:prompt_tags(tag:tags(*)),
      pinned_prompts!inner(id)
    `)
    .order('pinned_prompts(pinned_at)', { ascending: false })

  if (error) throw error

  return (data || []).map(prompt => ({
    ...prompt,
    tags: prompt.tags?.map((pt: any) => pt.tag) || [],
    isPinned: true,
  }))
}

/**
 * Create a new prompt
 */
export async function createPrompt(prompt: PromptInsert): Promise<Prompt> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('prompts')
    .insert(prompt)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update an existing prompt
 */
export async function updatePrompt(id: string, updates: PromptUpdate): Promise<Prompt> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('prompts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a prompt
 */
export async function deletePrompt(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Add tags to a prompt
 */
export async function addTagsToPrompt(promptId: string, tagIds: string[]): Promise<void> {
  const supabase = createClient()

  const promptTags = tagIds.map(tagId => ({
    prompt_id: promptId,
    tag_id: tagId,
  }))

  const { error } = await supabase
    .from('prompt_tags')
    .insert(promptTags)

  if (error) throw error
}

/**
 * Remove a tag from a prompt
 */
export async function removeTagFromPrompt(promptId: string, tagId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('prompt_tags')
    .delete()
    .eq('prompt_id', promptId)
    .eq('tag_id', tagId)

  if (error) throw error
}

/**
 * Pin a prompt
 */
export async function pinPrompt(promptId: string, userId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('pinned_prompts')
    .insert({
      user_id: userId,
      prompt_id: promptId,
    })

  if (error) throw error
}

/**
 * Unpin a prompt
 */
export async function unpinPrompt(promptId: string, userId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('pinned_prompts')
    .delete()
    .eq('user_id', userId)
    .eq('prompt_id', promptId)

  if (error) throw error
}

/**
 * Get prompt count for the current user
 */
export async function getPromptCount(): Promise<number> {
  const supabase = createClient()

  const { count, error } = await supabase
    .from('prompts')
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return count || 0
}
