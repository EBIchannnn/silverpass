import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const userId = session.user.id

  // 今日の開始時刻（00:00:00）
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  try {
    // 今日の回答
    const todayAnswers = await prisma.answer.findMany({
      where: { userId, answeredAt: { gte: todayStart } },
      include: { question: { select: { category: true } } },
    })

    const todayCount = todayAnswers.length
    const todayCorrect = todayAnswers.filter((a) => a.isCorrect).length
    const todayRate = todayCount > 0 ? Math.round((todayCorrect / todayCount) * 100) : 0

    // 全体の分野別スコア
    const allAnswers = await prisma.answer.findMany({
      where: { userId },
      include: { question: { select: { category: true } } },
    })

    const categoryMap: Record<string, { total: number; correct: number }> = {}
    for (const ans of allAnswers) {
      const cat = ans.question.category
      if (!categoryMap[cat]) categoryMap[cat] = { total: 0, correct: 0 }
      categoryMap[cat].total++
      if (ans.isCorrect) categoryMap[cat].correct++
    }

    const categoryScores = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      total: data.total,
      correct: data.correct,
      rate: Math.round((data.correct / data.total) * 100),
    }))

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true },
    })

    const dailyLimit = user?.isPremium ? null : 10
    const remainingToday = dailyLimit !== null ? Math.max(0, dailyLimit - todayCount) : null

    return NextResponse.json({
      todayCount,
      todayCorrect,
      todayRate,
      categoryScores,
      isPremium: user?.isPremium ?? false,
      dailyLimit,
      remainingToday,
    })
  } catch {
    return NextResponse.json({ error: 'データ取得に失敗しました' }, { status: 500 })
  }
}
