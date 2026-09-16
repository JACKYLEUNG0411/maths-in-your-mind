let planet;
let allPlanets = [];
let questions = [];
let activeIndex = 0;
let answerMap = new Map();
let pendingAnswer = "";

const $ = (id) => document.getElementById(id);

async function initialisePractice() {
  const user = await requireLogin();
  if (!user) return;

  const levelId = Number(
    new URLSearchParams(location.search)
      .get("level")
  );

  if (!Number.isInteger(levelId)) {
    location.href = "levels.html";
    return;
  }

  const [
    planetResult,
    planetsResult,
    questionsResult,
    allQuestionsResult,
    answersResult,
    summary
  ] = await Promise.all([
    window.db
      .from("levels")
      .select("*")
      .eq("id", levelId)
      .single(),

    window.db
      .from("levels")
      .select("*")
      .eq("is_published", true)
      .order("planet_order"),

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
    planetResult.error ||
    planetsResult.error ||
    questionsResult.error ||
    answersResult.error
  ) {
    showMessage(
      $("answerMessage"),
      "探索資料載入失敗。",
      "error"
    );
    return;
  }

  planet = planetResult.data;
  allPlanets = planetsResult.data;
  questions = questionsResult.data;

  if (!planet.is_published) {
    alert("這顆星球尚未開放。");
    location.href = "levels.html";
    return;
  }

  answersResult.data.forEach((answer) => {
    answerMap.set(answer.question_id, answer);
  });

  const previousPlanets =
    allPlanets.filter(
      (item) =>
        item.planet_order < planet.planet_order
    );

  const unlocked =
    previousPlanets.every((previous) => {
      const previousQuestions =
        allQuestionsResult.data.filter(
          (question) =>
            question.level_id === previous.id
        );

      return (
        previousQuestions.length > 0 &&
        previousQuestions.every(
          (question) =>
            answerMap.has(question.id)
        )
      );
    });

  if (!unlocked) {
    alert("請先完成前面的星球。");
    location.href = "levels.html";
    return;
  }

  $("planetCode").textContent =
    `${planet.english_name} // ${planet.coordinates}`;

  $("planetName").textContent = planet.name;
  $("playerName").textContent =
    summary.display_name;

  $("playerScore").textContent =
    summary.score;

  $("shipLevel").textContent =
    `LV.${summary.ship_level}`;

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
  const navigation =
    $("questionNavigation");

  navigation.innerHTML = "";

  questions.forEach((question, index) => {
    const result =
      answerMap.get(question.id);

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "zone-nav" +
      (index === activeIndex ? " active" : "") +
      (result ? " answered" : "") +
      (result?.is_correct ? " correct" : "") +
      (result && !result.is_correct
        ? " wrong"
        : "");

    button.innerHTML = `
      <span>${index + 1}</span>
      <div>
        <strong>
          ${escapeHTML(question.zone_name)}
        </strong>
        <small>
          ${
            result
              ? result.is_correct
                ? "區域完成・+5"
                : "區域完成・+0"
              : "等待探索"
          }
        </small>
      </div>
    `;

    button.addEventListener(
      "click",
      async () => {
        activeIndex = index;
        await loadQuestion(index);
      }
    );

    navigation.appendChild(button);
  });
}

async function loadQuestion(index) {
  const question = questions[index];
  if (!question) return;

  activeIndex = index;
  renderNavigation();

  $("zoneName").textContent =
    `探索區域 ${index + 1}：${question.zone_name}`;

  $("questionTopic").textContent =
    question.topic;

  $("questionNumber").textContent =
    `${index + 1} / ${questions.length}`;

  $("questionTitle").textContent =
    question.title;

  $("questionText").textContent =
    question.question_text;

  $("hintText").textContent =
    question.hint;

  $("hintText").hidden = true;
  $("showHint").textContent =
    "啟動掃描提示";

  $("answerInput").value = "";
  $("answerInput").disabled = false;

  $("submitAnswer").disabled = false;
  $("submitAnswer").textContent =
    "正式提交";

  $("resultPanel").hidden = true;
  showMessage($("answerMessage"), "");

  $("previousQuestion").disabled =
    index === 0;

  $("nextQuestion").disabled =
    index === questions.length - 1;

  const existing =
    answerMap.get(question.id);

  if (existing) {
    await showExistingResult(question.id);
  }
}

async function showExistingResult(questionId) {
  $("answerInput").disabled = true;
  $("submitAnswer").disabled = true;
  $("submitAnswer").textContent = "已提交";

  const { data, error } =
    await window.db.rpc(
      "get_my_answer",
      {
        p_question_id: questionId
      }
    );

  if (error) {
    showMessage(
      $("answerMessage"),
      error.message,
      "error"
    );
    return;
  }

  if (data) displayResult(data);
}

function displayResult(result) {
  $("resultPanel").hidden = false;

  $("resultPanel").className =
    `result-panel ${
      result.is_correct ? "correct" : "wrong"
    }`;

  $("resultTitle").textContent =
    result.is_correct
      ? "答案驗證成功・能量增加"
      : "答案已記錄・查看分析";

  $("submittedAnswer").textContent =
    result.submitted_answer;

  $("correctAnswer").textContent =
    result.correct_answer;

  $("awardedPoints").textContent =
    `${result.points_awarded} / 5`;

  $("solutionText").innerHTML =
    result.solution;

  $("answerInput").value =
    result.submitted_answer;

  $("answerInput").disabled = true;
  $("submitAnswer").disabled = true;
  $("submitAnswer").textContent = "已提交";
}

$("submitAnswer").addEventListener(
  "click",
  () => {
    const answer =
      $("answerInput").value.trim();

    if (!answer) {
      showMessage(
        $("answerMessage"),
        "請先輸入答案。",
        "error"
      );
      return;
    }

    pendingAnswer = answer;
    $("confirmDialog").hidden = false;
  }
);

$("cancelSubmit").addEventListener(
  "click",
  () => {
    $("confirmDialog").hidden = true;
    pendingAnswer = "";
  }
);

$("confirmSubmit").addEventListener(
  "click",
  async () => {
    const question = questions[activeIndex];

    $("confirmSubmit").disabled = true;
    $("confirmSubmit").textContent =
      "傳送中...";

    const { data, error } =
      await window.db.rpc(
        "submit_answer",
        {
          p_question_id: question.id,
          p_answer: pendingAnswer
        }
      );

    $("confirmSubmit").disabled = false;
    $("confirmSubmit").textContent =
      "確定提交";

    $("confirmDialog").hidden = true;
    pendingAnswer = "";

    if (error) {
      showMessage(
        $("answerMessage"),
        error.message,
        "error"
      );
      return;
    }

    answerMap.set(question.id, {
      question_id: question.id,
      is_correct: data.is_correct,
      points_awarded: data.points_awarded
    });

    $("playerScore").textContent =
      data.total_score;

    $("shipLevel").textContent =
      `LV.${data.ship_level}`;

    displayResult(data);
    renderNavigation();

    showMessage(
      $("answerMessage"),
      data.is_correct
        ? `驗證成功！+${data.points_awarded} 分，飛船 +${data.xp_awarded} XP。`
        : `答案不正確，飛船仍獲得 ${data.xp_awarded} XP。`,
      data.is_correct ? "success" : "error"
    );

    playTone(
      data.is_correct ? 780 : 220,
      0.16,
      data.is_correct ? "square" : "sawtooth"
    );

    if (data.planet_completed) {
      showPlanetClear(data);
    }
  }
);

function showPlanetClear(data) {
  $("clearPlanetName").textContent =
    `${data.planet_name}探索完成！`;

  $("clearScore").textContent =
    `${data.planet_score} / ${
      questions.reduce(
        (sum, question) =>
          sum + Number(question.points),
        0
      )
    }`;

  $("clearLevel").textContent =
    `LV.${data.ship_level}`;

  const currentIndex =
    allPlanets.findIndex(
      (item) => item.id === planet.id
    );

  const nextPlanet =
    allPlanets[currentIndex + 1];

  const nextButton =
    $("goNextPlanet");

  if (nextPlanet) {
    nextButton.textContent =
      `前往 ${nextPlanet.name}`;

    nextButton.onclick = () => {
      location.href =
        `practice.html?level=${nextPlanet.id}`;
    };
  } else {
    nextButton.textContent =
      "查看探索者排行榜";

    nextButton.onclick = () => {
      location.href = "leaderboard.html";
    };
  }

  setTimeout(() => {
    $("planetClearModal").hidden = false;
    playTone(880, 0.3, "square");
  }, 500);
}

$("showHint").addEventListener(
  "click",
  () => {
    $("hintText").hidden =
      !$("hintText").hidden;

    $("showHint").textContent =
      $("hintText").hidden
        ? "啟動掃描提示"
        : "關閉掃描提示";
  }
);

$("previousQuestion").addEventListener(
  "click",
  async () => {
    if (activeIndex <= 0) return;
    await loadQuestion(--activeIndex);
  }
);

$("nextQuestion").addEventListener(
  "click",
  async () => {
    if (
      activeIndex >= questions.length - 1
    ) return;

    await loadQuestion(++activeIndex);
  }
);

$("answerInput").addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Enter" &&
      !$("submitAnswer").disabled
    ) {
      $("submitAnswer").click();
    }
  }
);

initialisePractice();
