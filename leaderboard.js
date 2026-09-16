async function loadLeaderboardPage() {
  const user = await requireLogin();

  if (!user) return;

  const summary = await getMySummary();

  document.getElementById(
    "myName"
  ).textContent =
    summary?.display_name || "探索者";

  document.getElementById(
    "myScore"
  ).textContent =
    summary?.score || 0;

  document.getElementById(
    "myAnswered"
  ).textContent =
    summary?.answered || 0;

  document.getElementById(
    "myCorrect"
  ).textContent =
    summary?.correct || 0;

  const rankingBody =
    document.getElementById("rankingBody");

  rankingBody.innerHTML = `
    <tr>
      <td colspan="5">
        正在更新星際排名...
      </td>
    </tr>
  `;

  const { data, error } =
    await window.db.rpc("get_leaderboard");

  if (error) {
    console.error(error);

    rankingBody.innerHTML = `
      <tr>
        <td colspan="5">
          排行榜載入失敗：${escapeHTML(error.message)}
        </td>
      </tr>
    `;

    return;
  }

  if (!data || data.length === 0) {
    rankingBody.innerHTML = `
      <tr>
        <td colspan="5">
          目前還沒有作答紀錄。
        </td>
      </tr>
    `;

    return;
  }

  rankingBody.innerHTML = "";

  data.forEach((player) => {
    const row =
      document.createElement("tr");

    let rankIcon = player.rank;

    if (player.rank === 1) {
      rankIcon = "🥇";
    } else if (player.rank === 2) {
      rankIcon = "🥈";
    } else if (player.rank === 3) {
      rankIcon = "🥉";
    }

    row.innerHTML = `
      <td class="rank-cell">
        ${rankIcon}
      </td>

      <td>
        ${escapeHTML(player.display_name)}
      </td>

      <td class="score-cell">
        ${player.score}
      </td>

      <td>
        ${player.answered}
      </td>

      <td>
        ${player.correct}
      </td>
    `;

    rankingBody.appendChild(row);
  });
}

document
  .getElementById("refreshRanking")
  .addEventListener("click", () => {
    loadLeaderboardPage();
  });

loadLeaderboardPage();

