import { api } from "./api.js";


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

function formatPostContent(content) {
  return escapeHTML(content)
    .replace(/\r?\n/g, "<br>");
}

export async function renderSinglePost() {
    const singlePostMessage = document.querySelector("#singlePostMessage");
    const singlePost = document.querySelector("#singlePost");
    const createCommentForm = document.querySelector("#create-comment-form");
  
    try {  
  
      const params = new URLSearchParams(window.location.search);
      const slug = params.get("slug");
  
      if (!slug) {
        throw new Error("Post not found.");
      }
      const response = await api(`/api/posts/${encodeURIComponent(slug)}`);
  
      const post = await response.json();
      console.log("single post", post);
      console.log("comment on single post", post.comments);

      // Check post ownership
      const currentUser = await renderNav();
      console.log("current user", currentUser);
      const isAuthor = currentUser && currentUser.id === post.authorId
      ;
      const authorControls = isAuthor
      ? `
          <div class="post-actions">

            <a
              class="edit-post"
              href="/edit-post.html?slug=${encodeURIComponent(post.slug)}"
            >
              Edit
            </a>

            <button
              type="button"
              class="delete-post"
              id="deletePostBtn"
              data-id="${post.id}"
            >
              Delete
            </button>

          </div>
        `
      : "";


      
  
      if (!response.ok) { 
        throw new Error(
          post.message || "Failed to load post"
        );
      }

      

      singlePost.innerHTML = `
        <article class="">
  
          <h1 class="post-title"> ${escapeHTML(post.title)}</h1>
  
          <div class="post-meta">
            <span> By ${escapeHTML(post.author.username)} </span>
  
            <span>${formatDate(post.createdAt)}</span>
  
            <span>${post.comments.length} comments</span>

            ${authorControls}
          </div>
  
          <p class="post-content">
            ${formatPostContent(post.content)}
          </p>  
        </article>
      `;

      const postComments = document.querySelector("#postComments");

      postComments.innerHTML =
        post.comments.length > 0
          ? post.comments.map((comment) => {

              const isCommentAuthor =
                currentUser &&
                currentUser.id === comment.authorId;

              const commentActions = isCommentAuthor
                ? `
                    <div class="comment-actions">

                      <button
                        type="button"
                        class="edit-comment"
                        data-id="${comment.id}"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        class="delete-comment"
                        data-id="${comment.id}"
                      >
                        Delete
                      </button>

                    </div>

                    <div
                      class="comment-edit"
                      data-comment-id="${comment.id}"
                      hidden
                    >

                      <button
                        type="button"
                        class="confirm-edit-comment"
                        data-id="${comment.id}"
                      >
                        Confirm
                      </button>

                      <button
                        type="button"
                        class="cancel-edit-comment"
                      >
                        Cancel
                      </button>

                    </div>
                  `
                : "";

              return `
                <article class="comment-card">

                  <div>

                    <div class="post-meta">

                      <span>
                        By ${escapeHTML(comment.author.username)}
                      </span>

                      <span>
                        Updated at
                        ${formatDate(comment.updatedAt)}
                      </span>

                    </div>

                    <div class="comment-content-wrapper">

                      <span class="comment-content">
                        ${escapeHTML(comment.content)}
                      </span>

                      <textarea
                        class="comment-edit-content"
                        required
                        hidden
                      >${escapeHTML(comment.content)}</textarea>

                    </div>

                  </div>

                  ${commentActions}

                </article>
              `;

            }).join("")
          : `
              <p>No comments yet.</p>
            `;


  
      if (response.ok) {
        const isLoggedin = currentUser;
        isLoggedin ?
        createCommentForm.innerHTML = `
        <h3>Write Comment</h3>
        <textarea
          name="content"
          id="content"
          placeholder="Write your comment..."
          required
        ></textarea>

        <button
          class="auth-btn"
          id="createCommentBtn"
          type="submit"
        >
          Submit Comment
        </button>
      `: "";

      const deletePostBtn =
      document.querySelector("#deletePostBtn");


    deletePostBtn?.addEventListener(
      "click",
      async () => {

        const confirmed = confirm(
          "Are you sure you want to delete this post?"
        );

        if (!confirmed) {
          return;
        }


        deletePostBtn.disabled = true;

        deletePostBtn.textContent =
          "Deleting...";


        try {

          const response = await api(
            `/api/posts/${post.id}`,
            {
              method: "DELETE"
            }
          );


          if (!response.ok) {

            const data = await response.json();

            throw new Error(
              data.message ||
              "Failed to delete post"
            );
          }

          window.location.href =
            "/";


        } catch (error) {

          console.error(error);

          alert(error.message);

          deletePostBtn.disabled = false;

          deletePostBtn.textContent =
            "Delete";
        }
      }
    );
      }
    } catch (error) {
      console.error(error);
  
      singlePostMessage.textContent = error.message;
    }
  }
renderSinglePost()

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
    return user
  } catch (error) {
    console.error(error);
    renderLoggedout()
  }

}

function renderLoggedout() {
  navAuth.innerHTML = `
    <span> Welcome <strong>Guest, </strong></span>
    <a class="nav-link" href="/login.html">Login</a>
    <a class="nav-link" href="/register.html">Register</a>
  `
}

function renderLoggedin(user) {
  navAuth.innerHTML = `
    <span> Welcome <strong id="usernameDisplay">${user.username}, </strong></span>
    <a href="/profile.html">Edit Profile</a>
    <a href="/create-post.html">Create Post</a>
    <a href="/change-password.html">Change Password</a>
    <a class="nav-link" href="/forgot-password.html">Forgot Password</a>
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

renderNav() 

