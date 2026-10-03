
import { api } from "./api.js";

const publicPosts = document.querySelector("#publicPosts");
const postsMessage = document.querySelector("#postsMessage");





function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

async function renderPublicPosts() {

  try {
    const response = await api("/api/posts");
    const data = await response.json();
    console.log(data);
    

    if (!response.ok) {
      throw new Error(data.message || "Failed to load posts");
    }

    if (data.length === 0) {
      postsMessage.textContent = "No published posts yet.";
      return;
    }
    
    postsMessage.textContent = "";

    async function getCurrentUser() {
      const accessToken = sessionStorage.getItem("accessToken");
    
      if (!accessToken) {
        return null;
      }
    
      try {
        const response = await api("/api/users/me");
    
        if (!response.ok) {
          return null;
        }
    
        return await response.json();
      } catch (error) {
        console.error(error);
        return null;
      }
    }
    const user = await getCurrentUser();
    console.log("USER", user);
    

    publicPosts.innerHTML = data.map((post) => {

      const authorUrl = user?.id === post.authorId
        ? "/profile"
        : `/users/${encodeURIComponent(post.author.username)}`;

      return `
        <article class="post-card">

          <a
            class="post-title"
            href="/post/${encodeURIComponent(post.slug)}"
          >
            ${escapeHTML(post.title)}
          </a>

          <div class="post-meta">
            <a href="${authorUrl}">
              By ${escapeHTML(post.author.username)}
            </a>

            <span>${formatDate(post.createdAt)}</span>
            <span>${post._count.comments} comments</span>
          </div>

        </article>
      `;
    }).join("");
  } catch (error) {
    console.error(error);
    postsMessage.textContent = error.message;
  }
}

const navAuth = document.querySelector("#nav-auth")

async function renderNav() {
  try {

    let accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      renderLoggedout()
      return
    }
    
    const response = await api("/api/users/me");
    if (!response.ok) {
      renderLoggedout()
      return
    }
    const user = await response.json();
    renderLoggedin(user)
  } catch (error) {
    console.error(error);
    renderLoggedout()
  }

}

function renderLoggedout() {
  navAuth.innerHTML = `
    <span> Welcome <strong>Guest, </strong></span>
    <a class="nav-link" href="/login">Login</a>
    <a class="nav-link" href="/register">Register</a>
  `
}

function renderLoggedin(user) {
  navAuth.innerHTML = `
    <span> Welcome <strong id="usernameDisplay">${user.username}, </strong></span>
    <a href="/profile">Edit Profile</a>
    <a href="/create-post">Create Post</a>
    <a href="/change-password">Change Password</a>
    <a class="nav-link" href="/forgot-password">Forgot Password</a>
    <button id="logoutBtn" class="btn">Logout</button>
  `
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", async () => {
    console.log("enter logoutBtn", logoutBtn);
    try {
      await api("/api/auth/logout", { method: "POST" });
    } finally {
      sessionStorage.removeItem("accessToken");
      window.location.href = "/";
    }
  });
}



renderPublicPosts() 
renderNav()