const SUPABASE_URL = "https://zlafcarhdhtugcmeaqzv.supabase.co";
const SUPABASE_KEY = "sb_publishable_你的key";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// 下面接 questions、遊戲程式……

async function loadLeaderboard() {
  const leaderboardBody =
    document.getElementById("leaderboard-body");

  if (!leaderboardBody) return;

  const { data, error } = await supabaseClient
    .from("leaderboard")
    .select("username, score, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(20);

  if (error) {
    console.error("讀取排行榜失敗：", error);

    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="3">排行榜讀取失敗：${error.message}</td>
      </tr>
    `;
    return;
  }

  if (!data || data.length === 0) {
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="3">目前還沒有分數</td>
      </tr>
    `;
    return;
  }

  leaderboardBody.innerHTML = "";

  data.forEach((player, index) => {
    leaderboardBody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${player.username}</td>
        <td>${player.score}</td>
      </tr>
    `;
  });
}

loadLeaderboard();

