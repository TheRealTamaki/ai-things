'use client'

import { useAuthStore } from '@/store/authStore'
import { signOut } from '@/lib/auth'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const { user } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
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

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/prompts', label: 'Prompts' },
    { href: '/workflows', label: 'Workflows' },
    { href: '/tags', label: 'Tags' },
  ]

  const isActive = (href: string) => {
    return pathname?.startsWith(href)
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300">
                AI Prompt Lab
              </h1>
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
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
