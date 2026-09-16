const celebration = document.getElementById('celebration');
const baseCheckAnswer = document.getElementById('checkAnswer');

function updateChallengeProgress() {
  const count = done.size;
  const cleared = count === questions.length;
  document.getElementById('headerProgress').textContent = `${count} / 5`;
  document.getElementById('streak').textContent = cleared ? '1' : '0';
  document.getElementById('levelOneLine').style.width = `${(count / questions.length) * 100}%`;
  if (cleared) {
    document.querySelector('.current-level .topic-count').textContent = '✓ 已完成';
  }
}

function showCelebration() {
  const lastQuestion = done.size === questions.length;
  document.getElementById('celebrationTitle').textContent = lastQuestion ? '第一關完成！' : '太厲害了！';
  document.getElementById('celebrationText').textContent = lastQuestion ? '你成功完成 5 題挑戰，代數起步關卡已通關！' : '你又攻下一題，繼續保持這個節奏。';
  document.getElementById('celebrationNext').textContent = lastQuestion ? '查看關卡地圖 →' : '挑戰下一題 →';
  celebration.classList.add('visible');
  celebration.setAttribute('aria-hidden', 'false');
}

baseCheckAnswer.onclick = () => {
  const q = questions[active];
  const value = clean(document.getElementById('answer').value);
  const valid = [q.answer, ...(q.accepted || [])].map(clean).includes(value);
  const feedback = document.getElementById('feedback');
  if (!value) {
    feedback.textContent = '先輸入你的答案吧。';
    feedback.className = 'feedback wrong';
    return;
  }
  if (!valid) {
    feedback.textContent = '差一點點，再看看提示，慢慢來。';
    feedback.className = 'feedback wrong';
    return;
  }
  const isNew = !done.has(active);
  done.add(active);
  feedback.textContent = '答對了！';
  feedback.className = 'feedback correct';
  renderList();
  updateChallengeProgress();
  if (isNew) showCelebration();
};

document.getElementById('celebrationNext').onclick = () => {
  const cleared = done.size === questions.length;
  celebration.classList.remove('visible');
  celebration.setAttribute('aria-hidden', 'true');
  if (cleared) { location.hash = 'topics'; return; }
  const next = questions.findIndex((_, index) => !done.has(index));
  load(next);
  document.getElementById('answer').focus();
};

updateChallengeProgress();
