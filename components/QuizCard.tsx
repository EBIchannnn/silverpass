'use client'

import { useEffect, useRef } from 'react'
import hljs from 'highlight.js/lib/core'
import java from 'highlight.js/lib/languages/java'

hljs.registerLanguage('java', java)

interface QuizCardProps {
  questionId: number
  category: string
  difficulty: number
  body: string
  codeBlock: string | null
  options: string[]
  selectedIndex: number | null
  answerIndex: number | null
  onSelect: (index: number) => void
}

const DIFFICULTY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: '易', color: 'bg-green-100 text-green-700' },
  2: { label: '中', color: 'bg-yellow-100 text-yellow-700' },
  3: { label: '難', color: 'bg-red-100 text-red-700' },
}

export function QuizCard({
  category,
  difficulty,
  body,
  codeBlock,
  options,
  selectedIndex,
  answerIndex,
  onSelect,
}: QuizCardProps) {
  const codeRef = useRef<HTMLElement>(null)
  const hasAnswered = selectedIndex !== null && answerIndex !== null

  useEffect(() => {
    if (codeRef.current && codeBlock) {
      codeRef.current.removeAttribute('data-highlighted')
      codeRef.current.textContent = codeBlock
      hljs.highlightElement(codeRef.current)
    }
  }, [codeBlock])

  const getOptionStyle = (index: number) => {
    if (!hasAnswered) {
      return 'border-gray-200 hover:border-primary hover:bg-blue-50 cursor-pointer'
    }
    if (index === answerIndex) {
      return 'border-accent bg-green-50 cursor-default'
    }
    if (index === selectedIndex && index !== answerIndex) {
      return 'border-red-400 bg-red-50 cursor-default'
    }
    return 'border-gray-200 bg-gray-50 opacity-60 cursor-default'
  }

  const getOptionIcon = (index: number) => {
    if (!hasAnswered) return null
    if (index === answerIndex) return <span className="text-accent font-bold">✓</span>
    if (index === selectedIndex) return <span className="text-red-500 font-bold">✗</span>
    return null
  }

  const diff = DIFFICULTY_LABELS[difficulty] ?? DIFFICULTY_LABELS[1]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-medium text-primary bg-blue-50 px-2 py-1 rounded-full">
          {category}
        </span>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${diff.color}`}>
          {diff.label}
        </span>
      </div>

      {/* 問題文 */}
      <p className="text-gray-800 font-medium mb-4 leading-relaxed">{body}</p>

      {/* コードブロック */}
      {codeBlock && (
        <div className="mb-4 overflow-x-auto rounded-lg">
          <pre className="text-sm">
            <code ref={codeRef} className="language-java" />
          </pre>
        </div>
      )}

      {/* 選択肢 */}
      <div className="space-y-2">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => !hasAnswered && onSelect(i)}
            disabled={hasAnswered}
            className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-150 ${getOptionStyle(i)}`}
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
              {String.fromCharCode(65 + i)}
            </span>
            <span className="text-sm text-gray-800 flex-1">{opt}</span>
            {getOptionIcon(i)}
          </button>
        ))}
      </div>

      {/* 正誤メッセージ */}
      {hasAnswered && (
        <div
          className={`mt-4 p-3 rounded-xl text-sm font-medium ${
            selectedIndex === answerIndex
              ? 'bg-green-50 text-accent'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {selectedIndex === answerIndex
            ? '✓ 正解！素晴らしい！'
            : `✗ 不正解。正解は ${String.fromCharCode(65 + answerIndex)} です。`}
        </div>
      )}
    </div>
  )
}
