(() => {
  "use strict";

  const $ = (id) => {
    return document.getElementById(id);
  };

  const elements = {
    levelName: $("levelName"),
    levelDescription: $("levelDescription"),

    progress: $("progress"),
    progressText: $("progressText"),
    questionNumber: $("questionNumber"),

    zoneIcon: $("zoneIcon"),
    zoneName: $("zoneName"),
    zoneDescription: $("zoneDescription"),
    topic: $("topic"),
    difficulty: $("difficulty"),
    points: $("points"),

    questionTitle: $("questionTitle"),
    questionText: $("questionText"),

    toggleHint: $("toggleHint"),
    hintButtonText: $("hintButtonText"),
    hintContent: $("hintContent"),
    hintText: $("hintText"),

    answerInput: $("answerInput"),
    submitAnswer: $("submitAnswer"),
    answerMessage: $("answerMessage"),

    resultPanel: $("resultPanel"),
    resultStatus: $("resultStatus"),
    correctAnswer: $("correctAnswer"),
    score: $("score"),
    xp: $("xp"),
    solutionText: $("solutionText"),

    previousQuestion: $("previousQuestion"),
    nextQuestion: $("nextQuestion"),

    loading: $("loading"),
    completedMessage: $("completedMessage")
  };

  const params = new URLSearchParams(
    window.location.search
  );

  const levelId = Number(
    params.get("level_id") ||
    params.get("level") ||
    params.get("id") ||
    1
  );

  let db = null;
  let currentUser = null;
  let questions = [];
  let currentIndex = 0;

  const submittedResults = new Map();

  document.addEventListener(
    "DOMContentLoaded",
    init
  );

  async function init() {
    try {
      db = window.db;

      if (!db) {
        throw new Error(
          "找不到 Supabase 設定，請檢查 config.js。"
        );
      }

      if (
        !Number.isInteger(levelId) ||
        levelId <= 0
      ) {
        throw new Error(
          "網址中沒有有效的 level_id。"
        );
      }

      bindEvents();
      showLoading(true);

      await checkLogin();
      await loadLevel();
      await loadQuestions();
      await loadSubmittedAnswers();

      if (questions.length === 0) {
        throw new Error(
          "這個星球目前沒有題目。"
        );
      }

      renderQuestion();
    } catch (error) {
      console.error(error);

      showMessage(
        "系統暫時無法載入資料，請稍後再試。",
        "error"
      );
    } finally {
      showLoading(false);
    }
  }

  async function checkLogin() {
    const {
      data,
      error
    } = await db.auth.getSession();

    if (error) {
      throw error;
    }

    currentUser =
      data?.session?.user || null;

    if (!currentUser) {
      showMessage(
        "請先登入才能開始答題。",
        "error"
      );

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);

      throw new Error("尚未登入。");
    }
  }

  async function loadLevel() {
    const {
      data,
      error
    } = await db
      .from("levels")
      .select("*")
      .eq("id", levelId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "找不到指定的星球。"
      );
    }

    setText(
      elements.levelName,
      data.name || "未命名星球"
    );

    setText(
      elements.levelDescription,
      data.description || ""
    );
  }

  async function loadQuestions() {
    const {
      data,
      error
    } = await db
      .from("questions")
      .select(`
        id,
        level_id,
        question_order,
        title,
        question_text,
        hint,
        topic,
        zone_name,
        zone_description,
        zone_icon,
        difficulty,
        dse_topic,
        question_type,
        is_challenge,
        points
      `)
      .eq("level_id", levelId)
      .order("question_order", {
        ascending: true
      });

    if (error) {
      throw error;
    }

    questions = Array.isArray(data)
      ? data
      : [];
  }

  async function loadSubmittedAnswers() {
    submittedResults.clear();

    for (const question of questions) {
      try {
        const {
          data,
          error
        } = await db.rpc(
          "get_my_answer",
          {
            p_question_id: question.id
          }
        );

        if (error) {
          console.warn(
            `讀取題目 ${question.id} 紀錄失敗`,
            error.message
          );
          continue;
        }

        const result =
          unwrapRpcResult(data);

        if (result) {
          submittedResults.set(
            question.id,
            result
          );
        }
      } catch (error) {
        console.warn(error);
      }
    }
  }

  function bindEvents() {
    elements.submitAnswer?.addEventListener(
      "click",
      submitCurrentAnswer
    );

    elements.previousQuestion?.addEventListener(
      "click",
      showPreviousQuestion
    );

    elements.nextQuestion?.addEventListener(
      "click",
      showNextQuestion
    );

    elements.toggleHint?.addEventListener(
      "click",
      toggleHint
    );

    elements.answerInput?.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {
          event.preventDefault();
          submitCurrentAnswer();
        }
      }
    );
  }

  function renderQuestion() {
    const question = questions[currentIndex];

    if (!question) {
      showCompleted();
      return;
    }

    clearMessage();
    clearResult();
    closeHint();

    const progressPercentage = Math.round(
      ((currentIndex + 1) / questions.length) * 100
    );

    setText(
      elements.questionNumber,
      `第 ${currentIndex + 1} 題 · 共 ${questions.length} 題`
    );

    setText(
      elements.progressText,
      `目前完成 ${progressPercentage}% · 正在進行第 ${currentIndex + 1} 題`
    );

    setText(
      elements.zoneIcon,
      question.zone_icon || "◆"
    );

    setText(
      elements.zoneName,
      question.zone_name || "未知區域"
    );

    setText(
      elements.zoneDescription,
      question.zone_description || ""
    );

    setText(
      elements.topic,
      question.topic ||
      question.dse_topic ||
      "數學任務"
    );

    setText(
      elements.difficulty,
      getDifficultyText(
        question.difficulty
      )
    );

    setText(
      elements.points,
      `✦ 本題 ${question.points ?? 5} 分`
    );

    setText(
      elements.questionTitle,
      question.title ||
      `第 ${currentIndex + 1} 題`
    );

    const questionText =
      formatText(question.question_text);

    setText(
      elements.questionText,
      questionText
    );

    renderMath(
      elements.questionText
    );

    setText(
      elements.hintText,
      question.hint ||
      "這道題暫時沒有額外提示。"
    );

    if (elements.answerInput) {
      elements.answerInput.value = "";
      elements.answerInput.disabled = false;
    }

    if (elements.submitAnswer) {
      elements.submitAnswer.disabled = false;
      elements.submitAnswer.innerHTML =
        '<span aria-hidden="true">✦</span> 提交答案';
    }

    updateProgress();
    updateNavigation();

    const previousResult =
      submittedResults.get(question.id);

    if (previousResult) {
      showExistingResult(previousResult);
    }
  }

  function formatText(value) {
    return String(value ?? "")
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t");
  }

  function getDifficultyText(value) {
    const level = Math.min(
      Math.max(Number(value) || 1, 1),
      3
    );

    return `難度 ${"●".repeat(level)}${"○".repeat(3 - level)}`;
  }

  function updateProgress() {
    if (
      !elements.progress ||
      questions.length === 0
    ) {
      return;
    }

    const percentage =
      ((currentIndex + 1) / questions.length) * 100;

    elements.progress.style.width =
      `${percentage}%`;
  }

  function updateNavigation() {
    if (elements.previousQuestion) {
      elements.previousQuestion.disabled =
        currentIndex <= 0;
    }

    if (elements.nextQuestion) {
      elements.nextQuestion.disabled =
        currentIndex >= questions.length - 1;
    }
  }

  function toggleHint() {
    if (
      !elements.hintContent ||
      !elements.toggleHint
    ) {
      return;
    }

    const opening =
      elements.hintContent.hidden;

    elements.hintContent.hidden = !opening;

    elements.toggleHint.setAttribute(
      "aria-expanded",
      String(opening)
    );

    elements.toggleHint.classList.toggle(
      "is-open",
      opening
    );

    setText(
      elements.hintButtonText,
      opening ? "收起提示" : "使用提示"
    );
  }

  function closeHint() {
    if (elements.hintContent) {
      elements.hintContent.hidden = true;
    }

    if (elements.toggleHint) {
      elements.toggleHint.setAttribute(
        "aria-expanded",
        "false"
      );

      elements.toggleHint.classList.remove(
        "is-open"
      );
    }

    setText(
      elements.hintButtonText,
      "使用提示"
    );
  }

  async function submitCurrentAnswer() {
    const question = questions[currentIndex];

    if (!question) {
      return;
    }

    if (submittedResults.has(question.id)) {
      showExistingResult(
        submittedResults.get(question.id)
      );
      return;
    }

    const answer =
      elements.answerInput?.value.trim() || "";

    if (!answer) {
      showMessage(
        "請先輸入你的答案。",
        "error"
      );

      elements.answerInput?.focus();
      return;
    }

    setSubmitting(true);
    clearMessage();
    clearResult();

    try {
      const {
        data,
        error
      } = await db.rpc(
        "submit_answer",
        {
          p_question_id: question.id,
          p_answer: answer
        }
      );

      if (error) {
        throw error;
      }

      const result =
        unwrapRpcResult(data) || {
          submitted_answer: answer,
          is_correct: false,
          points_awarded: 0
        };

      submittedResults.set(
        question.id,
        result
      );

      showResult(result);
    } catch (error) {
      console.error(error);

      setSubmitting(false);

      showMessage(
        "提交答案時發生錯誤，請稍後再試。",
        "error"
      );
    }
  }

  function setSubmitting(value) {
    if (elements.answerInput) {
      elements.answerInput.disabled = value;
    }

    if (elements.submitAnswer) {
      elements.submitAnswer.disabled = value;

      elements.submitAnswer.innerHTML = value
        ? '<span aria-hidden="true">◌</span> 正在驗證答案…'
        : '<span aria-hidden="true">✦</span> 提交答案';
    }
  }

  function showExistingResult(result) {
    if (elements.answerInput) {
      elements.answerInput.value =
        result.submitted_answer || "";

      elements.answerInput.disabled = true;
    }

    showResult(result);
  }

  function showResult(result) {
    const isCorrect =
      result.is_correct === true ||
      result.correct === true;

    const points =
      result.points_awarded ??
      result.points ??
      0;

    const xp =
      result.xp_awarded ??
      result.xp ??
      0;

    if (isCorrect) {
      showMessage(
        `任務成功！你獲得了 ${points} 分。`,
        "success"
      );

      setText(
        elements.resultStatus,
        "✓ 回答正確 · 任務訊號已確認"
      );

      elements.resultStatus?.classList.add(
        "result-correct"
      );

      elements.resultStatus?.classList.remove(
        "result-incorrect"
      );
    } else {
      showMessage(
        "這次答案未正確。請參考正確答案及解題步驟。",
        "error"
      );

      setText(
        elements.resultStatus,
        "⌁ 任務分析完成 · 參考以下正確答案"
      );

      elements.resultStatus?.classList.add(
        "result-incorrect"
      );

      elements.resultStatus?.classList.remove(
        "result-correct"
      );
    }

    setText(
      elements.correctAnswer,
      result.correct_answer ||
      result.answer ||
      "暫無資料"
    );

    setText(
      elements.score,
      `${points} 分`
    );

    setText(
      elements.xp,
      xp ? `+${xp} XP` : "0 XP"
    );

    const solution =
      result.solution ||
      result.explanation ||
      "暫無解題步驟。";

    renderSafeSolution(
      elements.solutionText,
      solution
    );

    if (elements.resultPanel) {
      elements.resultPanel.hidden = false;
    }

    if (elements.answerInput) {
      elements.answerInput.disabled = true;
    }

    if (elements.submitAnswer) {
      elements.submitAnswer.disabled = true;
      elements.submitAnswer.innerHTML =
        '<span aria-hidden="true">✓</span> 已提交答案';
    }
  }

  function renderSafeSolution(
    element,
    solution
  ) {
    if (!element) {
      return;
    }

    const rawSolution = String(
      solution ?? ""
    );

    if (
      window.DOMPurify &&
      typeof window.DOMPurify.sanitize ===
        "function"
    ) {
      element.innerHTML =
        window.DOMPurify.sanitize(
          rawSolution,
          {
            ALLOWED_TAGS: [
              "p",
              "br",
              "strong",
              "b",
              "em",
              "i",
              "u",
              "sub",
              "sup",
              "ul",
              "ol",
              "li",
              "span"
            ],
            ALLOWED_ATTR: [
              "class"
            ]
          }
        );
    } else {
      element.textContent = rawSolution;
    }

    renderMath(element);
  }

  function renderMath(element) {
    if (!element) {
      return;
    }

    if (
      typeof window.renderMathInElement !==
      "function"
    ) {
      return;
    }

window.renderMathInElement(element, {
  delimiters: [
    // LaTeX 行內公式：會和中文字、數字連在一起
    {
      left: "\$$",
      right: "\$$",
      display: false
    },

    // 單一美元符號行內公式
    {
      left: "$",
      right: "$",
      display: false
    },

    // 如果舊題目使用 $$...$$，也當作行內公式處理
    {
      left: "$$",
      right: "$$",
      display: false
    },

    // 只有 $$...$$ 才會獨立置中
    {
      left: "\$$",
      right: "\$$",
      display: true
    }
  ],

  throwOnError: false,
  strict: "ignore"
});

  }

  function showPreviousQuestion() {
    if (currentIndex <= 0) {
      return;
    }

    currentIndex -= 1;
    renderQuestion();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function showNextQuestion() {
    if (
      currentIndex >= questions.length - 1
    ) {
      return;
    }

    currentIndex += 1;
    renderQuestion();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function showCompleted() {
    if (elements.completedMessage) {
      elements.completedMessage.hidden = false;

      elements.completedMessage.innerHTML = `
        <span
          class="completed-icon"
          aria-hidden="true"
        >✦</span>

        <div>
          <p>PLANET MISSION COMPLETE</p>
          <h2>恭喜你完成這個星球的全部題目！</h2>
          <a href="levels.html">返回星球地圖</a>
        </div>
      `;
    }

    if (elements.answerInput) {
      elements.answerInput.disabled = true;
    }

    if (elements.submitAnswer) {
      elements.submitAnswer.disabled = true;
    }
  }

  function clearResult() {
    if (elements.resultPanel) {
      elements.resultPanel.hidden = true;
    }

    if (elements.resultStatus) {
      elements.resultStatus.textContent = "";
      elements.resultStatus.className =
        "result-status";
    }

    setText(elements.correctAnswer, "");
    setText(elements.score, "");
    setText(elements.xp, "");

    if (elements.solutionText) {
      elements.solutionText.replaceChildren();
    }
  }

  function clearMessage() {
    if (!elements.answerMessage) {
      return;
    }

    elements.answerMessage.textContent = "";
    elements.answerMessage.hidden = true;
    elements.answerMessage.className =
      "answer-message";
  }

  function showMessage(
    message,
    type
  ) {
    if (!elements.answerMessage) {
      return;
    }

    elements.answerMessage.textContent =
      message || "";

    elements.answerMessage.hidden =
      !message;

    elements.answerMessage.className =
      "answer-message";

    if (type) {
      elements.answerMessage.classList.add(
        `message-${type}`
      );
    }
  }

  function showLoading(isLoading) {
    if (elements.loading) {
      elements.loading.hidden = !isLoading;
    }
  }

  function setText(element, value) {
    if (!element) {
      return;
    }

    element.textContent =
      value === null ||
      value === undefined
        ? ""
        : String(value);
  }

  function unwrapRpcResult(data) {
    if (Array.isArray(data)) {
      return data[0] || null;
    }

    return data || null;
  }
})();
