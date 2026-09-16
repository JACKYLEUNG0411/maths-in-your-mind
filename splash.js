const splash =
  document.getElementById("splashScreen");

const skipButton =
  document.getElementById("skipIntro");

const enterButton =
  document.getElementById("enterUniverse");

const loadingBar =
  document.getElementById("loadingBar");

const loadingText =
  document.getElementById("loadingText");

const loadingPercent =
  document.getElementById("loadingPercent");

const reducedMotion =
  window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

const hasSeenSplash =
  sessionStorage.getItem("hasSeenSplash");

const messages = [
  [12, "SYSTEM BOOTING..."],
  [30, "MATH CORE ONLINE"],
  [52, "LOADING GALAXY DATA..."],
  [74, "CALIBRATING STAR ROUTES..."],
  [91, "SHIP NETWORK CONNECTED"],
  [100, "UNIVERSE READY"]
];

let progress = 0;
let loadingTimer;

function updateLoadingMessage(value) {
  const item =
    [...messages]
      .reverse()
      .find(([point]) => value >= point);

  if (item) {
    loadingText.textContent = item[1];
  }
}

function finishLoading() {
  clearInterval(loadingTimer);

  progress = 100;
  loadingBar.style.width = "100%";
  loadingPercent.textContent = "100%";
  loadingText.textContent = "UNIVERSE READY";

  enterButton.hidden = false;
  splash.classList.add("ready");
}

function closeSplash() {
  sessionStorage.setItem(
    "hasSeenSplash",
    "true"
  );

  splash.classList.add("splash-exit");

  setTimeout(() => {
    splash.remove();
  }, reducedMotion ? 20 : 850);
}

if (hasSeenSplash || reducedMotion) {
  progress = 100;
  loadingBar.style.width = "100%";
  loadingPercent.textContent = "100%";
  loadingText.textContent = "UNIVERSE READY";
  enterButton.hidden = false;
  splash.classList.add("quick-intro", "ready");
} else {
  loadingTimer = setInterval(() => {
    progress += Math.ceil(Math.random() * 5);

    if (progress >= 100) {
      finishLoading();
      return;
    }

    loadingBar.style.width = `${progress}%`;
    loadingPercent.textContent = `${progress}%`;

    updateLoadingMessage(progress);
  }, 90);
}

skipButton.addEventListener("click", closeSplash);
enterButton.addEventListener("click", closeSplash);

document.addEventListener("keydown", (event) => {
  if (
    !enterButton.hidden &&
    (event.key === "Enter" ||
      event.key === " ")
  ) {
    closeSplash();
  }
});

