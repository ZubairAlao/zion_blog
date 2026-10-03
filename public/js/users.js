import { api } from "./api.js";
// ===============================
// ELEMENTS
// ===============================
const usernameDisplay = document.querySelector("#usernameDisplay");

const commentsCount = document.querySelector("#commentsCount");
const postsCount = document.querySelector("#postsCount");
const publicPosts = document.querySelector("#publicPosts");
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


// ===============================
// LOAD USERS
// ===============================

async function loadUSers() {
  

    const params = new URLSearchParams(window.location.search);
    const user = params.get("user");
    console.log(user);
    
    if (!user) {
        history.back()
    }

    try {
  
      const response = await api(`/api/users/${encodeURIComponent(user)}`);  
      const data = await response.json();
      console.log(data.posts);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load profile"
        );
      }
      usernameDisplay.textContent = data.username;
      publicPosts.innerHTML = data.posts.map((post) => `
        <article class="post-card">

        <a
            class="post-title"
            href="/post.html?slug=${encodeURIComponent(post.slug)}"
        >
            ${escapeHTML(post.title)}
        </a>

        <div class="post-meta">
            <span>By ${escapeHTML(data.username)}</span>
            <span>${formatDate(post.createdAt)}</span>
            <span>${post._count.comments} comments</span>
        </div>

        </article>
    `).join(""); 

      postsCount.textContent = data.posts.length ?? 0;
      commentsCount.textContent = data.posts[0]._count.comments ?? 0;
    } catch (error) {
  
      console.error(error);
    }
  }


loadUSers()
