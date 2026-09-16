(() => {
  "use strict";

  const db = window.db;

  let currentUser = null;
  let currentLevel = null;
  let questions = [];
  let currentIndex = 0;

  const submittedResults = new Map();

  const params = new URLSearchParams(
    window.location.search
  );

  const levelId = Number(
    params.get("level_id") ||
    params.get("level") ||
    params.get("id") ||
    1
  );

  const $ = (id) => {
    return document.getElementById(id);
  };

  const elements = {
    levelName: $("levelName"),
    levelDescription: $("levelDescription"),

    progress: $("progress"),
    progressText: $("progressText"),

    questionNumber: $("questionNumber"),
    questionTitle: $("questionTitle"),
    questionText: $("questionText"),

    hintText: $("hintText"),
    topic: $("topic"),
    zoneName: $("zoneName"),
    zoneDescription: $("zoneDescription"),
    difficulty: $("difficulty"),
    points: $("points"),

    answerInput: $("answerInput"),
    submitAnswer: $("submitAnswer"),

    previousQuestion: $("previousQuestion"),
    nextQuestion: $("nextQuestion"),

    answerMessage: $("answerMessage"),
    correctAnswer: $("correctAnswer"),
    score: $("score"),
    xp: $("xp"),
    solutionText: $("solutionText"),

    loading: $("loading"),
    completedMessage: $("completedMessage")
  };

  document.addEventListener(
    "DOMContentLoaded",
    init
  );

  async function init() {
    try {
      showLoading(true);

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
          "網址沒有有效的 level_id。"
        );
      }

      bindEvents();
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
        error.message ||
        "載入練習頁面時發生錯誤。",
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
        window.location.href =
          "login.html";
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
        `找不到 level_id = ${levelId} 的星球。`
      );
    }

    currentLevel = data;

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
            `讀取題目 ${question.id} 的答案紀錄失敗：`,
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
    const question =
      questions[currentIndex];

    if (!question) {
      showCompleted();
      return;
    }

    clearMessage();
    clearResult();

    setText(
      elements.questionNumber,
      `第 ${currentIndex + 1} 題`
    );

    setText(
      elements.progressText,
      `${currentIndex + 1} / ${questions.length}`
    );

    setText(
      elements.questionTitle,
      question.title ||
      `第 ${currentIndex + 1} 題`
    );

    setText(
      elements.questionText,
      question.question_text || ""
    );

    setText(
      elements.hintText,
      question.hint || "暫無提示"
    );

    setText(
      elements.topic,
      question.topic ||
      question.dse_topic ||
      ""
    );

    setText(
      elements.zoneName,
      question.zone_name || ""
    );

    setText(
      elements.zoneDescription,
      question.zone_description || ""
    );

    setText(
      elements.difficulty,
      question.difficulty
        ? `難度 ${question.difficulty}`
        : ""
    );

    setText(
      elements.points,
      `${question.points ?? 5} 分`
    );

    if (elements.answerInput) {
      elements.answerInput.value = "";
      elements.answerInput.disabled = false;
    }

    if (elements.submitAnswer) {
      elements.submitAnswer.disabled = false;
      elements.submitAnswer.textContent =
        "提交答案";
    }

    updateProgress();
    updateNavigation();

    const previousResult =
      submittedResults.get(question.id);

    if (previousResult) {
      showExistingResult(previousResult);
    }
  }

  function updateProgress() {
    if (!elements.progress) {
      return;
    }

    const percentage =
      ((currentIndex + 1) /
        questions.length) *
      100;

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

  async function submitCurrentAnswer() {
    const question =
      questions[currentIndex];

    if (!question) {
      return;
    }

    if (
      submittedResults.has(question.id)
    ) {
      showExistingResult(
        submittedResults.get(question.id)
      );
      return;
    }

    const answer =
      elements.answerInput?.value.trim() || "";

    if (!answer) {
      showMessage(
        "請先輸入答案。",
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
        error.message ||
        "提交答案時發生錯誤。",
        "error"
      );
    }
  }

  function showExistingResult(result) {
    if (elements.answerInput) {
      elements.answerInput.value =
        result.submitted_answer || "";
      elements.answerInput.disabled = true;
    }

    if (elements.submitAnswer) {
      elements.submitAnswer.disabled = true;
      elements.submitAnswer.textContent =
        "已提交";
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
      (isCorrect ? 5 : 0);

    const xp =
      result.xp_awarded ??
      result.xp ??
      0;

    if (isCorrect) {
      showMessage(
        `答對了！獲得 ${points} 分。`,
        "success"
      );
    } else {
      showMessage(
        "答案不正確，請查看解題步驟。",
        "error"
      );
    }

    /*
      正確答案使用 textContent，
      CSS 會替它加上醒目的綠色方框。
    */
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
      xp ? `+${xp} XP` : ""
    );

    if (elements.solutionText) {
      elements.solutionText.innerHTML =
        result.solution ||
        result.explanation ||
        "<p>暫無解題步驟。</p>";
    }
  }

  function showPreviousQuestion() {
    if (currentIndex <= 0) {
      return;
    }

    currentIndex -= 1;
    renderQuestion();
  }

  function showNextQuestion() {
    if (
      currentIndex >= questions.length - 1
    ) {
      return;
    }

    currentIndex += 1;
    renderQuestion();
  }

  function showCompleted() {
    if (elements.completedMessage) {
      elements.completedMessage.hidden = false;
      elements.completedMessage.textContent =
        "恭喜你完成這個星球的全部題目！";
    }

    setText(
      elements.questionTitle,
      "星球任務完成"
    );

    setText(
      elements.questionText,
      "你已完成這個星球的所有題目。"
    );

    if (elements.answerInput) {
      elements.answerInput.disabled = true;
    }

    if (elements.submitAnswer) {
      elements.submitAnswer.disabled = true;
    }
  }

  function setSubmitting(isSubmitting) {
    if (elements.answerInput) {
      elements.answerInput.disabled =
        isSubmitting;
    }

    if (elements.submitAnswer) {
      elements.submitAnswer.disabled =
        isSubmitting;

      elements.submitAnswer.textContent =
        isSubmitting
          ? "提交中……"
          : "提交答案";
    }
  }

  function showLoading(isLoading) {
    if (elements.loading) {
      elements.loading.hidden =
        !isLoading;
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

  function showMessage(message, type) {
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

  function clearResult() {
    setText(
      elements.correctAnswer,
      ""
    );

    setText(
      elements.score,
      ""
    );

    setText(
      elements.xp,
      ""
    );

    if (elements.solutionText) {
      elements.solutionText.innerHTML = "";
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
