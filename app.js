// ======================================
// Supabase 設定
// ======================================

const SUPABASE_URL =
  "https://zlafcarhdhtugcmeaqzv.supabase.co";

// 請換成你自己的 Publishable key
const SUPABASE_KEY =
  "請貼上你的 Supabase Publishable key";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ======================================
// 題目資料
// 每一關 5 題
// ======================================

const levels = [
  {
    id: 1,
    name: "代數起步",
    description: "學習代數式和一元一次方程",
    questions: [
      {
        topic: "一元一次方程",
        title: "解一元一次方程",
        text: "解方程：3x + 5 = 20",
        answer: "5",
        hint: "先把 +5 移到等號右邊。",
        solution:
          "3x + 5 = 20<br>" +
          "3x = 15<br>" +
          "x = <strong>5</strong>"
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
        hint: "只有含有 a 的項才可以合併。",
        solution:
          "4a + 3a − 2<br>" +
          "= <strong>7a − 2</strong>"
      },
      {
        topic: "代數式",
        title: "代入求值",
        text: "當 x = 3 時，2x + 4 的值是多少？",
        answer: "10",
        hint: "把 x 換成 3。",
        solution:
          "2x + 4<br>" +
          "= 2 × 3 + 4<br>" +
          "= <strong>10</strong>"
      },
      {
        topic: "代數式",
        title: "展開括號",
        text: "展開：3(x + 4)",
        answer: "3x+12",
        accepted: [
          "3x + 12"
        ],
        hint: "3 要乘括號內的每一項。",
        solution:
          "3(x + 4)<br>" +
          "= 3x + 12<br>" +
          "= <strong>3x + 12</strong>"
      },
      {
        topic: "一元一次方程",
        title: "解方程",
        text: "解方程：2x − 6 = 10",
        answer: "8",
        hint: "先在兩邊加 6，再除以 2。",
        solution:
          "2x − 6 = 10<br>" +
          "2x = 16<br>" +
          "x = <strong>8</strong>"
      }
    ]
  },

  {
    id: 2,
    name: "幾何入門",
    description: "認識基本幾何圖形和計算方法",
    questions: [
      {
        topic: "幾何",
        title: "三角形內角",
        text: "三角形的兩個內角是 45° 和 70°，第三個內角是多少度？",
        answer: "65",
        hint: "三角形內角總和是 180°。",
        solution:
          "180° − 45° − 70°<br>" +
          "= <strong>65°</strong>"
      },
      {
        topic: "幾何",
        title: "長方形面積",
        text: "長方形的長是 8 cm，闊是 5 cm，面積是多少？",
        answer: "40",
        hint: "長方形面積 = 長 × 闊。",
        solution:
          "8 × 5<br>" +
          "= <strong>40 cm²</strong>"
      },
      {
        topic: "幾何",
        title: "三角形面積",
        text: "三角形的底是 10 cm，高是 6 cm，面積是多少？",
        answer: "30",
        hint: "三角形面積 = 底 × 高 ÷ 2。",
        solution:
          "10 × 6 ÷ 2<br>" +
          "= <strong>30 cm²</strong>"
      },
      {
        topic: "幾何",
        title: "正方形周界",
        text: "正方形每邊長 7 cm，周界是多少？",
        answer: "28",
        hint: "正方形有 4 條相等的邊。",
        solution:
          "7 × 4<br>" +
          "= <strong>28 cm</strong>"
      },
      {
        topic: "幾何",
        title: "圓的直徑",
        text: "圓的半徑是 6 cm，直徑是多少？",
        answer: "12",
        hint: "直徑 = 半徑 × 2。",
        solution:
          "6 × 2<br>" +
          "= <strong>12 cm</strong>"
      }
    ]
  },

  {
    id: 3,
    name: "數據解碼",
    description: "學習平均數、中位數、眾數和全距",
    questions: [
      {
        topic: "數據處理",
        title: "計算平均數",
        text: "數據為 4、6、8、10、12，平均數是多少？",
        answer: "8",
        hint: "總和除以數據個數。",
        solution:
          "(4 + 6 + 8 + 10 + 12) ÷ 5<br>" +
          "= 40 ÷ 5<br>" +
          "= <strong>8</strong>"
      },
      {
        topic: "數據處理",
        title: "找出中位數",
        text: "數據為 3、7、9、12、15，中位數是多少？",
        answer: "9",
        hint: "排列後最中間的數字就是中位數。",
        solution:
          "3、7、<strong>9</strong>、12、15<br>" +
          "中位數 = <strong>9</strong>"
      },
      {
        topic: "數據處理",
        title: "找出眾數",
        text: "數據為 2、4、4、5、7、4、8，眾數是多少？",
        answer: "4",
        hint: "出現次數最多的數字就是眾數。",
        solution:
          "4 出現三次，是最多次出現的數字。<br>" +
          "眾數 = <strong>4</strong>"
      },
      {
        topic: "數據處理",
        title: "計算全距",
        text: "數據為 5、9、12、18、20，全距是多少？",
        answer: "15",
        hint: "全距 = 最大值 − 最小值。",
        solution:
          "20 − 5<br>" +
          "= <strong>15</strong>"
      },
      {
        topic: "數據處理",
        title: "計算總人數",
        text: "一班有 18 位男生和 22 位女生，全班共有多少人？",
        answer: "40",
        hint: "把男生和女生人數相加。",
        solution:
          "18 + 22<br>" +
          "= <strong>40 人</strong>"
      }
    ]
  },

  {
    id: 4,
    name: "百分數實戰",
    description: "學習折扣、增加和減少百分比",
    questions: [
      {
        topic: "百分數",
        title: "計算百分數",
        text: "80 的 25% 是多少？",
        answer: "20",
        hint: "計算 80 × 25 ÷ 100。",
        solution:
          "80 × 25%<br>" +
          "= 80 × 25 ÷ 100<br>" +
          "= <strong>20</strong>"
      },
      {
        topic: "百分數",
        title: "計算折扣後售價",
        text: "原價 $300 的外套減價 20%，售價是多少？",
        answer: "240",
        hint: "先計算折扣金額。",
        solution:
          "折扣 = 300 × 20% = 60<br>" +
          "售價 = 300 − 60<br>" +
          "= <strong>$240</strong>"
      },
      {
        topic: "百分數",
        title: "百分比增加",
        text: "一個數字是 200，增加 10% 後是多少？",
        answer: "220",
        hint: "先計算 200 的 10%。",
        solution:
          "增加量 = 200 × 10% = 20<br>" +
          "200 + 20<br>" +
          "= <strong>220</strong>"
      },
      {
        topic: "百分數",
        title: "百分比減少",
        text: "一個數字是 500，減少 30% 後是多少？",
        answer: "350",
        hint: "先計算 500 的 30%。",
        solution:
          "減少量 = 500 × 30% = 150<br>" +
          "500 − 150<br>" +
          "= <strong>350</strong>"
      },
      {
        topic: "百分數",
        title: "計算百分比",
        text: "25 是 100 的百分之多少？",
        answer: "25",
        accepted: [
          "25%",
          "25％"
        ],
        hint: "百分比 = 部分 ÷ 全部 × 100%。",
        solution:
          "25 ÷ 100 × 100%<br>" +
          "= <strong>25%</strong>"
      }
    ]
  }
];


// ======================================
// 把四關題目整理成單一陣列
// ======================================

const questions = [];

levels.forEach((level) => {
  level.questions.forEach((question) => {
    questions.push({
      ...question,
      level: level.id,
      levelName: level.name
    });
  });
});


// ======================================
// 遊戲狀態
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
    .replace(/°/g, "")
    .replace(/％/g, "%");
}

function getLevelStart(levelId) {
  return levels
    .filter((level) => level.id < levelId)
    .reduce(
      (total, level) =>
        total + level.questions.length,
      0
    );
}

function getLevelQuestionIndexes(levelId) {
  const start = getLevelStart(levelId);
  const level = levels.find(
    (item) => item.id === levelId
  );

  return Array.from(
    { length: level.questions.length },
    (_, index) => start + index
  );
}

function isLevelCompleted(levelId) {
  return getLevelQuestionIndexes(levelId)
    .every((index) => done.has(index));
}

function isLevelUnlocked(levelId) {
  if (levelId === 1) {
    return true;
  }

  return isLevelCompleted(levelId - 1);
}

function getCurrentLevel() {
  return questions[active].level;
}


// ======================================
// 顯示題目列表
// ======================================

function renderList() {
  const questionList = $("questionList");

  if (!questionList) {
    return;
  }

  questionList.innerHTML = "";

  levels.forEach((level) => {
    const title = document.createElement("div");

    title.className = "question-level-title";
    title.textContent =
      `第 ${level.id} 關：${level.name}`;

    questionList.appendChild(title);

    const start = getLevelStart(level.id);
    const unlocked =
      isLevelUnlocked(level.id);

    level.questions.forEach(
      (question, questionIndex) => {
        const index = start + questionIndex;
        const isActive = index === active;
        const isDone = done.has(index);

        const button =
          document.createElement("button");

        button.type = "button";
        button.className =
          "question-item" +
          (isActive ? " active" : "") +
          (isDone ? " done" : "") +
          (!unlocked ? " locked" : "");

        button.disabled = !unlocked;

        button.innerHTML = `
          <span class="num">
            ${
              !unlocked
                ? "🔒"
                : isDone
                  ? "✓"
                  : questionIndex + 1
            }
          </span>
          <span>
            ${question.topic}
            <small>${question.title}</small>
          </span>
        `;

        button.onclick = () => {
          if (unlocked) {
            load(index);
          }
        };

        questionList.appendChild(button);
      }
    );
  });
}


// ======================================
// 載入題目
// ======================================

function load(index) {
  if (
    index < 0 ||
    index >= questions.length
  ) {
    return;
  }

  const question = questions[index];

  if (!isLevelUnlocked(question.level)) {
    alert(
      `請先完成第 ${question.level - 1} 關。`
    );

    return;
  }

  active = index;

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
    const levelStart =
      getLevelStart(question.level);

    const levelQuestionNumber =
      index - levelStart + 1;

    $("questionNumber").textContent =
      `第 ${question.level} 關・第 ${levelQuestionNumber} / 5 題`;
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
  updateProgress();
}


// ======================================
// 更新進度和分數
// ======================================

function updateProgress() {
  const totalDone = done.size;
  const score = totalDone * 5;
  const currentLevel = getCurrentLevel();
  const levelDone =
    getLevelQuestionIndexes(currentLevel)
      .filter((index) => done.has(index))
      .length;

  if ($("score")) {
    $("score").textContent = score;
  }

  if ($("headerProgress")) {
    $("headerProgress").textContent =
      `${levelDone} / 5`;
  }

  if ($("streak")) {
    $("streak").textContent =
      totalDone === questions.length
        ? "1"
        : "0";
  }

  if ($("levelOneLine")) {
    $("levelOneLine").style.width =
      `${(levelDone / 5) * 100}%`;
  }

  const countText =
    document.querySelector(
      ".current-level .topic-count"
    );

  if (countText) {
    countText.textContent =
      isLevelCompleted(currentLevel)
        ? "✓ 已完成"
        : "5 題挑戰";
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

    feedback.className =
      "feedback";
  };
}


// ======================================
// 解題步驟按鈕
// ======================================

const solutionButton =
  $("solutionButton");

if (solutionButton) {
  solutionButton.onclick = () => {
    const solution = $("solution");

    if (!solution) {
      return;
    }

    solution.innerHTML =
      `<strong>解題步驟</strong><br>` +
      questions[active].solution;

    solution.classList.toggle("visible");
  };
}


// ======================================
// Enter 檢查答案
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
      const topic =
        card.dataset.topic;

      const level = levels.find(
        (item) =>
          item.name.includes(topic) ||
          topic.includes(item.name)
      );

      if (!level) {
        load(0);
        return;
      }

      if (!isLevelUnlocked(level.id)) {
        alert(
          `請先完成第 ${level.id - 1} 關。`
        );

        return;
      }

      load(getLevelStart(level.id));
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
        <td colspan="3">目前還沒有分數</td>
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

    if (done.size < questions.length) {
      alert(
        `你目前完成 ${done.size} / ${questions.length} 題，請完成全部題目後再提交分數。`
      );

      return;
    }

    const finalScore =
      done.size * 5;

    submitScoreButton.disabled = true;
    submitScoreButton.textContent =
      "提交中...";

    const { error } =
      await supabaseClient
        .from("leaderboard")
        .insert({
          username,
          score: finalScore
        });

    submitScoreButton.disabled = false;
    submitScoreButton.textContent =
      "提交分數";

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
updateProgress();
loadLeaderboard();
