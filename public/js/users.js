import { api } from "./api.js";

// ===============================
// ELEMENTS
// ===============================
const usernameDisplay = document.querySelector("#usernameDisplay");
const commentsCount = document.querySelector("#commentsCount");
const postsCount = document.querySelector("#postsCount");
const publicPosts = document.querySelector("#publicPosts");


// ===============================
// HELPERS
// ===============================
function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
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
// LOAD USER
// ===============================
async function loadUsers() {

  const username = window.location.pathname
  .split("/")
  .filter(Boolean)
  .pop();

    console.log("Username:", username);

    if (!username) {
        window.location.href = "/";
        return;
    }

    try {

        const response = await api(
            `/api/users/${encodeURIComponent(username)}`
        );

        const data = await response.json();

        console.log(data);

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load profile"
            );
        }

        // ===============================
        // USER INFORMATION
        // ===============================

        usernameDisplay.textContent = data.username;

        // ===============================
        // POSTS
        // ===============================

        if (!data.posts || data.posts.length === 0) {
            publicPosts.innerHTML = `
                <p>This user has no published posts yet.</p>
            `;

            postsCount.textContent = "0";
            commentsCount.textContent = "0";

            return;
        }

        publicPosts.innerHTML = data.posts.map((post) => `
            <article class="post-card">

                <a
                    class="post-title"
                    href="/post/${encodeURIComponent(post.slug)}"
                >
                    ${escapeHTML(post.title)}
                </a>

                <div class="post-meta">
                    <span>
                        By ${escapeHTML(data.username)}
                    </span>

                    <span>
                        ${formatDate(post.createdAt)}
                    </span>

                    <span>
                        ${post._count.comments} comments
                    </span>
                </div>

            </article>
        `).join("");

        // ===============================
        // COUNTS
        // ===============================

        postsCount.textContent = data.posts.length;

        const totalComments = data.posts.reduce(
            (total, post) => total + post._count.comments,
            0
        );

        commentsCount.textContent = totalComments;

    } catch (error) {

        console.error(error);

        publicPosts.innerHTML = `
            <p>${escapeHTML(error.message)}</p>
        `;
    }
}

loadUsers();