// ======================================
// Supabase 設定
// ======================================

const SUPABASE_URL =
  "https://zlafcarhdhtugcmeaqzv.supabase.co";

// 這裡放真正的 Publishable key
const SUPABASE_KEY =
  "sb_publishable_msVVLrRWTYHKAnia15J-Pw_nDdcK3Mb";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ======================================
// 基本工具
// ======================================

function getCompletedCount() {
  // challenges.js 完成題目後應該會加上 .done
  return document.querySelectorAll(
    ".question-item.done"
  ).length;
}

function getCurrentScore() {
  return getCompletedCount() * 5;
}

function updateScoreDisplay() {
  const completedCount = getCompletedCount();
  const currentScore = completedCount * 5;

  const scoreElement =
    document.getElementById("score");

  if (scoreElement) {
    scoreElement.textContent = currentScore;
  }

  const progressElement =
    document.getElementById("headerProgress");

  if (progressElement) {
    progressElement.textContent =
      `${completedCount} / 5`;
  }

  const streakElement =
    document.getElementById("streak");

  if (streakElement) {
    streakElement.textContent =
      completedCount > 0 ? 1 : 0;
  }

  // 更新第一關進度條，若頁面有這個元素
  const levelOneLine =
    document.getElementById("levelOneLine");

  if (levelOneLine) {
    const percentage =
      Math.min((completedCount / 5) * 100, 100);

    levelOneLine.style.width =
      `${percentage}%`;
  }
}


// ======================================
// 讀取排行榜
// ======================================

async function loadLeaderboard() {
  const leaderboardBody =
    document.getElementById("leaderboard-body");

  if (!leaderboardBody) {
    return;
  }

  leaderboardBody.innerHTML = `
    <tr>
      <td colspan="3">讀取中...</td>
    </tr>
  `;

  const { data, error } = await supabaseClient
    .from("leaderboard")
    .select("username, score, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(20);

  if (error) {
    console.error("讀取排行榜失敗：", error);

    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="3">
          排行榜讀取失敗：${error.message}
        </td>
      </tr>
    `;

    return;
  }

  if (!data || data.length === 0) {
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="3">目前還沒有分數</td>
      </tr>
    `;

    return;
  }

  leaderboardBody.innerHTML = "";

  data.forEach((player, index) => {
    const row = document.createElement("tr");

    const rankCell = document.createElement("td");
    rankCell.textContent = index + 1;

    const usernameCell = document.createElement("td");
    usernameCell.textContent =
      player.username || "匿名玩家";

    const scoreCell = document.createElement("td");
    scoreCell.textContent = player.score ?? 0;

    row.appendChild(rankCell);
    row.appendChild(usernameCell);
    row.appendChild(scoreCell);

    leaderboardBody.appendChild(row);
  });
}


// ======================================
// 提交分數
// ======================================

function setupScoreSubmission() {
  const submitButton =
    document.getElementById("submit-score");

  if (!submitButton) {
    console.warn(
      "找不到 id=\"submit-score\" 的按鈕"
    );
    return;
  }

  submitButton.addEventListener("click", async () => {
    const usernameInput =
      document.getElementById("username");

    const username = usernameInput
      ? usernameInput.value.trim()
      : "";

    if (!username) {
      alert("請先輸入玩家名稱");
      return;
    }

    // 直接讀取畫面上已完成的題目
    const completedCount =
      getCompletedCount();

    const finalScore =
      completedCount * 5;

    if (completedCount < 5) {
      alert(
        `你目前完成 ${completedCount} / 5 題，請完成全部題目再提交分數。`
      );
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "提交中...";

    const { error } = await supabaseClient
      .from("leaderboard")
      .insert({
        username: username,
        score: finalScore
      });

    submitButton.disabled = false;
    submitButton.textContent = "提交分數";

    if (error) {
      console.error("提交分數失敗：", error);
      alert("提交失敗：" + error.message);
      return;
    }

    alert(
      `分數提交成功！你獲得 ${finalScore} 分。`
    );

    await loadLeaderboard();
  });
}


// ======================================
// 監察答題完成狀態
// ======================================

function watchCompletedQuestions() {
  const questionList =
    document.getElementById("questionList");

  if (!questionList) {
    return;
  }

  // 題目完成後，challenges.js 會修改 questionList
  // MutationObserver 會自動重新計算分數
  const observer = new MutationObserver(() => {
    updateScoreDisplay();
  });

  observer.observe(questionList, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"]
  });

  updateScoreDisplay();
}


// ======================================
// 啟動
// ======================================

document.addEventListener("DOMContentLoaded", () => {
  setupScoreSubmission();
  watchCompletedQuestions();
  updateScoreDisplay();
  loadLeaderboard();
});

