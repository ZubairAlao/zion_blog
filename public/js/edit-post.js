import { api } from "./api.js";

const editPostForm = document.querySelector("#edit-post-form");
const editPostMessage = document.querySelector("#editPostMessage");
const editPostBtn = document.querySelector("#editPostBtn");
  
async function renderSinglePost() {    
    try {  
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");

    if (!slug) {
        throw new Error("Post not found.");
    }

    const response = await api(`/api/posts/${encodeURIComponent(slug)}`);

    const post = await response.json();        

    if (!response.ok) { 
        throw new Error(
        post.message || "Failed to load post"
        );
    }
    document.getElementById("title").value = post.title
    document.getElementById("content").value = post.content

    } catch (error) {
    console.error(error);
    }
}

editPostForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

    editPostMessage.textContent = "";
    editPostBtn.disabled = true;
    editPostBtn.textContent = "Editing Post...";

    const data = Object.fromEntries(new FormData(editPostForm));

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");

    if (!slug) {
        throw new Error("Post not found.");
    }

  try {

    const renderResponse = await api(`/api/posts/${encodeURIComponent(slug)}`);

    const renderPost = await renderResponse.json(); 
    console.log(renderPost);
           

    if (!renderResponse.ok) { 
        throw new Error(
        post.message || "Failed to load post"
        );
    }

    const response = await api(`/api/posts/${renderPost.id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
      });

    const result = await response.json();

    if (!response.ok) {
      editPostMessage.textContent = result.message || "Failed to edit post.";
      editPostBtn.disabled = false;
      editPostBtn.textContent = "Submit Post";
      return;
    }

    window.location.href = `/post.html?slug=${result.slug}`
  } catch (error) {
    console.error(error);
    editPostMessage.textContent = "Something went wrong. Please try again.";
    editPostBtn.disabled = false;
    editPostBtn.textContent = "Submit Post";
  }
});

renderSinglePost()