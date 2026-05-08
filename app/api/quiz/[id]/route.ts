import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 問題詳細取得（正解インデックス含む）
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: '不正なID' }, { status: 400 })
  }

  try {
    const question = await prisma.question.findUnique({ where: { id } })
    if (!question) {
      return NextResponse.json({ error: '問題が見つかりません' }, { status: 404 })
    }
    return NextResponse.json(question)
  } catch {
    return NextResponse.json({ error: '取得失敗' }, { status: 500 })
  }
}

// 回答を記録する
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const questionId = parseInt(params.id, 10)

  const body = await request.json() as { selectedIndex: number }
  const { selectedIndex } = body

  if (typeof selectedIndex !== 'number') {
    return NextResponse.json({ error: '不正なリクエスト' }, { status: 400 })
  }

  try {
    const question = await prisma.question.findUnique({ where: { id: questionId } })
    if (!question) {
      return NextResponse.json({ error: '問題が見つかりません' }, { status: 404 })
    }

    const isCorrect = selectedIndex === question.answerIndex

    // ログイン済みなら回答履歴を保存
    if (session?.user?.id) {
      await prisma.answer.create({
        data: {
          userId: session.user.id,
          questionId,
          selectedIndex,
          isCorrect,
        },
      })
    }

    // 正解情報を返す
    return NextResponse.json({
      isCorrect,
      answerIndex: question.answerIndex,
      explanation: question.explanation,
      body: question.body,
      codeBlock: question.codeBlock,
      options: question.options,
    })
  } catch {
    return NextResponse.json({ error: '回答の保存に失敗しました' }, { status: 500 })
  }
}
