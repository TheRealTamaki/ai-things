'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { useAuthStore } from '@/store/authStore'
import { getTags, createTag, updateTag, deleteTag } from '@/lib/database/tags'
import type { Tag } from '@/types/database'

const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
]

export default function TagsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthStore()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(DEFAULT_COLORS[0])
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    tagId: string | null
    tagName: string
  }>({
    isOpen: false,
    tagId: null,
    tagName: '',
  })
  const [deleteLoading, setDeleteLoading] = useState(false)

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
      setLoading(true)
      setError(null)
      const data = await getTags()
      setTags(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load tags')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTag = async () => {
    if (!user || !newTagName.trim()) return

    try {
      setError(null)
      await createTag({
        user_id: user.id,
        name: newTagName.trim(),
        color: newTagColor,
      })
      setNewTagName('')
      setNewTagColor(DEFAULT_COLORS[0])
      setIsCreating(false)
      await loadTags()
    } catch (err: any) {
      setError(err.message || 'Failed to create tag')
    }
  }

  const handleUpdateTag = async () => {
    if (!editingTag || !newTagName.trim()) return

    try {
      setError(null)
      await updateTag(editingTag.id, {
        name: newTagName.trim(),
        color: newTagColor,
      })
      setEditingTag(null)
      setNewTagName('')
      setNewTagColor(DEFAULT_COLORS[0])
      await loadTags()
    } catch (err: any) {
      setError(err.message || 'Failed to update tag')
    }
  }

  const startEdit = (tag: Tag) => {
    setEditingTag(tag)
    setNewTagName(tag.name)
    setNewTagColor(tag.color)
    setIsCreating(false)
  }

  const cancelEdit = () => {
    setEditingTag(null)
    setIsCreating(false)
    setNewTagName('')
    setNewTagColor(DEFAULT_COLORS[0])
  }

  const handleDeleteClick = (tagId: string, tagName: string) => {
    setDeleteDialog({
      isOpen: true,
      tagId,
      tagName,
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.tagId) return

    try {
      setDeleteLoading(true)
      await deleteTag(deleteDialog.tagId)
      setDeleteDialog({ isOpen: false, tagId: null, tagName: '' })
      await loadTags()
    } catch (err: any) {
      setError(err.message || 'Failed to delete tag')
    } finally {
      setDeleteLoading(false)
    }
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tags</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Organize your prompts with custom tags
            </p>
          </div>
          <button
            onClick={() => {
              setIsCreating(true)
              setEditingTag(null)
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Tag
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Create/Edit Form */}
        {(isCreating || editingTag) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingTag ? 'Edit Tag' : 'Create New Tag'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  maxLength={50}
                  placeholder="Enter tag name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewTagColor(color)}
                      className={`w-10 h-10 rounded-full transition-transform ${
                        newTagColor === color ? 'scale-125 ring-2 ring-offset-2 ring-blue-600' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-10 h-10 rounded-full cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview
                </label>
                <span
                  className="inline-block px-3 py-1 text-sm rounded-full text-white"
                  style={{ backgroundColor: newTagColor }}
                >
                  {newTagName || 'Tag Name'}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={editingTag ? handleUpdateTag : handleCreateTag}
                  disabled={!newTagName.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingTag ? 'Update Tag' : 'Create Tag'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tags List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tags...</p>
          </div>
        ) : tags.length === 0 ? (
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
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tags</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new tag
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {tags.map((tag) => (
                <li
                  key={tag.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span
                        className="px-4 py-2 rounded-full text-white font-medium"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {tag.color}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(tag)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(tag.id, tag.name)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Tag"
        message={`Are you sure you want to delete "${deleteDialog.tagName}"? This will remove the tag from all prompts.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ isOpen: false, tagId: null, tagName: '' })}
        loading={deleteLoading}
      />
    </div>
  )
}
