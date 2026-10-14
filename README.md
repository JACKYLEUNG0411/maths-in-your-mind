# Maths in Your Mind

一個以「數學星球探索」為主題的前端練習平台，提供：

- 探索者登入 / 註冊
- 銀河地圖關卡探索
- 題目作答與即時回饋
- 排行榜顯示

## Tech Stack

- HTML / CSS / Vanilla JavaScript
- Supabase (Auth + Database + RPC)
- KaTeX（數學公式渲染）
- DOMPurify（解題內容安全渲染）

## 專案結構

- `/home/runner/work/maths-in-your-mind/maths-in-your-mind/index.html`：首頁與開場動畫
- `/home/runner/work/maths-in-your-mind/maths-in-your-mind/login.html`：登入 / 註冊
- `/home/runner/work/maths-in-your-mind/maths-in-your-mind/levels.html`：星球地圖
- `/home/runner/work/maths-in-your-mind/maths-in-your-mind/practice.html`：作答頁
- `/home/runner/work/maths-in-your-mind/maths-in-your-mind/leaderboard.html`：排行榜
- `/home/runner/work/maths-in-your-mind/maths-in-your-mind/common.js`：共用工具（錯誤訊息、重試機制、音效/登出等）
- `/home/runner/work/maths-in-your-mind/maths-in-your-mind/config.js`：Supabase client 初始化
- `/home/runner/work/maths-in-your-mind/maths-in-your-mind/app-config.js`：環境設定（dev/prod）
- `/home/runner/work/maths-in-your-mind/maths-in-your-mind/app-config.example.js`：環境設定範本

## 本地啟動

1. 進入專案目錄

```bash
cd /home/runner/work/maths-in-your-mind/maths-in-your-mind
```

2. 複製環境設定並填入 Supabase 資訊

```bash
cp app-config.example.js app-config.js
```

3. 啟動靜態伺服器

```bash
python3 -m http.server 8080
```

4. 開啟瀏覽器

```text
http://localhost:8080/index.html
```

## 執行與驗證建議

此專案目前沒有建置流程或自動化測試；建議至少手動驗證：

- 登入 / 註冊流程
- levels 頁面載入、飛船命名更新
- practice 頁面作答與上一題 / 下一題
- leaderboard 重新整理
- 斷網或 Supabase 異常時的錯誤提示與 fallback
