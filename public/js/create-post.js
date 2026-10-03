import { api } from "./api.js";

const createPostForm = document.querySelector("#create-post-form");
const createPostMessage = document.querySelector("#createPostMessage");
const createPostBtn = document.querySelector("#createPostBtn");

createPostForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  createPostMessage.textContent = "";
  createPostBtn.disabled = true;
  createPostBtn.textContent = "Creating Post...";

  const data = Object.fromEntries(new FormData(createPostForm));

  try {
    const response = await api("/api/posts", {
      method: "POST",
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      createPostMessage.textContent = result.message || "Failed to create post.";
      createPostBtn.disabled = false;
      createPostBtn.textContent = "Submit Post";
      return;
    }

    window.location.href = "/dashboard.html";
  } catch (error) {
    console.error(error);
    createPostMessage.textContent = "Something went wrong. Please try again.";
    createPostBtn.disabled = false;
    createPostBtn.textContent = "Submit Post";
  }
});