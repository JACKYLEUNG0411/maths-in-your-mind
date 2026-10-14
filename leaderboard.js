async function loadLeaderboard() {
  const user = await requireLogin();
  if (!user) return;

  const refreshButton =
    document.getElementById("refreshRanking");

  if (refreshButton) {
    refreshButton.disabled = true;
    refreshButton.textContent = "更新中...";
  }

  const summary = await getMySummary();

  if (!summary) {
    const body =
      document.getElementById("rankingBody");

    body.innerHTML = `
      <tr>
        <td colspan="6">
          無法讀取個人資料，請稍後重試。
        </td>
      </tr>
    `;

    if (refreshButton) {
      refreshButton.disabled = false;
      refreshButton.textContent = "更新排名";
    }
    return;
  }

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

  try {
    const { data, error } = await withRetry(
      () => window.db.rpc("get_leaderboard"),
      { retries: 1 }
    );

    if (error) {
      throw error;
    }

    body.innerHTML = "";

    (data || []).forEach((player) => {
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

    if (!data?.length) {
      body.innerHTML = `
        <tr>
          <td colspan="6">
            暫時沒有排行榜資料。
          </td>
        </tr>
      `;
    }
  } catch (error) {
    console.error(error);
    body.innerHTML = `
      <tr>
        <td colspan="6">
          ${escapeHTML(
            getFriendlyErrorMessage(
              error,
              "排行榜暫時無法載入，請稍後再試。"
            )
          )}
        </td>
      </tr>
    `;
  } finally {
    if (refreshButton) {
      refreshButton.disabled = false;
      refreshButton.textContent = "更新排名";
    }
  }
}

document
  .getElementById("refreshRanking")
  .addEventListener("click", loadLeaderboard);

loadLeaderboard();
