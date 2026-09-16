async function getCurrentUser() {
  const {
    data: { session }
  } = await window.db.auth.getSession();

  return session?.user || null;
}

async function requireLogin() {
  const user = await getCurrentUser();

  if (!user) {
    const currentPage =
      location.pathname.split("/").pop() ||
      "levels.html";

    location.href =
      `login.html?next=${encodeURIComponent(currentPage)}`;

    return null;
  }

  return user;
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

function showMessage(element, message, type = "") {
  if (!element) return;

  element.textContent = message;
  element.className =
    `message ${type}`.trim();
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("click", async (event) => {
  const logoutButton =
    event.target.closest("[data-logout]");

  if (!logoutButton) return;

  logoutButton.disabled = true;

  await window.db.auth.signOut();

  location.href = "login.html";
});

