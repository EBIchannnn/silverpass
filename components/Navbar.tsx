'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
          ☕ SilverPass
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/quiz"
            className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            問題を解く
          </Link>

          {session ? (
            <div className="flex items-center gap-3">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? 'User'}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="bg-primary text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              ログイン
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
