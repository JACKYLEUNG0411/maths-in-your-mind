const loginForm =
  document.getElementById("loginForm");

const registerForm =
  document.getElementById("registerForm");

const showLogin =
  document.getElementById("showLogin");

const showRegister =
  document.getElementById("showRegister");

const authMessage =
  document.getElementById("authMessage");

function switchMode(mode) {
  const loginMode = mode === "login";

  loginForm.hidden = !loginMode;
  registerForm.hidden = loginMode;

  showLogin.classList.toggle(
    "active",
    loginMode
  );

  showRegister.classList.toggle(
    "active",
    !loginMode
  );

  showMessage(authMessage, "");
}

showLogin.addEventListener("click", () => {
  switchMode("login");
});

showRegister.addEventListener("click", () => {
  switchMode("register");
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button =
    loginForm.querySelector("button[type='submit']");

  button.disabled = true;
  button.textContent = "身份驗證中...";

  const { error } =
    await window.db.auth.signInWithPassword({
      email:
        document
          .getElementById("loginEmail")
          .value.trim(),

      password:
        document
          .getElementById("loginPassword")
          .value
    });

  button.disabled = false;
  button.textContent = "登上探索飛船";

  if (error) {
    showMessage(
      authMessage,
      error.message.includes("Invalid login")
        ? "電郵或密碼不正確。"
        : error.message,
      "error"
    );

    return;
  }

  playTone(720, 0.15, "square");

  const parameters =
    new URLSearchParams(location.search);

  const requested =
    parameters.get("next") || "levels.html";

  const allowed =
    /^(levels|practice|leaderboard)\.html(\?.*)?$/.test(
      requested
    );

  location.href =
    allowed ? requested : "levels.html";
});

registerForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const displayName =
      document
        .getElementById("displayName")
        .value.trim();

    const email =
      document
        .getElementById("registerEmail")
        .value.trim();

    const password =
      document
        .getElementById("registerPassword")
        .value;

    const confirmation =
      document
        .getElementById("confirmPassword")
        .value;

    if (!displayName) {
      showMessage(
        authMessage,
        "請輸入探索者名稱。",
        "error"
      );
      return;
    }

    if (password.length < 6) {
      showMessage(
        authMessage,
        "密碼最少需要 6 個字元。",
        "error"
      );
      return;
    }

    if (password !== confirmation) {
      showMessage(
        authMessage,
        "兩次輸入的密碼不相同。",
        "error"
      );
      return;
    }

    const button =
      registerForm.querySelector(
        "button[type='submit']"
      );

    button.disabled = true;
    button.textContent = "正在建造飛船...";

    const { data, error } =
      await window.db.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      });

    button.disabled = false;
    button.textContent =
      "建立探索者與飛船";

    if (error) {
      showMessage(
        authMessage,
        error.message,
        "error"
      );
      return;
    }

    if (!data.session) {
      showMessage(
        authMessage,
        "帳戶已建立，請到信箱確認電郵後登入。",
        "success"
      );

      switchMode("login");
      return;
    }

    location.href = "levels.html";
  }
);

(async function redirectIfLoggedIn() {
  const user = await getCurrentUser();

  if (user) {
    location.href = "levels.html";
  }
})();
