import { api } from "./api.js";
import { renderSinglePost } from "./single-post.js";
const createCommentForm = document.querySelector("#create-comment-form");


createCommentForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const createCommentBtn = document.querySelector("#createCommentBtn");

    createCommentBtn.disabled = true;
    createCommentBtn.textContent = "Creating Comment...";
  
    const data = Object.fromEntries(new FormData(createCommentForm));

    try {
      const slug = window.location.pathname.split("/").filter(Boolean).pop();
  
      if (!slug) {
        throw new Error("Post not found.");
      }
      const getPostCommentsResponse = await api(`/api/posts/${encodeURIComponent(slug)}`);
      const post = await getPostCommentsResponse.json();
      console.log(post.id);

      const response = await api(`/api/comments/posts/${post.id}`, {
        method: "POST",
        body: JSON.stringify(data)
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        createCommentBtn.disabled = false;
        createCommentBtn.textContent = "Submit Comment";
        return;
      }

      createCommentBtn.textContent = "Create Comment";
      createCommentBtn.disabled = false;
      createCommentForm.reset();
      renderSinglePost()

  
    } catch (error) {
      console.error(error);
      createCommentBtn.disabled = false;
      createCommentBtn.textContent = "Submit Comment";
    }
  });



  // edit and delete comments
  document
  .querySelector("#postComments")
  ?.addEventListener("click", async (e) => {

    // EDIT
    const editBtn = e.target.closest(".edit-comment");

    if (editBtn) {
      const commentCard = editBtn.closest(".comment-card");

      const commentActions =
        commentCard.querySelector(".comment-actions");

      const commentContent =
        commentCard.querySelector(".comment-content");

      const commentEdit =
        commentCard.querySelector(".comment-edit");

      const commentEditContent =
        commentCard.querySelector(".comment-edit-content");

      commentActions.hidden = true;
      commentContent.hidden = true;

      commentEditContent.hidden = false;
      commentEdit.hidden = false;

      return;
    }


    // CONFIRM EDIT
    const confirmEditBtn =
      e.target.closest(".confirm-edit-comment");

    if (confirmEditBtn) {
      const commentId = confirmEditBtn.dataset.id;

      const commentCard =
        confirmEditBtn.closest(".comment-card");

      const textarea =
        commentCard.querySelector(".comment-edit-content");

      const content = textarea.value.trim();

      if (!content) {
        alert("Comment cannot be empty.");
        return;
      }

      confirmEditBtn.disabled = true;
      confirmEditBtn.textContent = "Saving...";

      try {
        const response = await api(
          `/api/comments/${commentId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              content
            })
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
            "Failed to update comment"
          );
        }

        await renderSinglePost();

      } catch (error) {
        console.error(error);

        alert(error.message);

        confirmEditBtn.disabled = false;
        confirmEditBtn.textContent = "Confirm";
      }

      return;
    }


    // CANCEL EDIT
    const cancelBtn =
      e.target.closest(".cancel-edit-comment");

    if (cancelBtn) {
      const commentCard =
        cancelBtn.closest(".comment-card");

      const commentContent =
        commentCard.querySelector(".comment-content");

      const commentEditContent =
        commentCard.querySelector(".comment-edit-content");

      const commentActions =
        commentCard.querySelector(".comment-actions");

      const commentEdit =
        commentCard.querySelector(".comment-edit");

      commentEditContent.hidden = true;
      commentEdit.hidden = true;

      commentContent.hidden = false;
      commentActions.hidden = false;

      return;
    }


    // DELETE
    const deleteBtn =
      e.target.closest(".delete-comment");

    if (deleteBtn) {
      const commentId = deleteBtn.dataset.id;

      if (!confirm("Delete this comment?")) {
        return;
      }

      try {
        const response = await api(
          `/api/comments/${commentId}`,
          {
            method: "DELETE"
          }
        );

        if (!response.ok) {
          const result = await response.json();

          throw new Error(
            result.message ||
            "Failed to delete comment"
          );
        }

        await renderSinglePost();

      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    }
  });