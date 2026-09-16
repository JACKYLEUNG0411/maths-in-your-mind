async function loadLevelsPage() {
  const user = await requireLogin();

  if (!user) return;

  const [
    levelsResponse,
    questionsResponse,
    answersResponse,
    summary
  ] = await Promise.all([
    window.db
      .from("levels")
      .select("*")
      .order("id"),

    window.db
      .from("questions")
      .select("id, level_id, question_order")
      .order("level_id")
      .order("question_order"),

    window.db
      .from("answers")
      .select(
        "question_id, is_correct, points_awarded"
      ),

    getMySummary()
  ]);

  if (
    levelsResponse.error ||
    questionsResponse.error ||
    answersResponse.error
  ) {
    console.error(
      levelsResponse.error,
      questionsResponse.error,
      answersResponse.error
    );

    document.getElementById(
      "levelGrid"
    ).innerHTML = `
      <div class="message error">
        任務資料載入失敗，請重新整理。
      </div>
    `;

    return;
  }

  const levels = levelsResponse.data;
  const questions = questionsResponse.data;
  const answers = answersResponse.data;

  const answeredIds =
    new Set(
      answers.map(
        (answer) => answer.question_id
      )
    );

  document.getElementById(
    "playerName"
  ).textContent =
    summary?.display_name || "探索者";

  document.getElementById(
    "playerScore"
  ).textContent =
    summary?.score || 0;

  document.getElementById(
    "totalProgress"
  ).textContent =
    `${answers.length} / ${questions.length}`;

  const levelGrid =
    document.getElementById("levelGrid");

  levelGrid.innerHTML = "";

  levels.forEach((level) => {
    const levelQuestions =
      questions.filter(
        (question) =>
          question.level_id === level.id
      );

    const completed =
      levelQuestions.filter(
        (question) =>
          answeredIds.has(question.id)
      ).length;

    const previousQuestions =
      questions.filter(
        (question) =>
          question.level_id < level.id
      );

    const unlocked =
      level.id === 1 ||
      previousQuestions.every(
        (question) =>
          answeredIds.has(question.id)
      );

    const finished =
      levelQuestions.length > 0 &&
      completed === levelQuestions.length;

    const progress =
      levelQuestions.length
        ? completed / levelQuestions.length * 100
        : 0;

    const card =
      document.createElement("article");

    card.className =
      `mission-card color-${level.color}` +
      (!unlocked ? " locked" : "") +
      (finished ? " completed" : "");

    let statusText = "任務執行中";

    if (!unlocked) {
      statusText = "能量鎖定";
    } else if (finished) {
      statusText = "任務完成";
    } else if (completed === 0) {
      statusText = "可以開始";
    }

    card.innerHTML = `
      <div class="mission-top">
        <span>
          MISSION ${String(level.id).padStart(2, "0")}
        </span>
        <strong>${statusText}</strong>
      </div>

      <div class="mission-icon">
        ${unlocked ? level.id : "⌁"}
      </div>

      <h3>${escapeHTML(level.name)}</h3>

      <p>${escapeHTML(level.description)}</p>

      <div class="mission-progress">
        <div>
          <span>任務進度</span>
          <strong>
            ${completed} / ${levelQuestions.length}
          </strong>
        </div>

        <div class="progress-track">
          <i style="width:${progress}%"></i>
        </div>
      </div>

      ${
        unlocked
          ? `
            <a
              class="button primary full"
              href="practice.html?level=${level.id}"
            >
              ${
                finished
                  ? "查看任務紀錄"
                  : completed > 0
                    ? "繼續任務"
                    : "開始任務"
              }
            </a>
          `
          : `
            <button
              class="button secondary full"
              type="button"
              disabled
            >
              完成上一關後解鎖
            </button>
          `
      }
    `;

    levelGrid.appendChild(card);
  });
}

loadLevelsPage();

