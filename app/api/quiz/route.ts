import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') ?? '10', 10)
  const excludeParam = searchParams.get('exclude')
  const excludeIds = excludeParam
    ? excludeParam.split(',').map(Number).filter(Boolean)
    : []

  try {
    const questions = await prisma.question.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
      },
      take: limit,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        category: true,
        difficulty: true,
        body: true,
        codeBlock: true,
        options: true,
        // answerIndex と explanation はクライアントに送らない
      },
    })

    return NextResponse.json(questions)
  } catch {
    return NextResponse.json({ error: '問題の取得に失敗しました' }, { status: 500 })
  }
}
