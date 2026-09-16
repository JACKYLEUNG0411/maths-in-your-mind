// =========================
// Supabase 設定
// =========================

const SUPABASE_URL =
  "https://zlafcarhdhtugcmeaqzv.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_msVVLrRWTYHKAnia15J-Pw_nDdcK3Mb";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// =========================
// 題目資料
// =========================

const questions = [
  {
    topic: "一元一次方程",
    title: "解一元一次方程",
    text: "解方程： 3x + 5 = 20",
    answer: "5",
    hint: "先把 + 5 移到等號右邊，兩邊同時減 5。",
    solution:
      "3x + 5 = 20<br>" +
      "3x = 20 − 5<br>" +
      "3x = 15<br>" +
      "x = 15 ÷ 3 = <strong>5</strong>"
  },
  {
    topic: "代數式",
    title: "合併同類項",
    text: "化簡： 4a + 3a − 2",
    answer: "7a-2",
    accepted: [
      "7a-2",
      "7a − 2",
      "7a–2"
    ],
    hint: "只有含有 a 的項才可以合併；常數 −2 保持不變。",
    solution:
      "4a 和 3a 都含有 a，所以可以相加：<br>" +
      "4a + 3a − 2 = <strong>7a − 2</strong>"
  },
  {
    topic: "百分數",
    title: "計算折扣後售價",
    text: "原價 $200 的物品減價 15%，售價是多少？",
    answer: "170",
    hint: "先找出折扣金額：原價的 15%。",
    solution:
      "折扣 = 200 × 15% = 30<br>" +
      "售價 = 200 − 30 = <strong>$170</strong>"
  },
  {
    topic: "幾何",
    title: "三角形內角",
    text: "一個三角形的兩個內角是 45° 和 70°。第三個內角是多少度？",
    answer: "65",
    hint: "任何三角形的三個內角加起來都是 180°。",
    solution:
      "第三個內角 = 180° − 45° − 70°<br>" +
      "= <strong>65°</strong>"
  },
  {
    topic: "數據處理",
    title: "計算平均數",
    text: "數據為 4、6、8、10、12，它們的平均數是多少？",
    answer: "8",
    hint: "把所有數字相加，再除以數據的個數。",
    solution:
      "總和 = 4 + 6 + 8 + 10 + 12 = 40<br>" +
      "平均數 = 40 ÷ 5 = <strong>8</strong>"
  }
];


// =========================
// 遊戲狀態
// =========================

let active = 0;
const done = new Set();
let score = 0;


// =========================
// 常用函式
// =========================

const $ = (id) => document.getElementById(id);

function clean(value) {
  return value
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/−|–/g, "-")
    .replace(/\$/g, "");
}


// =========================
// 題目列表
// =========================

function renderList() {
  const questionList = $("questionList");

  if (!questionList) {
    return;
  }

  questionList.innerHTML = questions
    .map((question, index) => {
      return `
        <button
          class="question-item
            ${index === active ? "active" : ""}
            ${done.has(index) ? "done" : ""}"
          data-index="${index}"
          type="button"
        >
          <span class="num">
            ${done.has(index) ? "✓" : index + 1}
          </span>

          <span>
            ${question.topic}
            <small>${question.title}</small>
          </span>
        </button>
      `;
    })
    .join("");

  document.querySelectorAll(".question-item").forEach((button) => {
    button.onclick = () => {
      load(Number(button.dataset.index));
    };
  });
}


// =========================
// 載入題目
// =========================

function load(index) {
  active = index;

  const question = questions[index];

  if ($("questionTopic")) {
    $("questionTopic").textContent = question.topic;
  }

  if ($("questionTitle")) {
    $("questionTitle").textContent = question.title;
  }

  if ($("questionText")) {
    $("questionText").textContent = question.text;
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
    $("solution").className = "solution";
    $("solution").innerHTML = "";
  }

  renderList();
}


// =========================
// 更新進度和分數
// =========================

function progress() {
  const completed = done.size;

  if ($("headerProgress")) {
    $("headerProgress").textContent =
      `${completed} / ${questions.length}`;
  }

  if ($("streak")) {
    $("streak").textContent = completed > 0 ? 1 : 0;
  }

  if ($("score")) {
    $("score").textContent = score;
  }
}


// =========================
// 檢查答案
// =========================

if ($("checkAnswer")) {
  $("checkAnswer").onclick = () => {
    const question = questions[active];
    const value = clean($("answer").value);
    const validAnswers = [
      question.answer,
      ...(question.accepted || [])
    ];

    const isCorrect = validAnswers
      .map(clean)
      .includes(value);

    const feedback = $("feedback");

    if (!value) {
      feedback.textContent = "先輸入你的答案吧。";
      feedback.className = "feedback wrong";
      return;
    }

    if (isCorrect) {
      if (!done.has(active)) {
        done.add(active);
        score += 5;

        feedback.textContent =
          `答對了！+5 分，目前分數：${score}`;
      } else {
        feedback.textContent =
          `這一題已經完成，目前分數：${score}`;
      }

      feedback.className = "feedback correct";

      renderList();
      progress();
    } else {
      feedback.textContent =
        "差一點點，再看看提示，慢慢來。";
      feedback.className = "feedback wrong";
    }
  };
}


// =========================
// 按 Enter 提交答案
// =========================

if ($("answer")) {
  $("answer").addEventListener("keydown", (event) => {
    if (event.key === "Enter" && $("checkAnswer")) {
      $("checkAnswer").click();
    }
  });
}


// =========================
// 顯示提示
// =========================

if ($("hintButton")) {
  $("hintButton").onclick = () => {
    if (!$("feedback")) {
      return;
    }

    $("feedback").textContent =
      "提示：" + questions[active].hint;

    $("feedback").className = "feedback";
  };
}


// =========================
// 顯示解題步驟
// =========================

if ($("solutionButton")) {
  $("solutionButton").onclick = () => {
    const solution = $("solution");

    if (!solution) {
      return;
    }

    solution.innerHTML =
      "<strong>解題步驟</strong><br>" +
      questions[active].solution;

    solution.classList.toggle("visible");
  };
}


// =========================
// 主題卡片
// =========================

document.querySelectorAll(".topic-card").forEach((card) => {
  card.onclick = () => {
    const topic = card.dataset.topic;

    const index = questions.findIndex((question) => {
      const isAlgebraTopic =
        topic === "代數" &&
        (
          question.topic === "一元一次方程" ||
          question.topic === "代數式"
        );

      return question.topic.includes(topic) || isAlgebraTopic;
    });

    load(index < 0 ? 0 : index);
    location.hash = "practice";
  };
});


// =========================
// 讀取排行榜
// =========================

async function loadLeaderboard() {
  const leaderboardBody =
    document.getElementById("leaderboard-body");

  if (!leaderboardBody) {
    return;
  }

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
    usernameCell.textContent = player.username;

    const scoreCell = document.createElement("td");
    scoreCell.textContent = player.score;

    row.appendChild(rankCell);
    row.appendChild(usernameCell);
    row.appendChild(scoreCell);

    leaderboardBody.appendChild(row);
  });
}


// =========================
// 提交分數到排行榜
// =========================

const submitScoreButton =
  document.getElementById("submit-score");

if (submitScoreButton) {
  submitScoreButton.onclick = async () => {
    const usernameInput =
      document.getElementById("username");

    const username = usernameInput
      ? usernameInput.value.trim()
      : "";

    if (!username) {
      alert("請先輸入名字");
      return;
    }

    if (score === 0) {
      alert("請先答對題目再提交分數");
      return;
    }

    submitScoreButton.disabled = true;
    submitScoreButton.textContent = "提交中...";

    const { error } = await supabaseClient
      .from("leaderboard")
      .insert({
        username: username,
        score: score
      });

    submitScoreButton.disabled = false;
    submitScoreButton.textContent = "提交分數";

    if (error) {
      console.error("提交分數失敗：", error);
      alert("提交失敗：" + error.message);
      return;
    }

    alert("分數提交成功！");
    await loadLeaderboard();
  };
}


// =========================
// 啟動程式
// =========================

renderList();
load(0);
progress();
loadLeaderboard();

