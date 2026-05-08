interface CategoryScore {
  category: string
  total: number
  correct: number
  rate: number
}

interface ScoreChartProps {
  scores: CategoryScore[]
}

export function ScoreChart({ scores }: ScoreChartProps) {
  if (scores.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-4">
        まだ回答履歴がありません
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {scores.map((score) => (
        <div key={score.category}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700 font-medium truncate max-w-[60%]">
              {score.category}
            </span>
            <span className="text-gray-500">
              {score.correct}/{score.total} ({score.rate}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                score.rate >= 80
                  ? 'bg-accent'
                  : score.rate >= 60
                  ? 'bg-yellow-400'
                  : 'bg-red-400'
              }`}
              style={{ width: `${score.rate}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
