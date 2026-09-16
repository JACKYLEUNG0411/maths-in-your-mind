let currentLevel = null;
let questions = [];
let activeIndex = 0;
let answerMap = new Map();
let pendingAnswer = "";

const levelCode =
  document.getElementById("levelCode");

const levelName =
  document.getElementById("levelName");

const playerName =
  document.getElementById("playerName");

const playerScore =
  document.getElementById("playerScore");

const navigation =
  document.getElementById("questionNavigation");

const questionTopic =
  document.getElementById("questionTopic");

const questionNumber =
  document.getElementById("questionNumber");

const questionTitle =
  document.getElementById("questionTitle");

const questionText =
  document.getElementById("questionText");

const answerInput =
  document.getElementById("answerInput");

const submitAnswer =
  document.getElementById("submitAnswer");

const showHint =
  document.getElementById("showHint");

const hintText =
  document.getElementById("hintText");

const answerMessage =
  document.getElementById("answerMessage");

const resultPanel =
  document.getElementById("resultPanel");

const resultTitle =
  document.getElementById("resultTitle");

const submittedAnswer =
  document.getElementById("submittedAnswer");

const correctAnswer =
  document.getElementById("correctAnswer");

const awardedPoints =
  document.getElementById("awardedPoints");

const solutionText =
  document.getElementById("solutionText");

const previousQuestion =
  document.getElementById("previousQuestion");

const nextQuestion =
  document.getElementById("nextQuestion");

const confirmDialog =
  document.getElementById("confirmDialog");

const cancelSubmit =
  document.getElementById("cancelSubmit");

const confirmSubmit =
  document.getElementById("confirmSubmit");


async function initialisePractice() {
  const user = await requireLogin();

  if (!user) return;

  const parameters =
    new URLSearchParams(location.search);

  const levelId =
    Number(parameters.get("level") || 1);

  if (
    !Number.isInteger(levelId) ||
    levelId < 1
  ) {
    location.href = "levels.html";
    return;
  }

  const [
    levelResponse,
    questionResponse,
    allQuestionsResponse,
    answerResponse,
    summary
  ] = await Promise.all([
    window.db
      .from("levels")
      .select("*")
      .eq("id", levelId)
      .single(),

    window.db
      .from("questions")
      .select("*")
      .eq("level_id", levelId)
      .order("question_order"),

    window.db
      .from("questions")
      .select("id, level_id"),

    window.db
      .from("answers")
      .select(
        "question_id, is_correct, points_awarded"
      ),

    getMySummary()
  ]);

  if (
    levelResponse.error ||
    questionResponse.error ||
    allQuestionsResponse.error ||
    answerResponse.error
  ) {
    console.error(
      levelResponse.error,
      questionResponse.error,
      allQuestionsResponse.error,
      answerResponse.error
    );

    showMessage(
      answerMessage,
      "題目載入失敗，請返回任務地圖再試。",
      "error"
    );

    return;
  }

  const answeredIds =
    new Set(
      answerResponse.data.map(
        (answer) => answer.question_id
      )
    );

  const previousQuestions =
    allQuestionsResponse.data.filter(
      (question) =>
        question.level_id < levelId
    );

  const unlocked =
    levelId === 1 ||
    previousQuestions.every(
      (question) =>
        answeredIds.has(question.id)
    );

  if (!unlocked) {
    alert("請先完成前面的關卡。");
    location.href = "levels.html";
    return;
  }

  currentLevel = levelResponse.data;
  questions = questionResponse.data;

  answerResponse.data.forEach((answer) => {
    answerMap.set(
      answer.question_id,
      answer
    );
  });

  levelCode.textContent =
    `MISSION ${String(levelId).padStart(2, "0")}`;

  levelName.textContent =
    currentLevel.name;

  playerName.textContent =
    summary?.display_name || "探索者";

  playerScore.textContent =
    summary?.score || 0;

  const firstUnanswered =
    questions.findIndex(
      (question) =>
        !answerMap.has(question.id)
    );

  activeIndex =
    firstUnanswered >= 0
      ? firstUnanswered
      : 0;

  renderNavigation();
  await loadQuestion(activeIndex);
}


function renderNavigation() {
  navigation.innerHTML = "";

  questions.forEach((question, index) => {
    const existing =
      answerMap.get(question.id);

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "question-nav-button" +
      (index === activeIndex ? " active" : "") +
      (existing ? " answered" : "") +
      (existing?.is_correct ? " correct" : "") +
      (
        existing && !existing.is_correct
          ? " wrong"
          : ""
      );

    button.innerHTML = `
      <span>${index + 1}</span>
      <div>
        <strong>
          ${escapeHTML(question.title)}
        </strong>
        <small>
          ${
            existing
              ? existing.is_correct
                ? "已提交・+5"
                : "已提交・+0"
              : "等待作答"
          }
        </small>
      </div>
    `;

    button.addEventListener("click", async () => {
      activeIndex = index;
      renderNavigation();
      await loadQuestion(index);
    });

    navigation.appendChild(button);
  });
}


async function loadQuestion(index) {
  const question = questions[index];

  if (!question) return;

  activeIndex = index;
  renderNavigation();

  questionTopic.textContent =
    question.topic;

  questionNumber.textContent =
    `${index + 1} / ${questions.length}`;

  questionTitle.textContent =
    question.title;

  questionText.textContent =
    question.question_text;

  hintText.textContent =
    question.hint;

  hintText.hidden = true;
  showHint.textContent = "顯示任務提示";

  answerInput.value = "";
  answerInput.disabled = false;

  submitAnswer.disabled = false;
  submitAnswer.textContent = "正式提交";

  showMessage(answerMessage, "");

  resultPanel.hidden = true;

  previousQuestion.disabled =
    index === 0;

  nextQuestion.disabled =
    index === questions.length - 1;

  const existing =
    answerMap.get(question.id);

  if (existing) {
    await showExistingResult(question.id);
  } else {
    setTimeout(() => answerInput.focus(), 100);
  }
}


async function showExistingResult(questionId) {
  answerInput.disabled = true;
  submitAnswer.disabled = true;
  submitAnswer.textContent = "已提交";

  const { data, error } =
    await window.db.rpc(
      "get_my_answer",
      {
        p_question_id: questionId
      }
    );

  if (error) {
    showMessage(
      answerMessage,
      error.message,
      "error"
    );
    return;
  }

  if (data) {
    displayResult(data);
  }
}


function displayResult(result) {
  resultPanel.hidden = false;

  resultPanel.classList.toggle(
    "correct",
    result.is_correct
  );

  resultPanel.classList.toggle(
    "wrong",
    !result.is_correct
  );

  resultTitle.textContent =
    result.is_correct
      ? "回答正確・能量增加"
      : "回答已記錄・請查看分析";

  submittedAnswer.textContent =
    result.submitted_answer;

  correctAnswer.textContent =
    result.correct_answer;

  awardedPoints.textContent =
    `${result.points_awarded} / 5`;

  /*
    solution 由我們自己的資料庫管理，
    所以在這裡使用 innerHTML 顯示換行及粗體。
  */
  solutionText.innerHTML =
    result.solution;

  answerInput.value =
    result.submitted_answer;

  answerInput.disabled = true;

  submitAnswer.disabled = true;
  submitAnswer.textContent = "已提交";
}


submitAnswer.addEventListener("click", () => {
  const value = answerInput.value.trim();

  if (!value) {
    showMessage(
      answerMessage,
      "請先輸入答案。",
      "error"
    );

    answerInput.focus();
    return;
  }

  pendingAnswer = value;
  confirmDialog.hidden = false;
});


cancelSubmit.addEventListener("click", () => {
  confirmDialog.hidden = true;
  pendingAnswer = "";
  answerInput.focus();
});


confirmSubmit.addEventListener(
  "click",
  async () => {
    const question =
      questions[activeIndex];

    if (!question || !pendingAnswer) {
      confirmDialog.hidden = true;
      return;
    }

    confirmSubmit.disabled = true;
    confirmSubmit.textContent = "提交中...";

    submitAnswer.disabled = true;

    const { data, error } =
      await window.db.rpc(
        "submit_answer",
        {
          p_question_id: question.id,
          p_answer: pendingAnswer
        }
      );

    confirmSubmit.disabled = false;
    confirmSubmit.textContent = "確定提交";

    confirmDialog.hidden = true;
    pendingAnswer = "";

    if (error) {
      submitAnswer.disabled = false;

      showMessage(
        answerMessage,
        error.message,
        "error"
      );

      return;
    }

    answerMap.set(
      question.id,
      {
        question_id: question.id,
        is_correct: data.is_correct,
        points_awarded:
          data.points_awarded
      }
    );

    playerScore.textContent =
      data.total_score;

    displayResult(data);
    renderNavigation();

    showMessage(
      answerMessage,
      data.is_correct
        ? `回答正確！獲得 ${data.points_awarded} 分。`
        : "答案不正確，本題獲得 0 分。請查看解題步驟。",
      data.is_correct
        ? "success"
        : "error"
    );

    const completedLevel =
      questions.every(
        (item) =>
          answerMap.has(item.id)
      );

    if (completedLevel) {
      const nextLevel =
        currentLevel.id + 1;

      if (nextLevel <= 4) {
        nextQuestion.disabled = false;
        nextQuestion.textContent =
          "前往下一關 →";

        nextQuestion.onclick = () => {
          location.href =
            `practice.html?level=${nextLevel}`;
        };
      } else {
        nextQuestion.disabled = false;
        nextQuestion.textContent =
          "查看最終排名 →";

        nextQuestion.onclick = () => {
          location.href =
            "leaderboard.html";
        };
      }
    }
  }
);


showHint.addEventListener("click", () => {
  hintText.hidden = !hintText.hidden;

  showHint.textContent =
    hintText.hidden
      ? "顯示任務提示"
      : "收起任務提示";
});


previousQuestion.addEventListener(
  "click",
  async () => {
    if (activeIndex <= 0) return;

    activeIndex -= 1;
    await loadQuestion(activeIndex);
  }
);


nextQuestion.addEventListener(
  "click",
  async () => {
    if (
      activeIndex >= questions.length - 1
    ) {
      return;
    }

    activeIndex += 1;
    await loadQuestion(activeIndex);
  }
);


answerInput.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Enter" &&
      !submitAnswer.disabled
    ) {
      submitAnswer.click();
    }
  }
);


confirmDialog.addEventListener(
  "click",
  (event) => {
    if (event.target === confirmDialog) {
      confirmDialog.hidden = true;
      pendingAnswer = "";
    }
  }
);


initialisePractice();

