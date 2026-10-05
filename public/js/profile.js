import { api } from "./api.js";


// ===============================
// ELEMENTS
// ===============================

const usernameDisplay = document.querySelector("#usernameDisplay");
const headerUsername = document.querySelector("#headerUsername");
const postList = document.querySelector("#postList");
const postsMessage = document.querySelector("#postsMessage");

const emailDisplay = document.querySelector("#emailDisplay");
const roleDisplay = document.querySelector("#roleDisplay");
const verificationDisplay = document.querySelector("#verificationDisplay");

const postsCount = document.querySelector("#postsCount");
const commentsCount = document.querySelector("#commentsCount");

const usernameInput = document.querySelector("#username");
const emailInput = document.querySelector("#email");
const emailCurrentPassword = document.querySelector("#emailCurrentPassword");

const usernameEditForm = document.querySelector("#usernameEditForm");
const emailEditForm = document.querySelector("#emailEditForm");

const editUsernameBtn = document.querySelector("#editUsernameBtn");
const saveUsernameBtn = document.querySelector("#saveUsernameBtn");

const editEmailBtn = document.querySelector("#editEmailBtn");
const saveEmailBtn = document.querySelector("#saveEmailBtn");

const profileFormMessage = document.querySelector("#profileFormMessage");

const emailVerificationText =
  document.querySelector("#emailVerificationText");

const verifyEmailBtn =
  document.querySelector("#verifyEmailBtn");

const verificationMessage =
  document.querySelector("#verificationMessage");

const passwordForm =
  document.querySelector("#passwordForm");

const passwordMessage =
  document.querySelector("#passwordMessage");

const deleteAccountBtn =
  document.querySelector("#deleteAccountBtn");

const logoutBtn =
  document.querySelector("#logoutBtn");


// ===============================
// UTILITY FUNCTIONS
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
// PROFILE EDIT STATE
// ===============================

function enableUsernameEditing() {

  usernameInput.disabled = false;
  saveUsernameBtn.disabled = false;

  editUsernameBtn.disabled = true;

  usernameInput.focus();

  profileFormMessage.textContent = "";
}


function disableUsernameEditing() {

  usernameInput.disabled = true;
  saveUsernameBtn.disabled = true;

  editUsernameBtn.disabled = false;
}


function enableEmailEditing() {

  emailInput.disabled = false;
  emailCurrentPassword.disabled = false;

  saveEmailBtn.disabled = false;

  editEmailBtn.disabled = true;

  emailInput.focus();

  profileFormMessage.textContent = "";
}


function disableEmailEditing() {

  emailInput.disabled = true;
  emailCurrentPassword.disabled = true;

  saveEmailBtn.disabled = true;

  editEmailBtn.disabled = false;

  emailCurrentPassword.value = "";
}


// ===============================
// TABS
// ===============================

const tabs = document.querySelectorAll(".tabs .tab");
const profileSections =
  document.querySelectorAll(".profile-section");


tabs.forEach(tab => {

  tab.addEventListener("click", () => {

    const target =
      document.getElementById(
        tab.dataset.profileSection
      );

    if (!target) return;

    tabs.forEach(t =>
      t.classList.remove("active")
    );

    profileSections.forEach(section =>
      section.classList.remove("active")
    );

    tab.classList.add("active");
    target.classList.add("active");
  });

});


// ===============================
// LOAD CURRENT USER
// ===============================

async function loadProfile() {

  try {

    // ===============================
    // LOAD USER POSTS
    // ===============================

    const postsResponse =
      await api("/api/users/me/posts");

    const postsData =
      await postsResponse.json();

    if (!postsResponse.ok) {

      if (postsResponse.status === 401) {
        window.location.href = "./login";
        return;
      }

      throw new Error(
        postsData.message ||
        "Failed to load user posts"
      );
    }


    if (postsData.length === 0) {

      postList.innerHTML = "";

      postsMessage.textContent =
        "You have not created any posts yet.";

    } else {

      postsMessage.textContent = "";

      postList.innerHTML =
        postsData.map(post => `
          <article class="post-card">

            <a
              class="post-title"
              href="/post/${encodeURIComponent(post.slug)}"
            >
              ${escapeHTML(post.title)}
            </a>

            <div class="post-meta">
              <span>${formatDate(post.createdAt)}</span>
              <span>${post._count.comments} comments</span>
            </div>

          </article>
        `).join("");
    }


    // ===============================
    // LOAD PROFILE
    // ===============================

    const response =
      await api("/api/users/me");

    const data =
      await response.json();


    if (!response.ok) {

      if (response.status === 401) {
        window.location.href = "./login";
        return;
      }

      throw new Error(
        data.message ||
        "Failed to load profile"
      );
    }


    // Account information

    usernameDisplay.textContent =
      data.username;

    headerUsername.textContent =
      data.username;

    emailDisplay.textContent =
      data.email;

    roleDisplay.textContent =
      data.role;

    verificationDisplay.textContent =
      data.emailVerified
        ? "Verified"
        : "Not verified";


    postsCount.textContent =
      data._count?.posts ?? 0;

    commentsCount.textContent =
      data._count?.comments ?? 0;


    // Update form values

    usernameInput.value =
      data.username;

    emailInput.value =
      data.email;


    // Always start locked

    disableUsernameEditing();
    disableEmailEditing();


    // ===============================
    // EMAIL VERIFICATION
    // ===============================

    if (data.emailVerified) {

      emailVerificationText.textContent =
        "Your email address is verified.";

      verifyEmailBtn.style.display =
        "none";

    } else {

      emailVerificationText.textContent =
        "Your email address is not verified.";

      verifyEmailBtn.style.display =
        "inline-block";
    }

  } catch (error) {

    console.error(error);

    profileFormMessage.textContent =
      error.message ||
      "Something went wrong.";
  }
}


// ===============================
// EDIT USERNAME
// ===============================

editUsernameBtn.addEventListener(
  "click",
  () => {

    enableUsernameEditing();

  }
);


// ===============================
// UPDATE USERNAME
// ===============================

usernameEditForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const username =
      usernameInput.value.trim();


    if (!username) {

      profileFormMessage.textContent =
        "Username is required.";

      return;
    }


    saveUsernameBtn.disabled = true;
    editUsernameBtn.disabled = true;

    saveUsernameBtn.querySelector(
      ".btn-label"
    ).textContent = "Updating...";

    profileFormMessage.textContent =
      "Updating username...";


    try {

      const response =
        await api(
          "/api/users/me/username",
          {
            method: "PATCH",

            body: JSON.stringify({
              username
            })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        profileFormMessage.textContent =
          data.message ||
          "Failed to update username.";

        saveUsernameBtn.disabled = false;
        editUsernameBtn.disabled = true;

        saveUsernameBtn.querySelector(
          ".btn-label"
        ).textContent = "Save Changes";

        return;
      }


      profileFormMessage.textContent =
        data.message ||
        "Username updated successfully.";

      saveUsernameBtn.querySelector(
        ".btn-label"
      ).textContent = "Saved";


      await loadProfile();


      setTimeout(() => {

        saveUsernameBtn.querySelector(
          ".btn-label"
        ).textContent = "Save Changes";

        disableUsernameEditing();

      }, 1000);


    } catch (error) {

      console.error(error);

      profileFormMessage.textContent =
        "Something went wrong. Please try again.";

      saveUsernameBtn.disabled = false;
      editUsernameBtn.disabled = true;

      saveUsernameBtn.querySelector(
        ".btn-label"
      ).textContent = "Save Changes";
    }

  }
);


// ===============================
// EDIT EMAIL
// ===============================

editEmailBtn.addEventListener(
  "click",
  () => {

    enableEmailEditing();

  }
);


// ===============================
// UPDATE EMAIL
// ===============================

emailEditForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const email =
      emailInput.value.trim();

    const currentPassword =
      emailCurrentPassword.value;


    if (!email) {

      profileFormMessage.textContent =
        "Email is required.";

      return;
    }


    if (!currentPassword) {

      profileFormMessage.textContent =
        "Current password is required.";

      emailCurrentPassword.focus();

      return;
    }


    saveEmailBtn.disabled = true;
    editEmailBtn.disabled = true;

    saveEmailBtn.querySelector(
      ".btn-label"
    ).textContent = "Updating...";

    profileFormMessage.textContent =
      "Updating email...";


    try {

      const response =
        await api(
          "/api/users/me/email",
          {
            method: "PATCH",

            body: JSON.stringify({
              email,
              currentPassword
            })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        profileFormMessage.textContent =
          data.message ||
          "Failed to update email.";

        saveEmailBtn.disabled = false;
        editEmailBtn.disabled = true;

        saveEmailBtn.querySelector(
          ".btn-label"
        ).textContent = "Save Changes";

        return;
      }


      profileFormMessage.textContent =
        data.message ||
        "Email updated successfully.";

      saveEmailBtn.querySelector(
        ".btn-label"
      ).textContent = "Saved";


      await loadProfile();


      setTimeout(() => {

        saveEmailBtn.querySelector(
          ".btn-label"
        ).textContent = "Save Changes";

        disableEmailEditing();

      }, 1000);


    } catch (error) {

      console.error(error);

      profileFormMessage.textContent =
        "Something went wrong. Please try again.";

      saveEmailBtn.disabled = false;
      editEmailBtn.disabled = true;

      saveEmailBtn.querySelector(
        ".btn-label"
      ).textContent = "Save Changes";
    }

  }
);


// ===============================
// SEND VERIFICATION EMAIL
// ===============================

verifyEmailBtn.addEventListener(
  "click",
  async () => {

    verifyEmailBtn.disabled = true;

    verifyEmailBtn.querySelector(
      ".btn-label"
    ).textContent = "Sending...";

    verificationMessage.textContent =
      "Sending verification email...";


    try {

      const response =
        await api(
          "/api/auth/send-verification",
          {
            method: "POST"
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        verificationMessage.textContent =
          data.message ||
          "Failed to send verification email.";

        verifyEmailBtn.disabled = false;

        verifyEmailBtn.querySelector(
          ".btn-label"
        ).textContent =
          "Send Verification Email";

        return;
      }


      verificationMessage.textContent =
        data.message ||
        "Verification email sent.";

      verifyEmailBtn.querySelector(
        ".btn-label"
      ).textContent = "Email Sent";


    } catch (error) {

      console.error(error);

      verificationMessage.textContent =
        "Something went wrong. Please try again.";

      verifyEmailBtn.disabled = false;

      verifyEmailBtn.querySelector(
        ".btn-label"
      ).textContent =
        "Send Verification Email";
    }

  }
);


// ===============================
// CHANGE PASSWORD
// ===============================

passwordForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    const submitBtn =
      passwordForm.querySelector(
        'button[type="submit"]'
      );


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


    submitBtn.disabled = true;

    submitBtn.querySelector(
      ".btn-label"
    ).textContent = "Changing...";

    passwordMessage.textContent =
      "Changing password...";


    try {

      const response =
        await api(
          "/api/auth/change-password",
          {
            method: "PATCH",

            body: JSON.stringify({
              currentPassword,
              newPassword
            })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        passwordMessage.textContent =
          data.message ||
          "Failed to change password.";

        submitBtn.disabled = false;

        submitBtn.querySelector(
          ".btn-label"
        ).textContent =
          "Change Password";

        return;
      }


      passwordMessage.textContent =
        data.message ||
        "Password changed successfully.";

      submitBtn.querySelector(
        ".btn-label"
      ).textContent = "Changed";

      passwordForm.reset();


      setTimeout(() => {

        window.location.href =
          "/login";

      }, 1000);


    } catch (error) {

      console.error(error);

      passwordMessage.textContent =
        "Something went wrong. Please try again.";

      submitBtn.disabled = false;

      submitBtn.querySelector(
        ".btn-label"
      ).textContent =
        "Change Password";
    }

  }
);


// ===============================
// DELETE ACCOUNT
// ===============================

deleteAccountBtn.addEventListener(
  "click",
  async () => {

    const confirmed =
      confirm(
        "Are you sure you want to permanently delete your account?"
      );


    if (!confirmed) {
      return;
    }


    const secondConfirmation =
      confirm(
        "This cannot be undone. Delete your account?"
      );


    if (!secondConfirmation) {
      return;
    }


    deleteAccountBtn.disabled = true;

    deleteAccountBtn.querySelector(
      ".btn-label"
    ).textContent = "Deleting...";


    try {

      const response =
        await api(
          "/api/auth/account",
          {
            method: "DELETE"
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Failed to delete account."
        );

        deleteAccountBtn.disabled = false;

        deleteAccountBtn.querySelector(
          ".btn-label"
        ).textContent =
          "Delete My Account";

        return;
      }


      sessionStorage.removeItem(
        "accessToken"
      );


      deleteAccountBtn.querySelector(
        ".btn-label"
      ).textContent = "Deleted";


      alert(
        data.message ||
        "Account deleted successfully."
      );


      window.location.href = "/";


    } catch (error) {

      console.error(error);

      alert(
        "Something went wrong. Please try again."
      );

      deleteAccountBtn.disabled = false;

      deleteAccountBtn.querySelector(
        ".btn-label"
      ).textContent =
        "Delete My Account";
    }

  }
);


// ===============================
// LOGOUT
// ===============================

logoutBtn.addEventListener(
  "click",
  async () => {

    logoutBtn.disabled = true;

    logoutBtn.querySelector(
      ".btn-label"
    ).textContent = "Logging out...";


    try {

      await api(
        "/api/auth/logout",
        {
          method: "POST"
        }
      );

    } catch (error) {

      console.error(error);

    } finally {

      sessionStorage.removeItem(
        "accessToken"
      );

      logoutBtn.querySelector(
        ".btn-label"
      ).textContent = "Logged out";

      window.location.href =
        "/";
    }

  }
);


// ===============================
// INITIAL LOAD
// ===============================

loadProfile();