import { PrismaClient } from '@prisma/client'
import questions from '../data/questions.json'

const prisma = new PrismaClient()

async function main() {
  console.log('シードデータを投入します...')

  // 既存の問題を削除
  await prisma.question.deleteMany()

  for (const q of questions) {
    await prisma.question.create({
      data: {
        category: q.category,
        difficulty: q.difficulty,
        body: q.body,
        codeBlock: q.codeBlock ?? null,
        options: JSON.stringify(q.options),
        answerIndex: q.answerIndex,
        explanation: q.explanation,
      },
    })
  }

  console.log(`${questions.length}問を投入しました`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
