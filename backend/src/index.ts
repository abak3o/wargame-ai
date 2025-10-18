import { Hono } from 'hono'
import { cors } from 'hono/cors' // CORSをインポート

const app = new Hono()

// どのドメインからでもAPIを叩けるようにCORSミドルウェアを適用
app.use('/api/*', cors())

// --- 元からあったAPIルートはそのまま ---
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

// --- テキスト処理ルートをAPI仕様に変更 ---
// パスを /api/process に変更
app.post('/api/process', async (c) => {
	try {
	// フロントエンドから送られてくるJSONを受け取る
	const { inputText } = await c.req.json<{ inputText: string }>()

	// テキストを加工する
	const processedText = ` "${inputText}"と入力されました。`

	// 結果をHTMLではなく、JSONで返す！
	return c.json({ result: processedText })

	} catch (e) {
	return c.json({ error: 'リクエストの処理に失敗しました' }, 500)
	}
})

export default app

