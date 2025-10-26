'use client'

import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/Navbar'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Your Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You are successfully logged in as: <span className="font-semibold">{user.email}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Prompts
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">0</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Total prompts stored</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                Workflows
              </h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">0</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">Active workflows</p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Pinned
              </h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">0</p>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Favorite prompts</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Coming soon:</strong> Prompt management, workflow builder, RICECO generator, and Claude API integration!
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
