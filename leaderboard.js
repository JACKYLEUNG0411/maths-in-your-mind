async function loadLeaderboard() {
  const user = await requireLogin();
  if (!user) return;

  const summary = await getMySummary();

  document.getElementById(
    "myName"
  ).textContent = summary.display_name;

  document.getElementById(
    "myShip"
  ).textContent = summary.ship_name;

  document.getElementById(
    "myModel"
  ).textContent =
    `LV.${summary.ship_level} ${summary.ship_model}`;

  document.getElementById(
    "myScore"
  ).textContent = summary.score;

  const body =
    document.getElementById("rankingBody");

  body.innerHTML = `
    <tr>
      <td colspan="6">
        正在更新星際排名……
      </td>
    </tr>
  `;

  const { data, error } =
    await window.db.rpc("get_leaderboard");

  if (error) {
    body.innerHTML = `
      <tr>
        <td colspan="6">
          ${escapeHTML(error.message)}
        </td>
      </tr>
    `;
    return;
  }

  body.innerHTML = "";

  data.forEach((player) => {
    const row =
      document.createElement("tr");

    if (player.rank <= 3) {
      row.classList.add(
        `top-rank-${player.rank}`
      );
    }

    const rank =
      player.rank === 1
        ? "🥇 1st"
        : player.rank === 2
          ? "🥈 2nd"
          : player.rank === 3
            ? "🥉 3rd"
            : `#${player.rank}`;

    row.innerHTML = `
      <td class="rank-cell">${rank}</td>
      <td>${escapeHTML(player.display_name)}</td>
      <td>${escapeHTML(player.ship_name)}</td>
      <td>
        LV.${player.ship_level}
        ${escapeHTML(player.ship_model)}
      </td>
      <td class="score-cell">${player.score}</td>
      <td>${player.correct}</td>
    `;

    body.appendChild(row);
  });
}

document
  .getElementById("refreshRanking")
  .addEventListener("click", loadLeaderboard);

loadLeaderboard();
