'use client'

import { useState } from 'react'

interface ExplanationBoxProps {
  questionBody: string
  codeBlock: string | null
  options: string[]
  selectedIndex: number
  answerIndex: number
  explanation: string
}

export function ExplanationBox({
  questionBody,
  codeBlock,
  options,
  selectedIndex,
  answerIndex,
  explanation,
}: ExplanationBoxProps) {
  const [aiText, setAiText] = useState('')
  const [loading, setLoading] = useState(false)
  const [shown, setShown] = useState(false)

  const loadExplanation = async () => {
    if (shown) return
    setShown(true)
    setLoading(true)

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionBody,
          codeBlock,
          options,
          selectedIndex,
          answerIndex,
          explanation,
        }),
      })

      if (!res.ok) throw new Error('API error')
      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data) as { text: string }
              setAiText((prev) => prev + parsed.text)
            } catch {
              // JSON parse エラーは無視
            }
          }
        }
      }
    } catch {
      setAiText('AI解説の取得に失敗しました。基本解説をご参照ください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      {!shown ? (
        <button
          onClick={loadExplanation}
          className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          🤖 AI解説を見る
        </button>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-1">
            <span>🤖</span> AI解説
          </h3>
          {loading && !aiText ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              解説を生成中...
            </div>
          ) : (
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {aiText}
              {loading && (
                <span className="inline-block w-1 h-4 bg-primary ml-1 animate-pulse" />
              )}
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-gray-500 font-medium mb-1">基本解説</p>
            <p className="text-xs text-gray-600">{explanation}</p>
          </div>
        </div>
      )}
    </div>
  )
}
