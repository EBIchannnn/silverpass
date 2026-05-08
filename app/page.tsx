'use client'

import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { ScoreChart } from '@/components/ScoreChart'

interface DashboardData {
  todayCount: number
  todayCorrect: number
  todayRate: number
  categoryScores: Array<{
    category: string
    total: number
    correct: number
    rate: number
  }>
  isPremium: boolean
  dailyLimit: number | null
  remainingToday: number | null
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/dashboard')
        .then((r) => r.json())
        .then((d: DashboardData) => setDashboard(d))
        .catch(() => {})
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  // 未ログイン
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="text-7xl mb-6">☕</div>
          <h1 className="text-4xl font-bold text-primary mb-3">SilverPass</h1>
          <p className="text-gray-500 mb-2 text-lg">Java Silver 合格への近道</p>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            AI解説付きの問題演習で、Oracle Java SE 11 Silver を<br />
            効率よく攻略しましょう
          </p>

          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-primary">50問</div>
              <div className="text-xs text-gray-500">収録問題数</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-primary">8分野</div>
              <div className="text-xs text-gray-500">試験範囲カバー</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-primary">AI解説</div>
              <div className="text-xs text-gray-500">Claude powered</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/quiz"
              className="bg-primary text-white font-bold py-4 px-8 rounded-2xl text-lg hover:opacity-90 transition-opacity shadow-md"
            >
              問題を解いてみる
            </Link>
            <button
              onClick={() => signIn('google')}
              className="bg-white border-2 border-gray-200 text-gray-700 font-medium py-4 px-8 rounded-2xl text-lg hover:border-primary transition-colors"
            >
              ログインして履歴保存
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ログイン済み
  const remaining = dashboard?.remainingToday
  const limitReached = remaining !== null && remaining === 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            おかえりなさい、{session.user?.name?.split(' ')[0]}さん！ 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">今日も一問一問コツコツと</p>
        </div>

        {/* 今日の成績カード */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">今日の正解率</p>
            <p className="text-3xl font-bold text-primary">
              {dashboard?.todayRate ?? 0}
              <span className="text-lg">%</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {dashboard?.todayCorrect ?? 0}/{dashboard?.todayCount ?? 0} 問正解
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">残り問題数（今日）</p>
            {dashboard?.isPremium ? (
              <p className="text-3xl font-bold text-accent">∞</p>
            ) : (
              <p className={`text-3xl font-bold ${limitReached ? 'text-red-400' : 'text-accent'}`}>
                {remaining ?? 10}
                <span className="text-lg">問</span>
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {dashboard?.isPremium ? 'プレミアム会員' : '無料プラン (10問/日)'}
            </p>
          </div>
        </div>

        {/* 問題を解くボタン */}
        {limitReached ? (
          <div className="bg-gray-100 rounded-2xl p-6 text-center mb-6">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-bold text-gray-700 mb-1">今日の上限に達しました！</p>
            <p className="text-gray-500 text-sm">明日また頑張りましょう</p>
          </div>
        ) : (
          <Link
            href="/quiz"
            className="block w-full bg-primary text-white text-center font-bold py-4 rounded-2xl text-lg hover:opacity-90 transition-opacity shadow-md mb-6"
          >
            問題を解く →
          </Link>
        )}

        {/* 分野別スコア */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">分野別スコア</h2>
          <ScoreChart scores={dashboard?.categoryScores ?? []} />
        </div>
      </div>
    </div>
  )
}
