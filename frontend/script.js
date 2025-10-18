    // const API_BASE_URL = 'https://your-hono-api.workers.dev';
    const API_BASE_URL = "http://127.0.0.1:8787"

    const form = document.getElementById('process-form');
    const resultContainer = document.getElementById('result-container');
    const resultText = document.getElementById('result-text');

    form.addEventListener('submit', async (event) => {
      // ページの再読み込みをキャンセル
      event.preventDefault();

      resultText.textContent = '処理中...';
      resultContainer.style.display = 'block';

      const formData = new FormData(form);
      const inputText = formData.get('inputText');

      try {
        const response = await fetch(`${API_BASE_URL}/api/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputText: inputText }),
        });

        if (!response.ok) {
          throw new Error(`サーバーエラー: ${response.status}`);
        }

        const data = await response.json();
        resultText.textContent = data.result;

      } catch (error) {
        resultText.textContent = `エラーが発生しました: ${error.message}`;
      }
    });
    