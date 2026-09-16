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
  const isLogin = mode === "login";

  loginForm.hidden = !isLogin;
  registerForm.hidden = isLogin;

  showLogin.classList.toggle("active", isLogin);
  showRegister.classList.toggle("active", !isLogin);

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

  const submitButton =
    loginForm.querySelector("button[type='submit']");

  const email =
    document.getElementById("loginEmail")
      .value.trim();

  const password =
    document.getElementById("loginPassword")
      .value;

  submitButton.disabled = true;
  submitButton.textContent = "驗證中...";

  showMessage(authMessage, "正在驗證探索者身份...");

  const { error } =
    await window.db.auth.signInWithPassword({
      email,
      password
    });

  submitButton.disabled = false;
  submitButton.textContent = "登入任務中心";

  if (error) {
    let errorText = error.message;

    if (error.message.includes("Invalid login")) {
      errorText = "電郵或密碼不正確。";
    } else if (
      error.message.includes("Email not confirmed")
    ) {
      errorText = "請先到電郵信箱確認帳戶。";
    }

    showMessage(
      authMessage,
      errorText,
      "error"
    );

    return;
  }

  showMessage(
    authMessage,
    "登入成功，正在進入任務中心...",
    "success"
  );

  const parameters =
    new URLSearchParams(location.search);

  const nextPage =
    parameters.get("next") || "levels.html";

  setTimeout(() => {
    location.href = nextPage;
  }, 500);
});

registerForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const displayName =
      document.getElementById("displayName")
        .value.trim();

    const email =
      document.getElementById("registerEmail")
        .value.trim();

    const password =
      document.getElementById("registerPassword")
        .value;

    const confirmPassword =
      document.getElementById("confirmPassword")
        .value;

    if (displayName.length < 1) {
      showMessage(
        authMessage,
        "請輸入玩家名稱。",
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

    if (password !== confirmPassword) {
      showMessage(
        authMessage,
        "兩次輸入的密碼不相同。",
        "error"
      );
      return;
    }

    const submitButton =
      registerForm.querySelector(
        "button[type='submit']"
      );

    submitButton.disabled = true;
    submitButton.textContent = "建立中...";

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

    submitButton.disabled = false;
    submitButton.textContent =
      "建立探索者帳戶";

    if (error) {
      let errorText = error.message;

      if (
        error.message.includes(
          "Database error saving new user"
        )
      ) {
        errorText =
          "這個玩家名稱可能已被使用，請更換名稱。";
      }

      if (
        error.message.includes(
          "already registered"
        )
      ) {
        errorText =
          "這個電郵已經註冊，請直接登入。";
      }

      showMessage(
        authMessage,
        errorText,
        "error"
      );

      return;
    }

    if (!data.session) {
      showMessage(
        authMessage,
        "帳戶已建立。請到電郵信箱確認後再登入。",
        "success"
      );

      switchMode("login");
      return;
    }

    showMessage(
      authMessage,
      "帳戶建立成功，正在進入任務中心...",
      "success"
    );

    setTimeout(() => {
      location.href = "levels.html";
    }, 700);
  }
);

(async function redirectLoggedInUser() {
  const user = await getCurrentUser();

  if (user) {
    location.href = "levels.html";
  }
})();

