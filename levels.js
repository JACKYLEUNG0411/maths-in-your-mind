async function loadGalaxy() {
  const user = await requireLogin();
  if (!user) return;

  const [
    planetsResult,
    questionsResult,
    answersResult,
    summary
  ] = await Promise.all([
    window.db
      .from("levels")
      .select("*")
      .order("planet_order"),

    window.db
      .from("questions")
      .select(
        "id, level_id, question_order"
      )
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
    planetsResult.error ||
    questionsResult.error ||
    answersResult.error ||
    !summary
  ) {
    document.getElementById(
      "galaxyMap"
    ).innerHTML = `
      <p class="message error">
        銀河資料載入失敗，請重新整理。
      </p>
    `;
    return;
  }

  const planets = planetsResult.data;
  const questions = questionsResult.data;
  const answers = answersResult.data;

  const answerMap = new Map(
    answers.map((answer) => [
      answer.question_id,
      answer
    ])
  );

  document.getElementById(
    "playerName"
  ).textContent = summary.display_name;

  document.getElementById(
    "playerScore"
  ).textContent = summary.score;

  document.getElementById(
    "planetProgress"
  ).textContent =
    `${summary.completed_planets} / ${summary.total_planets}`;

  document.getElementById(
    "questionProgress"
  ).textContent =
    `${summary.answered} / ${summary.total_questions}`;

  renderShip(summary);
  renderGalaxy(
    planets,
    questions,
    answerMap,
    summary
  );
}

function renderShip(summary) {
  document.getElementById(
    "shipVisual"
  ).innerHTML = createShipHTML(summary);

  document.getElementById(
    "shipName"
  ).textContent = summary.ship_name;

  document.getElementById(
    "shipNameInput"
  ).value = summary.ship_name;

  document.getElementById(
    "shipModel"
  ).textContent = summary.ship_model;

  document.getElementById(
    "shipLevel"
  ).textContent = `LV.${summary.ship_level}`;

  document.getElementById(
    "shipXP"
  ).textContent = `${summary.experience} XP`;

  const nextXP =
    Number(summary.next_level_xp || 100);

  const percent =
    summary.experience >= nextXP
      ? 100
      : Math.min(
          100,
          summary.experience / nextXP * 100
        );

  document.getElementById(
    "xpBar"
  ).style.width = `${percent}%`;

  document.getElementById(
    "nextXP"
  ).textContent =
    summary.ship_level >= 6
      ? "飛船已達目前最高進化階段"
      : `下一次進化需要 ${nextXP} XP`;
}

function renderGalaxy(
  planets,
  questions,
  answerMap,
  summary
) {
  const map =
    document.getElementById("galaxyMap");

  map.innerHTML = "";

  const publishedPlanets =
    planets.filter(
      (planet) => planet.is_published
    );

  let currentPlanet = null;

  planets.forEach((planet, index) => {
    const planetQuestions =
      questions.filter(
        (question) =>
          question.level_id === planet.id
      );

    const completed =
      planetQuestions.filter(
        (question) =>
          answerMap.has(question.id)
      ).length;

    const score =
      planetQuestions.reduce(
        (total, question) =>
          total +
          Number(
            answerMap.get(question.id)
              ?.points_awarded || 0
          ),
        0
      );

    const previousPublished =
      publishedPlanets.filter(
        (item) =>
          item.planet_order <
          planet.planet_order
      );

    const unlocked =
      planet.is_published &&
      previousPublished.every(
        (previousPlanet) => {
          const previousQuestions =
            questions.filter(
              (question) =>
                question.level_id ===
                previousPlanet.id
            );

          return (
            previousQuestions.length > 0 &&
            previousQuestions.every(
              (question) =>
                answerMap.has(question.id)
            )
          );
        }
      );

    const finished =
      planet.is_published &&
      planetQuestions.length > 0 &&
      completed === planetQuestions.length;

    if (
      !currentPlanet &&
      planet.is_published &&
      unlocked &&
      !finished
    ) {
      currentPlanet = planet;
    }

    const state =
      !planet.is_published
        ? "coming"
        : finished
          ? "completed"
          : unlocked
            ? "active"
            : "locked";

    const routeItem =
      document.createElement("article");

    routeItem.className =
      `galaxy-route-item route-${index % 2 ? "right" : "left"} ${state}`;

    const statusText = {
      coming: "COMING SOON",
      completed: "PLANET CLEARED",
      active: completed
        ? "EXPLORATION ACTIVE"
        : "READY TO EXPLORE",
      locked: "ROUTE LOCKED"
    }[state];

    const button =
      state === "completed"
        ? `
          <a
            class="game-button lime small"
            href="practice.html?level=${planet.id}"
          >
            查看探索紀錄
          </a>
        `
        : state === "active"
          ? `
            <a
              class="game-button cyan small"
              href="practice.html?level=${planet.id}"
            >
              ${completed ? "繼續探索" : "登陸星球"}
            </a>
          `
          : `
            <button
              class="game-button disabled small"
              disabled
            >
              ${
                state === "coming"
                  ? "航線建造中"
                  : "完成前置星球"
              }
            </button>
          `;

    routeItem.innerHTML = `
      <div class="route-line ${state}"></div>

      <div class="planet-system">
        ${
          state === "active" &&
          currentPlanet?.id === planet.id
            ? `
              <div class="map-player-ship">
                ${createShipHTML(summary, true)}
              </div>
            `
            : ""
        }

        <div
          class="planet-sphere planet-${escapeHTML(
            planet.planet_style
          )}"
        >
          <div class="planet-surface"></div>
          <div class="planet-orbit"></div>
          ${
            state === "locked"
              ? '<span class="planet-lock">🔒</span>'
              : ""
          }
          ${
            state === "coming"
              ? '<span class="planet-lock">?</span>'
              : ""
          }
          ${
            state === "completed"
              ? '<span class="planet-complete">✓</span>'
              : ""
          }
        </div>

        <div class="planet-card">
          <p class="planet-code">
            ${escapeHTML(planet.english_name)}
            // ${escapeHTML(planet.coordinates)}
          </p>

          <span class="planet-status">
            ${statusText}
          </span>

          <h3>${escapeHTML(planet.name)}</h3>

          <p>${escapeHTML(planet.description)}</p>

          <div class="planet-stats">
            <div>
              <span>探索區域</span>
              <strong>
                ${completed} /
                ${planetQuestions.length || 5}
              </strong>
            </div>

            <div>
              <span>星球能量</span>
              <strong>
                ${score} /
                ${
                  planetQuestions.reduce(
                    (sum, question) =>
                      sum + 5,
                    0
                  ) || 25
                }
              </strong>
            </div>
          </div>

          <div class="progress-track">
            <i style="width:${
              planetQuestions.length
                ? completed /
                  planetQuestions.length *
                  100
                : 0
            }%"></i>
          </div>

          ${button}
        </div>
      </div>
    `;

    map.appendChild(routeItem);
  });

  const objective =
    currentPlanet ||
    publishedPlanets[
      publishedPlanets.length - 1
    ];

  if (currentPlanet) {
    document.getElementById(
      "currentObjective"
    ).textContent =
      `目前目標：探索 ${currentPlanet.name}`;

    document.getElementById(
      "novaMessage"
    ).textContent =
      `導航已鎖定 ${currentPlanet.english_name}。完成 5 個區域即可開啟下一條航線。`;
  } else {
    document.getElementById(
      "currentObjective"
    ).textContent =
      "所有目前開放星球已完成！";

    document.getElementById(
      "novaMessage"
    ).textContent =
      "出色的探索成果。新的數學星區正在建造中。";
  }
}

document
  .getElementById("renameShip")
  .addEventListener("click", async () => {
    const input =
      document.getElementById(
        "shipNameInput"
      );

    const message =
      document.getElementById(
        "shipMessage"
      );

    const shipName =
      input.value.trim();

    if (!shipName) {
      showMessage(
        message,
        "請輸入飛船名稱。",
        "error"
      );
      return;
    }

    const { data, error } =
      await window.db.rpc(
        "rename_my_ship",
        {
          p_ship_name: shipName
        }
      );

    if (error) {
      showMessage(
        message,
        error.message,
        "error"
      );
      return;
    }

    document.getElementById(
      "shipName"
    ).textContent = data.ship_name;

    showMessage(
      message,
      "飛船名稱已更新。",
      "success"
    );

    playTone(650, 0.12, "square");
  });

loadGalaxy();
