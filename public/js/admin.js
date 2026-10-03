import { api } from "./api.js";


const usersTable = document.querySelector("#usersTable");
const postsTable = document.querySelector("#postsTable");
const commentsTable = document.querySelector("#commentsTable");

const logoutBtn = document.querySelector("#logoutBtn");

function makeRow(cells, actionButton = null) {
  const row = document.createElement("tr");

  for (const value of cells) {
    const td = document.createElement("td");
    td.textContent = value ?? "";
    row.appendChild(td);
  }

  if (actionButton) {
    const td = document.createElement("td");
    td.appendChild(actionButton);
    row.appendChild(td);
  }

  return row;
}

async function loadUsers() {
  try {
    const response = await api("/api/admin/users");

    if (!response.ok) {
      throw new Error("Failed to load users");
    }

    const users = await response.json();

    usersTable.innerHTML = "";

    users.forEach(user => {
      const deleteButton = document.createElement("button");
    
      deleteButton.className = "delete-user";
      deleteButton.dataset.id = user.id;
      deleteButton.textContent = "Delete";
    
      usersTable.appendChild(
        makeRow(
          [
            user.username,
            user.email,
            user.role,
            user.emailVerified ? "Yes" : "No",
            user._count.posts,
            user._count.comments
          ],
          deleteButton
        )
      );
    });

  } catch (error) {
    console.error(error);
  }
}


async function loadPosts() {
  try {
    const response = await api("/api/admin/posts");

    if (!response.ok) {
      throw new Error("Failed to load posts");
    }

    const posts = await response.json();

    postsTable.innerHTML = "";

    posts.forEach(post => {
      const deleteButton = document.createElement("button");
    
      deleteButton.className = "delete-post";
      deleteButton.dataset.id = post.id;
      deleteButton.textContent = "Delete";
    
      postsTable.appendChild(
        makeRow(
          [
            post.title,
            post.author.username,
            post.published ? "Published" : "Draft",
            post._count.comments
          ],
          deleteButton
        )
      );
    });

  } catch (error) {
    console.error(error);
  }
}


async function loadComments() {
  try {
    const response = await api("/api/admin/comments");

    if (!response.ok) {
      throw new Error("Failed to load comments");
    }

    const comments = await response.json();

    commentsTable.innerHTML = "";

    comments.forEach(comment => {
      const deleteButton = document.createElement("button");
    
      deleteButton.className = "delete-comment";
      deleteButton.dataset.id = comment.id;
      deleteButton.textContent = "Delete";
    
      commentsTable.appendChild(
        makeRow(
          [
            comment.author.username,
            comment.content,
            comment.post.title
          ],
          deleteButton
        )
      );
    });

  } catch (error) {
    console.error(error);
  }
}


async function deleteUser(id) {

  const confirmed = confirm(
    "Are you sure you want to delete this user?"
  );

  if (!confirmed) {
    return;
  }

  const response = await api(
    `/api/admin/users/${id}`,
    {
      method: "DELETE"
    }
  );

  const data = await response.json();

  if (!response.ok) {
    alert(data.message || "Failed to delete user");
    return;
  }

  alert(data.message);

  loadUsers();
}

async function deletePost(id) {

  const confirmed = confirm(
    "Are you sure you want to delete this post?"
  );

  if (!confirmed) {
    return;
  }

  const response = await api(
    `/api/admin/posts/${id}`,
    {
      method: "DELETE"
    }
  );

  const data = await response.json();

  if (!response.ok) {
    alert(data.message || "Failed to delete post");
    return;
  }

  alert(data.message);

  loadPosts();
}

async function deleteComment(id) {

  const confirmed = confirm(
    "Are you sure you want to delete this comment?"
  );

  if (!confirmed) {
    return;
  }

  const response = await api(
    `/api/admin/comments/${id}`,
    {
      method: "DELETE"
    }
  );

  const data = await response.json();

  if (!response.ok) {
    alert(data.message || "Failed to delete comment");
    return;
  }

  alert(data.message);

  loadComments();
}

usersTable.addEventListener("click", event => {

  if (!event.target.classList.contains("delete-user")) {
    return;
  }

  const id = event.target.dataset.id;

  deleteUser(id);
});


postsTable.addEventListener("click", event => {

  if (!event.target.classList.contains("delete-post")) {
    return;
  }

  const id = event.target.dataset.id;

  deletePost(id);
});


commentsTable.addEventListener("click", event => {

  if (!event.target.classList.contains("delete-comment")) {
    return;
  }

  const id = event.target.dataset.id;

  deleteComment(id);
});


logoutBtn.addEventListener("click", async () => {

  try {
    await api("/api/auth/logout", {
      method: "POST"
    });
  } finally {
    sessionStorage.removeItem("accessToken");

    window.location.href = "/";
  }
});


loadUsers();
loadPosts();
loadComments();