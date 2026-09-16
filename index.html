// ======================================
// Supabase 設定
// ======================================

const SUPABASE_URL =
  "https://zlafcarhdhtugcmeaqzv.supabase.co";

// 請把這裡換成你真正的 Publishable key
const SUPABASE_KEY =
  "sb_publishable_請貼上你真正的key";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ======================================
// 題目資料
// ======================================

const questions = [
  {
    topic: "一元一次方程",
    title: "解一元一次方程",
    text: "解方程：3x + 5 = 20",
    answer: "5",
    hint: "先把 +5 移到等號右邊，兩邊同時減 5。",
    solution:
      "3x + 5 = 20<br>" +
      "3x = 20 − 5<br>" +
      "3x = 15<br>" +
      "x = 15 ÷ 3 = <strong>5</strong>"
  },

  {
    topic: "代數式",
    title: "合併同類項",
    text: "化簡：4a + 3a − 2",
    answer: "7a-2",
    accepted: [
      "7a − 2",
      "7a–2",
      "7a - 2"
    ],
    hint:
      "只有含有 a 的項才可以合併，常數 −2 保持不變。",
    solution:
      "4a 和 3a 都含有 a，所以可以相加：<br>" +
      "4a + 3a − 2 = <strong>7a − 2</strong>"
  },

  {
    topic: "百分數",
    title: "計算折扣後售價",
    text: "原價 $200 的物品減價 15%，售價是多少？",
    answer: "170",
    hint:
      "先找出折扣金額：原價的 15%。",
    solution:
      "折扣 = 200 × 15% = 30<br>" +
      "售價 = 200 − 30 = <strong>$170</strong>"
  },

  {
    topic: "幾何",
    title: "三角形內角",
    text:
      "一個三角形的兩個內角是 45° 和 70°。第三個內角是多少度？",
    answer: "65",
    hint:
      "任何三角形的三個內角加起來都是 180°。",
    solution:
      "第三個內角 = 180° − 45° − 70°<br>" +
      "= <strong>65°</strong>"
  },

  {
    topic: "數據處理",
    title: "計算平均數",
    text:
      "數據為 4、6、8、10、12，它們的平均數是多少？",
    answer: "8",
    hint:
      "把所有數字相加，再除以數據的個數。",
    solution:
      "總和 = 4 + 6 + 8 + 10 + 12 = 40<br>" +
      "平均數 = 40 ÷ 5 = <strong>8</strong>"
  }
];


// ======================================
// 遊戲狀態
// challenges.js 也會使用這些變數
// ======================================

let active = 0;
const done = new Set();


// ======================================
// 常用函式
// ======================================

function $(id) {
  return document.getElementById(id);
}

function clean(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s/g, "")
    .replace(/−|–|—/g, "-")
    .replace(/[＄$]/g, "")
    .replace(/°/g, "");
}


// ======================================
// 顯示題目列表
// ======================================

function renderList() {
  const questionList = $("questionList");

  if (!questionList) {
    return;
  }

  questionList.innerHTML = questions
    .map((question, index) => {
      const isActive = index === active;
      const isDone = done.has(index);

      return `
        <button
          class="question-item ${isActive ? "active" : ""} ${isDone ? "done" : ""}"
          data-index="${index}"
          type="button"
        >
          <span class="num">
            ${isDone ? "✓" : index + 1}
          </span>

          <span>
            ${question.topic}
            <small>${question.title}</small>
          </span>
        </button>
      `;
    })
    .join("");

  document
    .querySelectorAll(".question-item")
    .forEach((button) => {
      button.onclick = () => {
        const index = Number(button.dataset.index);
        load(index);
      };
    });
}


// ======================================
// 載入指定題目
// challenges.js 會呼叫這個函式
// ======================================

function load(index) {
  if (
    index < 0 ||
    index >= questions.length
  ) {
    return;
  }

  active = index;

  const question = questions[index];

  if ($("questionTopic")) {
    $("questionTopic").textContent =
      question.topic;
  }

  if ($("questionTitle")) {
    $("questionTitle").textContent =
      question.title;
  }

  if ($("questionText")) {
    $("questionText").textContent =
      question.text;
  }

  if ($("questionNumber")) {
    $("questionNumber").textContent =
      `第 ${index + 1} / ${questions.length} 題`;
  }

  if ($("answer")) {
    $("answer").value = "";
  }

  if ($("feedback")) {
    $("feedback").textContent = "";
    $("feedback").className = "feedback";
  }

  if ($("solution")) {
    $("solution").innerHTML = "";
    $("solution").className = "solution";
  }

  renderList();
}


// ======================================
// 更新分數顯示
// ======================================

function updateScoreDisplay() {
  const count = done.size;
  const score = count * 5;

  if ($("score")) {
    $("score").textContent = score;
  }

  if ($("headerProgress")) {
    $("headerProgress").textContent =
      `${count} / ${questions.length}`;
  }

  if ($("streak")) {
    $("streak").textContent =
      count === questions.length ? "1" : "0";
  }

  if ($("levelOneLine")) {
    $("levelOneLine").style.width =
      `${(count / questions.length) * 100}%`;
  }
}


// ======================================
// 提示按鈕
// ======================================

const hintButton = $("hintButton");

if (hintButton) {
  hintButton.onclick = () => {
    const feedback = $("feedback");

    if (!feedback) {
      return;
    }

    feedback.textContent =
      `提示：${questions[active].hint}`;

    feedback.className = "feedback";
  };
}


// ======================================
// 解題步驟按鈕
// ======================================

const solutionButton = $("solutionButton");

if (solutionButton) {
  solutionButton.onclick = () => {
    const solution = $("solution");

    if (!solution) {
      return;
    }

    solution.innerHTML =
      `<strong>解題步驟</strong><br>${questions[active].solution}`;

    solution.classList.toggle("visible");
  };
}


// ======================================
// 按 Enter 檢查答案
// ======================================

const answerInput = $("answer");

if (answerInput) {
  answerInput.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Enter" &&
        $("checkAnswer")
      ) {
        $("checkAnswer").click();
      }
    }
  );
}


// ======================================
// 關卡卡片
// ======================================

document
  .querySelectorAll(".topic-card[data-topic]")
  .forEach((card) => {
    card.onclick = () => {
      const topic = card.dataset.topic;

      const index = questions.findIndex(
        (question) => {
          if (topic === "代數") {
            return (
              question.topic === "一元一次方程" ||
              question.topic === "代數式"
            );
          }

          return question.topic.includes(topic);
        }
      );

      load(index >= 0 ? index : 0);

      location.hash = "practice";
    };
  });


// ======================================
// 讀取排行榜
// ======================================

async function loadLeaderboard() {
  const leaderboardBody =
    $("leaderboard-body");

  if (!leaderboardBody) {
    return;
  }

  leaderboardBody.innerHTML = `
    <tr>
      <td colspan="3">讀取中...</td>
    </tr>
  `;

  const { data, error } =
    await supabaseClient
      .from("leaderboard")
      .select("username, score, created_at")
      .order("score", {
        ascending: false
      })
      .order("created_at", {
        ascending: true
      })
      .limit(20);

  if (error) {
    console.error(
      "讀取排行榜失敗：",
      error
    );

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
        <td colspan="3">
          目前還沒有分數
        </td>
      </tr>
    `;

    return;
  }

  leaderboardBody.innerHTML = "";

  data.forEach((player, index) => {
    const row = document.createElement("tr");

    const rankCell =
      document.createElement("td");
    rankCell.textContent = index + 1;

    const usernameCell =
      document.createElement("td");
    usernameCell.textContent =
      player.username || "匿名玩家";

    const scoreCell =
      document.createElement("td");
    scoreCell.textContent =
      player.score ?? 0;

    row.appendChild(rankCell);
    row.appendChild(usernameCell);
    row.appendChild(scoreCell);

    leaderboardBody.appendChild(row);
  });
}


// ======================================
// 提交分數
// ======================================

const submitScoreButton =
  $("submit-score");

if (submitScoreButton) {
  submitScoreButton.onclick = async () => {
    const usernameInput =
      $("username");

    const username = usernameInput
      ? usernameInput.value.trim()
      : "";

    if (!username) {
      alert("請先輸入玩家名稱");
      return;
    }

    // 直接使用 challenges.js 共用的 done
    const completedCount = done.size;
    const finalScore = completedCount * 5;

    if (completedCount < questions.length) {
      alert(
        `你目前完成 ${completedCount} / ${questions.length} 題，請完成全部題目再提交分數。`
      );

      return;
    }

    submitScoreButton.disabled = true;
    submitScoreButton.textContent = "提交中...";

    const { error } =
      await supabaseClient
        .from("leaderboard")
        .insert({
          username: username,
          score: finalScore
        });

    submitScoreButton.disabled = false;
    submitScoreButton.textContent = "提交分數";

    if (error) {
      console.error(
        "提交分數失敗：",
        error
      );

      alert(
        "提交失敗：" + error.message
      );

      return;
    }

    alert(
      `分數提交成功！你獲得 ${finalScore} 分。`
    );

    await loadLeaderboard();
  };
}


// ======================================
// 啟動
// ======================================

renderList();
load(0);
updateScoreDisplay();
loadLeaderboard();
