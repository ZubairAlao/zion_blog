import { api } from "./api.js";

const usernameDisplay = document.querySelector("#usernameDisplay");
const logoutBtn = document.querySelector("#logoutBtn");

async function loadUser() {
  try {
    const response = await api("/api/users/me");
    const data = await response.json();
    
    if (response.status === 401) {
      sessionStorage.removeItem("accessToken");

      window.location.href = "/login.html";

      return null;
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to load user");
    }
    console.log(data);

    if (usernameDisplay) usernameDisplay.textContent = data.username;
  } catch (error) {
    console.error(error);
    return null;
  }
}

logoutBtn?.addEventListener("click", async () => {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } finally {
    sessionStorage.removeItem("accessToken");
    window.location.href = "/";
  }
});



loadUser();