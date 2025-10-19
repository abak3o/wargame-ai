import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Honoの型定義で環境変数を認識させる
type Bindings = {
  GEMINI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// どのドメインからでもAPIを叩けるようにCORSミドルウェアを適用
app.use('/api/*', cors())

app.get('/api/hello', (c) => {
  return c.json({
    ok: true,
    message: 'Hello',
  })
})

app.get('/api/posts/:id', (c) => {
  const page = c.req.query("page")
  const id = c.req.param("id")
  return c.text(`You want to see ${page} of ${id}`)
})

app.post('/api/process', async (c) => {
  try {
    const { inputText } = await c.req.json<{ inputText: string }>()

    if (!inputText) {
      return c.json({ error: 'inputTextがありません' }, 400)
    }

    const apiKey = c.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set.');
      return c.json({ error: 'APIキーが設定されていません' }, 500)
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(inputText);
    const response = await result.response;
    const processedText = response.text();

    return c.json({ result: processedText })

  } catch (e) {
    console.error(e);
    return c.json({ error: 'リクエストの処理中にエラーが発生しました' }, 500)
  }
})

export default app
