import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Honoの型定義で環境変数を認識させる
type Bindings = {
  GEMINI_API_KEY: string
  PROMPT: string
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


    const question = `
バルバロッサ作戦再評価

⸻

🔹問題設定

あなたは1941年春時点のドイツ陸軍参謀本部の戦略立案責任者であり、
「ソビエト連邦への侵攻作戦（後に“バルバロッサ作戦”と呼ばれる）」の立案および修正を命じられました。

あなたの任務は：
	1.	**国家的戦略目標（政治・経済・軍事）**に基づいて、
	2.	ドイツ軍の戦力・地理・兵站・敵状を勘案し、
	3.	作戦の方向性・主要攻勢軸・兵站計画・戦力配分を提示し、
	4.	史実の結果との差異を評価しながら、作戦の改善案を立案することです。

⸻

📝回答フォーマット（各項目は論理的かつ簡潔に記述）

⸻

【1】戦略的目的の明示（政治・軍事・経済）

例：ソ連との講和を目指すのか、政権打倒を狙うのか、経済資源確保か等。

⸻

【2】情報分析
	•	敵戦力の評価（質・量・戦意）
	•	地形・距離・季節条件
	•	ドイツ軍の兵站能力と空軍の援護能力

⸻

【3】作戦構想（自案）
	•	主攻方向（北・中央・南）
	•	攻勢の段階（フェーズ分けと到達目標）
	•	兵力配分（大まかなグループ軍規模で）
	•	兵站・補給体制への配慮
	•	空軍・同盟国軍の使用

⸻

【4】史実との比較評価（戦略・作戦の観点から）
	•	成功／失敗の要因分析
	•	作戦目的と手段の整合性
	•	兵站・政治目標との乖離

⸻

【5】結論と代替案提示
	•	自案の利点とリスク
	•	史実より優れた成果を得る可能性があるかどうか
	•	政治的・軍事的帰結の予想（1942年以降を見据えて）
`
    // prompt を作る
    const prompt = c.env.PROMPT;
    const add_question = prompt.replace('{question}', question);
    const completed_promtp = add_question.replace('{userAnswer}', inputText);

    console.log(completed_promtp)
    // 実行
    const result = await model.generateContent(completed_promtp);
    const response = await result.response;
    const processedText = response.text();

    return c.json({ result: processedText })

  } catch (e) {
    console.error(e);
    return c.json({ error: 'リクエストの処理中にエラーが発生しました' }, 500)
  }
})

export default app
