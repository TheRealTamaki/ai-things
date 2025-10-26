'use client'

import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/Navbar'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getPromptCount, getPinnedPrompts } from '@/lib/database/prompts'
import { getWorkflowCount } from '@/lib/database/workflows'
import { getTags } from '@/lib/database/tags'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState({
    prompts: 0,
    workflows: 0,
    pinned: 0,
    tags: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    try {
      setStatsLoading(true)
      const [promptCount, pinnedPromptsData, workflowCount, tagsData] = await Promise.all([
        getPromptCount(),
        getPinnedPrompts(),
        getWorkflowCount(),
        getTags(),
      ])

      setStats({
        prompts: promptCount,
        workflows: workflowCount,
        pinned: pinnedPromptsData.length,
        tags: tagsData.length,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back, <span className="font-semibold">{user.email}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/prompts" className="block">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Prompts
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {statsLoading ? '...' : stats.prompts}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Total prompts</p>
                </div>
                <svg className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </Link>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                  Workflows
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {statsLoading ? '...' : stats.workflows}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">Total workflows</p>
              </div>
              <svg className="w-12 h-12 text-green-600 dark:text-green-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
          </div>

          <Link href="/prompts?filter=pinned" className="block">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Pinned
                  </h3>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {statsLoading ? '...' : stats.pinned}
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Pinned prompts</p>
                </div>
                <svg className="w-12 h-12 text-purple-600 dark:text-purple-400 opacity-50 fill-current" viewBox="0 0 24 24">
                  <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/tags" className="block">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    Tags
                  </h3>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {statsLoading ? '...' : stats.tags}
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">Organization tags</p>
                </div>
                <svg className="w-12 h-12 text-amber-600 dark:text-amber-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/prompts/new" className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">New Prompt</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create a new AI prompt</p>
              </div>
            </Link>

            <Link href="/tags" className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Manage Tags</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Organize your prompts</p>
              </div>
            </Link>

            <Link href="/prompts" className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Browse Prompts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View all your prompts</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Coming soon:</strong> Workflow builder, RICECO framework generator, and Claude API integration!
          </p>
        </div>
      </main>
    </div>
  )
}
