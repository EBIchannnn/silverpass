'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { QuizCard } from '@/components/QuizCard'
import { ExplanationBox } from '@/components/ExplanationBox'
import { ProgressBar } from '@/components/ProgressBar'
import { Navbar } from '@/components/Navbar'

interface Question {
  id: number
  category: string
  difficulty: number
  body: string
  codeBlock: string | null
  options: string
}

interface AnswerResult {
  isCorrect: boolean
  answerIndex: number
  explanation: string
  body: string
  codeBlock: string | null
  options: string
}

const DAILY_LIMIT = 10

export default function QuizPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answered, setAnswered] = useState<AnswerResult | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [limitReached, setLimitReached] = useState(false)

  const categories = [
    'all',
    'データ型と変数',
    '演算子',
    '制御フロー',
    'オブジェクト指向',
    '例外処理',
    'コレクション',
    'ラムダ式・Stream API',
    'モジュールシステム',
  ]

  const fetchQuestions = useCallback(async (category: string) => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '50' })
    if (category !== 'all') params.set('category', category)
    const res = await fetch(`/api/quiz?${params}`)
    const data = await res.json() as Question[]
    // ランダムに並び替え
    const shuffled = [...data].sort(() => Math.random() - 0.5)
    setQuestions(shuffled)
    setCurrentIndex(0)
    setAnswered(null)
    setSelectedIndex(null)
    setLoading(false)
  }, [])

  // 今日の回答数を取得（ログイン済みの場合）
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/dashboard')
        .then((r) => r.json())
        .then((d: { todayCount: number; isPremium: boolean }) => {
          setTodayCount(d.todayCount ?? 0)
          if (!d.isPremium && d.todayCount >= DAILY_LIMIT) {
            setLimitReached(true)
          }
        })
        .catch(() => {})
    }
  }, [session])

  useEffect(() => {
    fetchQuestions(categoryFilter)
  }, [fetchQuestions, categoryFilter])

  const handleSelect = async (index: number) => {
    if (submitting || answered) return

    // 無料プランの制限チェック
    if (session?.user?.id && !loading) {
      const currentTodayCount = todayCount
      if (currentTodayCount >= DAILY_LIMIT) {
        setLimitReached(true)
        return
      }
    }

    setSelectedIndex(index)
    setSubmitting(true)

    const question = questions[currentIndex]
    try {
      const res = await fetch(`/api/quiz/${question.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedIndex: index }),
      })
      const data = await res.json() as AnswerResult
      setAnswered(data)
      if (data.isCorrect) setSessionCorrect((n) => n + 1)
      setTodayCount((n) => n + 1)
    } catch {
      // エラー時はローカルで正誤判定（フォールバック）
      const options = JSON.parse(question.options) as string[]
      setAnswered({
        isCorrect: false,
        answerIndex: 0,
        explanation: '回答の送信に失敗しました',
        body: question.body,
        codeBlock: question.codeBlock,
        options: JSON.stringify(options),
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      // 全問終了 → 最初に戻る
      setCurrentIndex(0)
    } else {
      setCurrentIndex((i) => i + 1)
    }
    setAnswered(null)
    setSelectedIndex(null)
  }

  if (limitReached) {
    return (
      <>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            本日の制限に達しました
          </h2>
          <p className="text-gray-500 mb-6">
            無料プランは1日{DAILY_LIMIT}問まで利用できます。<br />
            明日またチャレンジしてください！
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary text-white font-medium px-6 py-3 rounded-xl hover:opacity-90"
          >
            ダッシュボードへ
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* カテゴリフィルター */}
        <div className="mb-4 overflow-x-auto">
          <div className="flex gap-2 pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  categoryFilter === cat
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                }`}
              >
                {cat === 'all' ? '全カテゴリ' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* 進捗 */}
        {questions.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-500">
                セッション正解: {sessionCorrect}問
              </span>
              {session?.user?.id && (
                <span className="text-sm text-gray-500">
                  今日: {todayCount}/{DAILY_LIMIT}問
                </span>
              )}
            </div>
            <ProgressBar current={currentIndex} total={questions.length} />
          </div>
        )}

        {/* 問題表示 */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <span className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            <p className="mt-3 text-gray-500">問題を読み込んでいます...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">問題が見つかりませんでした</p>
          </div>
        ) : (
          <>
            <QuizCard
              questionId={questions[currentIndex].id}
              category={questions[currentIndex].category}
              difficulty={questions[currentIndex].difficulty}
              body={questions[currentIndex].body}
              codeBlock={questions[currentIndex].codeBlock}
              options={JSON.parse(questions[currentIndex].options) as string[]}
              selectedIndex={selectedIndex}
              answerIndex={answered?.answerIndex ?? null}
              onSelect={handleSelect}
            />

            {/* AI解説 */}
            {answered && (
              <>
                <ExplanationBox
                  questionBody={answered.body}
                  codeBlock={answered.codeBlock}
                  options={JSON.parse(answered.options) as string[]}
                  selectedIndex={selectedIndex ?? 0}
                  answerIndex={answered.answerIndex}
                  explanation={answered.explanation}
                />
                <button
                  onClick={handleNext}
                  className="mt-4 w-full py-3 bg-accent text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  次の問題へ →
                </button>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
