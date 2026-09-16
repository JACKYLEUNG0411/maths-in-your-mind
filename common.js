async function getCurrentUser() {
  const {
    data: { session }
  } = await window.db.auth.getSession();

  return session?.user || null;
}

async function requireLogin() {
  const user = await getCurrentUser();

  if (user) return user;

  const current =
    location.pathname.split("/").pop() ||
    "levels.html";

  const safePage =
    current.startsWith("practice.html")
      ? `${current}${location.search}`
      : current;

  location.href =
    `login.html?next=${encodeURIComponent(safePage)}`;

  return null;
}

async function getMySummary() {
  const { data, error } =
    await window.db.rpc("get_my_summary");

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showMessage(element, message, type = "") {
  if (!element) return;

  element.textContent = message;
  element.className =
    `message ${type}`.trim();
}

function createShipHTML(summary = {}, small = false) {
  const level =
    Number(summary.ship_level || 1);

  const color =
    /^#[0-9a-f]{6}$/i.test(
      summary.primary_color || ""
    )
      ? summary.primary_color
      : "#35f2d0";

  const engine =
    /^#[0-9a-f]{6}$/i.test(
      summary.engine_color || ""
    )
      ? summary.engine_color
      : "#9b5cff";

  return `
    <div
      class="player-ship level-${level}
      ${small ? "ship-small" : ""}"
      style="
        --ship-color:${color};
        --engine-color:${engine};
      "
      aria-label="玩家宇宙飛船"
    >
      <div class="ship-flame"></div>
      <div class="ship-wing wing-left"></div>
      <div class="ship-wing wing-right"></div>
      <div class="ship-body">
        <div class="ship-window"></div>
        <div class="ship-core"></div>
      </div>
      ${level >= 2 ? '<div class="ship-fin"></div>' : ""}
      ${level >= 3 ? '<div class="ship-cannon cannon-left"></div><div class="ship-cannon cannon-right"></div>' : ""}
      ${level >= 4 ? '<div class="ship-energy-ring"></div>' : ""}
    </div>
  `;
}

/* 音效設定 */

let soundEnabled =
  localStorage.getItem("mathSound") === "on";

function updateSoundButtons() {
  document
    .querySelectorAll("[data-sound-toggle]")
    .forEach((button) => {
      button.textContent =
        soundEnabled ? "🔊" : "🔇";

      button.title =
        soundEnabled ? "關閉音效" : "開啟音效";

      button.setAttribute(
        "aria-label",
        button.title
      );
    });
}

function playTone(
  frequency = 440,
  duration = 0.08,
  type = "sine"
) {
  if (!soundEnabled) return;

  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContext) return;

  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(
    0.05,
    context.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    context.currentTime + duration
  );

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();
  oscillator.stop(
    context.currentTime + duration
  );
}

document.addEventListener("click", async (event) => {
  const soundButton =
    event.target.closest("[data-sound-toggle]");

  if (soundButton) {
    soundEnabled = !soundEnabled;

    localStorage.setItem(
      "mathSound",
      soundEnabled ? "on" : "off"
    );

    updateSoundButtons();

    if (soundEnabled) {
      playTone(620, 0.12, "square");
    }

    return;
  }

  const logoutButton =
    event.target.closest("[data-logout]");

  if (!logoutButton) return;

  logoutButton.disabled = true;

  await window.db.auth.signOut();

  location.href = "login.html";
});

document.addEventListener(
  "DOMContentLoaded",
  updateSoundButtons
);
