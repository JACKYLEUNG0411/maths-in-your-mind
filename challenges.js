const celebration =
  document.getElementById("celebration");

const baseCheckAnswer =
  document.getElementById("checkAnswer");

function updateChallengeProgress() {
  const question =
    questions[active];

  const levelId =
    question.level;

  const levelIndexes =
    getLevelQuestionIndexes(levelId);

  const levelDone =
    levelIndexes.filter((index) =>
      done.has(index)
    ).length;

  const levelCleared =
    levelDone === 5;

  const allCleared =
    done.size === questions.length;

  if (document.getElementById("headerProgress")) {
    document.getElementById(
      "headerProgress"
    ).textContent =
      `${levelDone} / 5`;
  }

  if (document.getElementById("streak")) {
    document.getElementById("streak").textContent =
      allCleared ? "1" : "0";
  }

  if (document.getElementById("levelOneLine")) {
    document.getElementById(
      "levelOneLine"
    ).style.width =
      `${(levelDone / 5) * 100}%`;
  }

  if (document.getElementById("score")) {
    document.getElementById("score").textContent =
      done.size * 5;
  }

  const topicCount =
    document.querySelector(
      ".current-level .topic-count"
    );

  if (topicCount) {
    topicCount.textContent =
      levelCleared
        ? "✓ 已完成"
        : "5 題挑戰";
  }
}


function showCelebration() {
  const question =
    questions[active];

  const levelId =
    question.level;

  const levelIndexes =
    getLevelQuestionIndexes(levelId);

  const levelCleared =
    levelIndexes.every((index) =>
      done.has(index)
    );

  const allCleared =
    done.size === questions.length;

  const title =
    document.getElementById(
      "celebrationTitle"
    );

  const text =
    document.getElementById(
      "celebrationText"
    );

  const nextButton =
    document.getElementById(
      "celebrationNext"
    );

  if (title) {
    title.textContent =
      allCleared
        ? "全部關卡完成！"
        : levelCleared
          ? `第 ${levelId} 關完成！`
          : "答對了！";
  }

  if (text) {
    text.textContent =
      allCleared
        ? "你成功完成全部 20 題挑戰！"
        : levelCleared
          ? `你已完成「${questions[active].levelName}」，下一關已解鎖！`
          : "你又攻下一題，繼續保持這個節奏。";
  }

  if (nextButton) {
    nextButton.textContent =
      allCleared
        ? "查看排行榜 →"
        : levelCleared
          ? "挑戰下一關 →"
          : "挑戰下一題 →";
  }

  if (celebration) {
    celebration.classList.add("visible");
    celebration.setAttribute(
      "aria-hidden",
      "false"
    );
  }
}


if (baseCheckAnswer) {
  baseCheckAnswer.onclick = () => {
    const question =
      questions[active];

    const answerElement =
      document.getElementById("answer");

    const feedback =
      document.getElementById("feedback");

    const value =
      clean(answerElement.value);

    const validAnswers = [
      question.answer,
      ...(question.accepted || [])
    ];

    const valid =
      validAnswers
        .map(clean)
        .includes(value);

    if (!value) {
      feedback.textContent =
        "先輸入你的答案吧。";

      feedback.className =
        "feedback wrong";

      return;
    }

    if (!valid) {
      feedback.textContent =
        "差一點點，再看看提示，慢慢來。";

      feedback.className =
        "feedback wrong";

      return;
    }

    const isNew =
      !done.has(active);

    done.add(active);

    feedback.textContent =
      isNew
        ? "答對了！+5 分"
        : "這一題已經完成。";

    feedback.className =
      "feedback correct";

    renderList();
    updateProgress();
    updateChallengeProgress();

    if (isNew) {
      showCelebration();
    }
  };
}


const celebrationNext =
  document.getElementById(
    "celebrationNext"
  );

if (celebrationNext) {
  celebrationNext.onclick = () => {
    const currentQuestion =
      questions[active];

    const currentLevel =
      currentQuestion.level;

    const currentLevelIndexes =
      getLevelQuestionIndexes(currentLevel);

    const currentLevelDone =
      currentLevelIndexes.every((index) =>
        done.has(index)
      );

    const allCleared =
      done.size === questions.length;

    celebration.classList.remove(
      "visible"
    );

    celebration.setAttribute(
      "aria-hidden",
      "true"
    );

    if (allCleared) {
      location.hash = "leaderboard";
      return;
    }

    if (currentLevelDone) {
      const nextLevel =
        levels.find(
          (level) =>
            level.id === currentLevel + 1
        );

      if (nextLevel) {
        load(
          getLevelStart(nextLevel.id)
        );

        document
          .getElementById("answer")
          ?.focus();

        return;
      }
    }

    const nextQuestion =
      currentLevelIndexes.find(
        (index) => !done.has(index)
      );

    if (nextQuestion !== undefined) {
      load(nextQuestion);

      document
        .getElementById("answer")
        ?.focus();
    }
  };
}


updateChallengeProgress();
