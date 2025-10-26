'use client'

import { useAuthStore } from '@/store/authStore'
import { signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Navbar() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              AI Prompt Lab
            </h1>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
