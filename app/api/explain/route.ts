import { NextRequest } from 'next/server'
import { anthropic } from '@/lib/anthropic'

const SYSTEM_PROMPT = `あなたはJava Silver試験のエキスパート講師です。
以下のルールで解説してください：
- 日本語で回答する
- 500文字以内で簡潔に
- なぜその選択肢が正解か、他の選択肢がなぜ不正解かを説明する
- 難しい概念はコード例を使って説明する
- 最後に「覚えるポイント」を1行で締める`

interface ExplainRequest {
  questionBody: string
  codeBlock: string | null
  options: string[]
  selectedIndex: number
  answerIndex: number
  explanation: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ExplainRequest
    const { questionBody, codeBlock, options, selectedIndex, answerIndex, explanation } = body

    const selectedOption = options[selectedIndex]
    const correctOption = options[answerIndex]
    const isCorrect = selectedIndex === answerIndex

    const userMessage = `
【問題】
${questionBody}
${codeBlock ? `\n【コード】\n\`\`\`java\n${codeBlock}\n\`\`\`` : ''}

【選択肢】
${options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}

【ユーザーの回答】${String.fromCharCode(65 + selectedIndex)}. ${selectedOption}（${isCorrect ? '正解' : '不正解'}）
【正解】${String.fromCharCode(65 + answerIndex)}. ${correctOption}

【基本解説】
${explanation}

上記の問題について、解説をお願いします。`

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    // Server-Sent Events形式でストリーミング
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const data = JSON.stringify({ text: event.delta.text })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch {
    return new Response(
      JSON.stringify({ error: 'AI解説の生成に失敗しました' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
