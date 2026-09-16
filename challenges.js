const celebration =
  document.getElementById("celebration");

const baseCheckAnswer =
  document.getElementById("checkAnswer");

function updateChallengeProgress() {
  const count = done.size;
  const cleared = count === questions.length;
  const score = count * 5;

  const headerProgress =
    document.getElementById("headerProgress");

  const streak =
    document.getElementById("streak");

  const levelOneLine =
    document.getElementById("levelOneLine");

  const scoreElement =
    document.getElementById("score");

  if (headerProgress) {
    headerProgress.textContent =
      `${count} / ${questions.length}`;
  }

  if (streak) {
    streak.textContent = cleared ? "1" : "0";
  }

  if (levelOneLine) {
    levelOneLine.style.width =
      `${(count / questions.length) * 100}%`;
  }

  if (scoreElement) {
    scoreElement.textContent = score;
  }

  const topicCount =
    document.querySelector(
      ".current-level .topic-count"
    );

  if (topicCount && cleared) {
    topicCount.textContent = "✓ 已完成";
  }
}

function showCelebration() {
  const lastQuestion =
    done.size === questions.length;

  const title =
    document.getElementById("celebrationTitle");

  const text =
    document.getElementById("celebrationText");

  const nextButton =
    document.getElementById("celebrationNext");

  if (title) {
    title.textContent = lastQuestion
      ? "第一關完成！"
      : "太厲害了！";
  }

  if (text) {
    text.textContent = lastQuestion
      ? "你成功完成 5 題挑戰，代數起步關卡已通關！"
      : "你又攻下一題，繼續保持這個節奏。";
  }

  if (nextButton) {
    nextButton.textContent = lastQuestion
      ? "查看關卡地圖 →"
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
    const question = questions[active];

    const answerInput =
      document.getElementById("answer");

    const value = clean(answerInput.value);

    const valid = [
      question.answer,
      ...(question.accepted || [])
    ]
      .map(clean)
      .includes(value);

    const feedback =
      document.getElementById("feedback");

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

    const isNew = !done.has(active);

    done.add(active);

    feedback.textContent = isNew
      ? "答對了！+5 分"
      : "這一題已經完成，不會重複加分。";

    feedback.className =
      "feedback correct";

    renderList();
    updateChallengeProgress();

    if (isNew) {
      showCelebration();
    }
  };
}

const celebrationNext =
  document.getElementById("celebrationNext");

if (celebrationNext) {
  celebrationNext.onclick = () => {
    const cleared =
      done.size === questions.length;

    if (celebration) {
      celebration.classList.remove("visible");
      celebration.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    if (cleared) {
      location.hash = "topics";
      return;
    }

    const next =
      questions.findIndex(
        (_, index) => !done.has(index)
      );

    if (next >= 0) {
      load(next);

      const answerInput =
        document.getElementById("answer");

      if (answerInput) {
        answerInput.focus();
      }
    }
  };
}

updateChallengeProgress();

