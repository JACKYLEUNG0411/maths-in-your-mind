/*
  practice.js
  Maths in Your Mind
*/

(() => {
  "use strict";

  /*
    必須先在 config.js 建立：

    window.db = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );
  */

  const db = window.db;

  if (!db) {
    console.error("window.db 不存在，請先檢查 config.js");
    return;
  }

  // --------------------------------------------------
  // 基本工具
  // --------------------------------------------------

  const $ = (id) => document.getElementById(id);

  const params = new URLSearchParams(window.location.search);

  const levelId = Number(
    params.get("level_id") ||
    params.get("level") ||
    params.get("id") ||
    1
  );

  let currentUser = null;
  let level = null;
  let questions = [];
  let currentIndex = 0;
  let submittedResults = new Map();

  // --------------------------------------------------
  // DOM 元素
  // 支援不同命名方式，避免 HTML 少一個欄位時整頁停止
  // --------------------------------------------------

  const els = {
    levelName:
      $("levelName") ||
      $("planetName") ||
      $("levelTitle"),

    levelDescription:
      $("levelDescription") ||
      $("planetDescription"),

    progress:
      $("progress") ||
      $("questionProgress"),

    progressText:
      $("progressText") ||
      $("questionProgressText"),

    questionNumber:
      $("questionNumber") ||
      $("currentQuestionNumber"),

    questionTitle:
      $("questionTitle") ||
      $("questionTitleText"),

    questionText:
      $("questionText") ||
      $("questionBody"),

    hint:
      $("hint") ||
      $("hintText") ||
      $("questionHint"),

    topic:
      $("topic") ||
      $("questionTopic"),

    zoneName:
      $("zoneName") ||
      $("areaName"),

    zoneDescription:
      $("zoneDescription") ||
      $("areaDescription"),

    difficulty:
      $("difficulty") ||
      $("difficultyText"),

    points:
      $("points") ||
      $("questionPoints"),

    answerInput:
      $("answerInput") ||
      $("answer"),

    submitAnswer:
      $("submitAnswer") ||
      $("submitBtn"),

    previousQuestion:
      $("previousQuestion") ||
      $("prevQuestion") ||
      $("prevBtn"),

    nextQuestion:
      $("nextQuestion") ||
      $("nextBtn"),

    answerMessage:
      $("answerMessage") ||
      $("resultMessage") ||
      $("feedback"),

    solution:
      $("solution") ||
      $("solutionText") ||
      $("explanation"),

    correctAnswer:
      $("correctAnswer") ||
      $("answerResult"),

    score:
      $("score") ||
      $("questionScore"),

    xp:
      $("xp") ||
      $("questionXP"),

    completedMessage:
      $("completedMessage") ||
      $("levelCompleted"),

    loading:
      $("loading") ||
      $("loadingMessage")
  };

  // --------------------------------------------------
  // 頁面初始化
  // --------------------------------------------------

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    try {
      showLoading(true);
      clearMessage();

      if (!Number.isInteger(levelId) || levelId <= 0) {
        throw new Error("找不到有效的星球 ID。");
      }

      const {
        data: sessionData,
        error: sessionError
      } = await db.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      currentUser = sessionData?.session?.user || null;

      if (!currentUser) {
        showMessage("請先登入，才能開始答題。", "error");

        setTimeout(() => {
          window.location.href = "login.html";
        }, 1200);

        return;
      }

      await loadLevel();
      await loadQuestions();
      await loadExistingAnswers();
      bindEvents();

      if (questions.length === 0) {
        throw new Error("這個星球目前沒有題目。");
      }

      renderQuestion();
    } catch (error) {
      console.error(error);
      showMessage(
        error?.message || "載入題目時發生錯誤。",
        "error"
      );
    } finally {
      showLoading(false);
    }
  }

  // --------------------------------------------------
  // 讀取星球
  // --------------------------------------------------

  async function loadLevel() {
    const { data, error } = await db
      .from("levels")
      .select("*")
      .eq("id", levelId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("找不到這個星球。");
    }

    level = data;

    setText(els.levelName, data.name || "未命名星球");
    setText(
      els.levelDescription,
      data.description || ""
    );
  }

  // --------------------------------------------------
  // 讀取題目
  // --------------------------------------------------

  async function loadQuestions() {
    const { data, error } = await db
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

    questions = Array.isArray(data) ? data : [];
  }

  // --------------------------------------------------
  // 讀取已提交答案
  // 不從公開 questions 讀取正確答案
  // --------------------------------------------------

  async function loadExistingAnswers() {
    submittedResults = new Map();

    for (const question of questions) {
      try {
        const { data, error } = await db.rpc(
          "get_my_answer",
          {
            p_question_id: question.id
          }
        );

        if (error) {
          /*
            如果某道題沒有答案，不應該令整個頁面停止。
          */
          console.warn(
            `讀取題目 ${question.id} 的作答紀錄失敗：`,
            error.message
          );
          continue;
        }

        if (data) {
          const result = unwrapRpcResult(data);
          submittedResults.set(question.id, result);
        }
      } catch (error) {
        console.warn(error);
      }
    }
  }

  // --------------------------------------------------
  // 綁定按鈕
  // --------------------------------------------------

  function bindEvents() {
    if (els.submitAnswer) {
      els.submitAnswer.addEventListener(
        "click",
        submitCurrentAnswer
      );
    }

    if (els.previousQuestion) {
      els.previousQuestion.addEventListener(
        "click",
        showPreviousQuestion
      );
    }

    if (els.nextQuestion) {
      els.nextQuestion.addEventListener(
        "click",
        showNextQuestion
      );
    }

    if (els.answerInput) {
      els.answerInput.addEventListener(
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
  }

  // --------------------------------------------------
  // 顯示目前題目
  // --------------------------------------------------

  function renderQuestion() {
    const question = questions[currentIndex];

    if (!question) {
      showCompleted();
      return;
    }

    clearMessage();
    clearResult();

    setText(
      els.questionNumber,
      String(currentIndex + 1)
    );

    setText(
      els.progressText,
      `${currentIndex + 1} / ${questions.length}`
    );

    setText(
      els.questionTitle,
      question.title || `第 ${currentIndex + 1} 題`
    );

    setText(
      els.questionText,
      question.question_text || ""
    );

    setText(
      els.hint,
      question.hint || "暫無提示"
    );

    setText(
      els.topic,
      question.topic || question.dse_topic || ""
    );

    setText(
      els.zoneName,
      question.zone_name || ""
    );

    setText(
      els.zoneDescription,
      question.zone_description || ""
    );

    setText(
      els.difficulty,
      question.difficulty
        ? `難度 ${question.difficulty}`
        : ""
    );

    setText(
      els.points,
      `${question.points ?? 5} 分`
    );

    updateProgress();

    if (els.answerInput) {
      els.answerInput.value = "";
      els.answerInput.disabled = false;
    }

    if (els.submitAnswer) {
      els.submitAnswer.disabled = false;
      els.submitAnswer.textContent = "提交答案";
    }

    const previousResult =
      submittedResults.get(question.id);

    if (previousResult) {
      showExistingResult(previousResult);
    }
  }

  // --------------------------------------------------
  // 顯示進度
  // --------------------------------------------------

  function updateProgress() {
    if (!els.progress) {
      return;
    }

    const percentage =
      questions.length === 0
        ? 0
        : ((currentIndex + 1) / questions.length) * 100;

    if (
      els.progress.tagName === "PROGRESS"
    ) {
      els.progress.max = 100;
      els.progress.value = percentage;
    } else {
      els.progress.style.width =
        `${percentage}%`;
    }
  }

  // --------------------------------------------------
  // 提交答案
  // --------------------------------------------------

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

    const rawAnswer =
      els.answerInput?.value?.trim() || "";

    if (!rawAnswer) {
      showMessage(
        "請先輸入答案。",
        "error"
      );
      els.answerInput?.focus();
      return;
    }

    setSubmitState(true);
    clearMessage();
    clearResult();

    try {
      const { data, error } = await db.rpc(
        "submit_answer",
        {
          p_question_id: question.id,
          p_answer: rawAnswer
        }
      );

      if (error) {
        throw error;
      }

      const result = unwrapRpcResult(data);

      submittedResults.set(
        question.id,
        result
      );

      showResult(result);

    } catch (error) {
      console.error(error);

      /*
        如果資料庫函式使用 answer 而不是 p_answer，
        請把上面的參數改成：

        {
          p_question_id: question.id,
          answer: rawAnswer
        }
      */

      showMessage(
        error?.message ||
        "提交答案時發生錯誤。",
        "error"
      );

      setSubmitState(false);
    }
  }

  // --------------------------------------------------
  // 顯示已提交結果
  // --------------------------------------------------

  function showExistingResult(result) {
    if (!result) {
      return;
    }

    if (els.answerInput) {
      els.answerInput.value =
        result.submitted_answer || "";
      els.answerInput.disabled = true;
    }

    if (els.submitAnswer) {
      els.submitAnswer.disabled = true;
      els.submitAnswer.textContent = "已提交";
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
    避免答案內容被當成 HTML 執行。
    CSS 會自動為它加上綠色 Highlight 方框。
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
    /*
      solution 由資料庫提供，保留 HTML 解題格式。
    */
    elements.solutionText.innerHTML =
      result.solution ||
      result.explanation ||
      "<p>暫無解題步驟。</p>";
  }
}


    if (els.solution) {
      /*
        solution 是由資料庫管理員輸入的受信任內容。
        如果將來允許普通使用者輸入 solution，
        不應直接使用 innerHTML。
      */
      els.solution.innerHTML =
        result.solution ||
        result.explanation ||
        "<p>暫無解題步驟。</p>";
    }
  }

  // --------------------------------------------------
  // 上一題、下一題
  // --------------------------------------------------

  function showPreviousQuestion() {
    if (currentIndex <= 0) {
      return;
    }

    currentIndex -= 1;
    renderQuestion();
  }

  function showNextQuestion() {
    if (currentIndex >= questions.length - 1) {
      showCompleted();
      return;
    }

    currentIndex += 1;
    renderQuestion();
  }

  function showCompleted() {
    if (els.completedMessage) {
      els.completedMessage.hidden = false;
      els.completedMessage.textContent =
        "你已完成這個星球的所有題目！";
    }

    if (els.questionTitle) {
      els.questionTitle.textContent =
        "星球任務完成";
    }

    if (els.questionText) {
      els.questionText.textContent =
        "恭喜你完成本星球的全部題目。";
    }

    if (els.answerInput) {
      els.answerInput.disabled = true;
    }

    if (els.submitAnswer) {
      els.submitAnswer.disabled = true;
    }

    showMessage(
      "本星球任務完成！",
      "success"
    );
  }

  // --------------------------------------------------
  // 輸入及顯示狀態
  // --------------------------------------------------

  function setSubmitState(isSubmitting) {
    if (!els.submitAnswer) {
      return;
    }

    els.submitAnswer.disabled = isSubmitting;

    els.submitAnswer.textContent =
      isSubmitting
        ? "提交中..."
        : "提交答案";

    if (els.answerInput) {
      els.answerInput.disabled =
        isSubmitting;
    }
  }

  function showLoading(isLoading) {
    if (!els.loading) {
      return;
    }

    els.loading.hidden = !isLoading;
  }

  function clearResult() {
    setText(els.correctAnswer, "");
    setText(els.score, "");
    setText(els.xp, "");

    if (els.solution) {
      els.solution.innerHTML = "";
    }
  }

  function clearMessage() {
    showMessage("", "");
  }

  function showMessage(message, type) {
    if (!els.answerMessage) {
      return;
    }

    els.answerMessage.textContent = message;
    els.answerMessage.className = "";

    if (type) {
      els.answerMessage.classList.add(
        `message-${type}`
      );
    }

    els.answerMessage.hidden =
      !message;
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
