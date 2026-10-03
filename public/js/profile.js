import { api } from "./api.js";


// ===============================
// ELEMENTS
// ===============================

const usernameDisplay = document.querySelector("#usernameDisplay");
const headerUsername = document.querySelector("#headerUsername");
const postList = document.querySelector("#postList");
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


const emailDisplay = document.querySelector("#emailDisplay");

const roleDisplay = document.querySelector("#roleDisplay");

const verificationDisplay = document.querySelector("#verificationDisplay");

const postsCount = document.querySelector("#postsCount");

const commentsCount = document.querySelector("#commentsCount");

const usernameInput = document.querySelector("#username");

const emailInput = document.querySelector("#email");

const usernameEditForm = document.querySelector("#usernameEditForm");
const emailEditForm = document.querySelector("#emailEditForm");

const profileFormMessage = document.querySelector("#profileFormMessage");

const emailVerificationText = document.querySelector("#emailVerificationText");

const verifyEmailBtn = document.querySelector("#verifyEmailBtn");

const verificationMessage = document.querySelector("#verificationMessage");

const passwordForm = document.querySelector("#passwordForm");

const passwordMessage = document.querySelector("#passwordMessage");

const deleteAccountBtn = document.querySelector("#deleteAccountBtn");

const logoutBtn = document.querySelector("#logoutBtn");

// toggleing tabs
const tabs = document.querySelectorAll(".tabs .tab");
const profileSections = document.querySelectorAll(".profile-section");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const target = document.getElementById(tab.dataset.profileSection);
    if (!target) return;

    tabs.forEach(t => t.classList.remove("active"));
    profileSections.forEach(s => s.classList.remove("active"));

    tab.classList.add("active");
    target.classList.add("active");
  });
});

// ===============================
// LOAD CURRENT USER
// ===============================

async function loadProfile() {

  try {

    // get loggedin user post
    const postsResponse = await api("/api/users/me/posts");
    const postsData = await postsResponse.json();
    console.log("post data of loggedin users", postsData);
    
    if (!postsResponse.ok) {

      if (postsResponse.status === 401) {
        window.location.href = "./login";
        return;
      }

      throw new Error(
        postsData.message || "Failed to load user posts"
      );
    }

    postList.innerHTML = postsData.map((post) => `
    <article class="post-card">

      <a
        class="post-title"
        href="/post?slug=${encodeURIComponent(post.slug)}"
      >
        ${escapeHTML(post.title)}
      </a>

      <div class="post-meta">
        <span>${formatDate(post.createdAt)}</span>
        <span>${post._count.comments} comments</span>
      </div>

    </article>
  `).join("");


    const response = await api("/api/users/me");
    const data = await response.json();
    if (!response.ok) {

      if (response.status === 401) {
        window.location.href = "./login";
        return;
      }

      throw new Error(
        data.message || "Failed to load profile"
      );
    }

    usernameDisplay.textContent = data.username;
    headerUsername.textContent = data.username;
    console.log("profile", data);
    

    emailDisplay.textContent = data.email;

    roleDisplay.textContent = data.role;

    verificationDisplay.textContent =
      data.emailVerified
        ? "Verified"
        : "Not verified";


    postsCount.textContent =
      data._count?.posts ?? 0;

    commentsCount.textContent =
      data._count?.comments ?? 0;


    usernameInput.value = data.username;

    emailInput.value = data.email;


    if (data.emailVerified) {

      emailVerificationText.textContent =
        "Your email address is verified.";

      verifyEmailBtn.style.display = "none";

    } else {

      emailVerificationText.textContent =
        "Your email address is not verified.";

      verifyEmailBtn.style.display = "inline-block";
    }

  } catch (error) {

    console.error(error);

    profileFormMessage.textContent =
      error.message || "Something went wrong.";
  }
}


// ===============================
// UPDATE PROFILE
// ===============================



emailEditForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    profileFormMessage.textContent =
      "Updating...";


    const email =
      emailInput.value.trim();


    try {

      const response = await api(
        "/api/users/me",
        {
          method: "PATCH",

          body: JSON.stringify({
            email
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {

        profileFormMessage.textContent =
          data.message ||
          "Failed to update profile";

        return;
      }


      profileFormMessage.textContent =
        data.message;


      // Refresh displayed account information
      await loadProfile();

    } catch (error) {

      console.error(error);

      profileFormMessage.textContent =
        "Something went wrong.";
    }
  }
);

usernameEditForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    profileFormMessage.textContent =
      "Updating...";


    const username =
      usernameInput.value.trim();

    try {

      const response = await api(
        "/api/users/me",
        {
          method: "PATCH",

          body: JSON.stringify({
            username
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {

        profileFormMessage.textContent =
          data.message ||
          "Failed to update profile";

        return;
      }


      profileFormMessage.textContent =
        data.message;


      // Refresh displayed account information
      await loadProfile();

    } catch (error) {

      console.error(error);

      profileFormMessage.textContent =
        "Something went wrong.";
    }
  }
);

// ===============================
// SEND VERIFICATION EMAIL
// ===============================

verifyEmailBtn.addEventListener(
  "click",
  async () => {

    verificationMessage.textContent =
      "Sending verification email...";


    try {

      const response = await api(
        "/api/auth/send-verification",
        {
          method: "POST"
        }
      );


      const data = await response.json();


      if (!response.ok) {

        verificationMessage.textContent =
          data.message ||
          "Failed to send verification email";

        return;
      }


      verificationMessage.textContent =
        data.message ||
        "Verification email sent.";

    } catch (error) {

      console.error(error);

      verificationMessage.textContent =
        "Something went wrong.";
    }
  }
);


// ===============================
// CHANGE PASSWORD
// ===============================

passwordForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    passwordMessage.textContent =
      "Changing password...";


    const currentPassword =
      document.querySelector(
        "#currentPassword"
      ).value;

    const newPassword =
      document.querySelector(
        "#newPassword"
      ).value;

    const confirmPassword =
      document.querySelector(
        "#confirmPassword"
      ).value;


    if (newPassword !== confirmPassword) {

      passwordMessage.textContent =
        "New passwords do not match.";

      return;
    }


    try {

      const response = await api(
        "/api/auth/change-password",
        {
          method: "PATCH",

          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {

        passwordMessage.textContent =
          data.message ||
          "Failed to change password";

        return;
      }


      passwordMessage.textContent =
        data.message ||
        "Password changed successfully.";


      passwordForm.reset();
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);

    } catch (error) {

      console.error(error);

      passwordMessage.textContent =
        "Something went wrong.";
    }
  }
);



// ===============================
// DELETE ACCOUNT
// ===============================

deleteAccountBtn.addEventListener(
  "click",
  async () => {

    const confirmed = confirm(
      "Are you sure you want to permanently delete your account?"
    );


    if (!confirmed) {
      return;
    }


    const secondConfirmation = confirm(
      "This cannot be undone. Delete your account?"
    );


    if (!secondConfirmation) {
      return;
    }


    try {

      const response = await api(
        "/api/auth/account",
        {
          method: "DELETE"
        }
      );


      const data = await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Failed to delete account"
        );

        return;
      }


      sessionStorage.removeItem(
        "accessToken"
      );


      alert(
        data.message ||
        "Account deleted successfully."
      );


      window.location.href =
        "/";

    } catch (error) {

      console.error(error);

      alert(
        "Something went wrong."
      );
    }
  }
);


// ===============================
// LOGOUT
// ===============================

logoutBtn.addEventListener(
  "click",
  async () => {

    try {
 
      await api(
        "/api/auth/logout",
        {
          method: "POST"
        }
      );

    } finally {

      sessionStorage.removeItem(
        "accessToken"
      );

      window.location.href =
        "/";
    }
  }
);


// ===============================
// INITIAL LOAD
// ===============================

loadProfile();