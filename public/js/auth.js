import { api } from "./api.js";
const registerForm = document.querySelector("#register-form");
const logoutBtn = document.querySelector("#logoutBtn");

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = document.getElementById("message");
    const registerBtn = document.getElementById("registerBtn");

    message.textContent = "";
    registerBtn.disabled = true;
    registerBtn.textContent = "Registering...";

    const data = Object.fromEntries(new FormData(registerForm));

    // Username validation
    if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      message.textContent =
        "Username can only contain letters, numbers, and underscores.";

      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      message.textContent = result.message;

      if (!response.ok) {
        registerBtn.disabled = false;
        registerBtn.textContent = "Register";
        return;
      }

      registerForm.reset();
      registerBtn.textContent = "Registered";

    } catch (error) {
      console.error(error);

      message.textContent = "Something went wrong. Please try again.";

      registerBtn.disabled = false;
      registerBtn.textContent = "Register";
    }
  });
}
    

// verify email
const verifyEmailBtn = document.querySelector("#verifyEmailBtn");
if (verifyEmailBtn) {
  verifyEmailBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    const message = document.getElementById("message");

    message.textContent = "";

    verifyEmailBtn.disabled = true;
    verifyEmailBtn.textContent = "Verifying...";

    const urlParams = new URLSearchParams(window.location.search);

    const token = urlParams.get("token");

    if (!token) {
      message.textContent =
        "Verification token is missing.";

      verifyEmailBtn.disabled = false;
      verifyEmailBtn.textContent =
        "Verify Email";

      return;
    }

    try {
      const response = await fetch(
        "/api/auth/verify-email",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            token
          })
        }
      );

      const result = await response.json();

      message.textContent = result.message;

      if (!response.ok) {
        verifyEmailBtn.disabled = false;
        verifyEmailBtn.textContent =
          "Verify Email";
        return;
      }

      verifyEmailBtn.textContent = "Verified";

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);

    } catch (error) {
      console.error(error);

      message.textContent =
        "Something went wrong.";

      verifyEmailBtn.disabled = false;
      verifyEmailBtn.textContent =
        "Verify Email";
    }
  });
}

// for sending verifcation again after user didnt get first one
const sendVerificationEmailBtn = document.querySelector("#sendVerificationEmailBtn");
const loginForm = document.querySelector("#login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = document.getElementById("message");
    const loginBtn = document.getElementById("loginBtn");

    message.textContent = "";
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    const data = Object.fromEntries(new FormData(loginForm));

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        credentials: "include",

        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        message.textContent = result.message;
      
        if (response.status === 403) {
          sendVerificationEmailBtn.hidden = false;
        }
      
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
        return;
      }

      sessionStorage.setItem(
        "accessToken",
        result.accessToken
      );

      message.textContent = result.message;
      loginBtn.textContent = "Logged in";

      window.location.href = "/";

    } catch (error) {
      console.error(error);

      message.textContent =
        "Something went wrong. Please try again.";

      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  });
}

const changePasswordForm = document.querySelector("#change-password-form");
if (changePasswordForm) {
  changePasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = document.getElementById("message");
    const changePasswordBtn =
      document.getElementById("changePasswordBtn");

    message.textContent = "";
    changePasswordBtn.disabled = true;
    changePasswordBtn.textContent = "Changing...";

    const data =
      Object.fromEntries(
        new FormData(changePasswordForm)
      );

      console.log(data, data.password, data.confirmPassword);
      

      if (data.newPassword !== data.confirmPassword) {

        message.textContent = "New passwords do not match.";
          changePasswordBtn.disabled = false;
          changePasswordBtn.textContent = "Change Password";
  
        return;
      }

    const accessToken =
      sessionStorage.getItem("accessToken");

    try {
      const response = await fetch(
        "/api/auth/change-password",
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },

          credentials: "include",

          body: JSON.stringify(data)
        }
      );

      const result = await response.json();

      message.textContent = result.message;

      if (!response.ok) {
        changePasswordBtn.disabled = false;
        changePasswordBtn.textContent = "Change Password";
        return;
      }

      changePasswordBtn.textContent = "Changed";

      sessionStorage.removeItem("accessToken");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);

    } catch (error) {
      console.error(error);

      message.textContent =
        "Something went wrong. Please try again.";

      changePasswordBtn.disabled = false;
      changePasswordBtn.textContent =
        "Change Password";
    }
  });
}

const forgotPasswordForm = document.querySelector("#forgot-password-form");
if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const message =
        document.getElementById("message");

      const forgotPasswordBtn =
        document.getElementById("forgotPasswordBtn");

      message.textContent = "";

      forgotPasswordBtn.disabled = true;
      forgotPasswordBtn.textContent = "Sending...";

      const data =
        Object.fromEntries(
          new FormData(forgotPasswordForm)
        );

      try {
        const response = await fetch(
          "/api/auth/forgot-password",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
          }
        );

        const result =
          await response.json();

        message.textContent =
          result.message;

        if (!response.ok) {
          forgotPasswordBtn.disabled = false;
          forgotPasswordBtn.textContent =
            "Send Reset Link";

          return;
        }

        forgotPasswordBtn.textContent =
          "Email Sent";
        
        forgotPasswordForm.reset()

      } catch (error) {
        console.error(error);

        message.textContent =
          "Unable to send the reset email. Please try again.";

        forgotPasswordBtn.disabled = false;
        forgotPasswordBtn.textContent =
          "Send Reset Link";
      }
    }
  );
}

const resetPasswordForm = document.querySelector("#reset-password-form");
if (resetPasswordForm) {
  resetPasswordForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const message =
        document.getElementById("message");

      const resetPasswordBtn =
        document.getElementById("resetPasswordBtn");

      message.textContent = "";

      const urlParams =
        new URLSearchParams(
          window.location.search
        );

      const token =
        urlParams.get("token");

      if (!token) {
        message.textContent =
          "This password reset link is invalid or missing.";

        return;
      }

      resetPasswordBtn.disabled = true;
      resetPasswordBtn.textContent =
        "Resetting...";

      const data =
        Object.fromEntries(
          new FormData(resetPasswordForm)
        );

      try {
        const response = await fetch(
          "/api/auth/reset-password",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              token,
              password: data.password
            })
          }
        );

        const result =
          await response.json();

        message.textContent =
          result.message;

        if (!response.ok) {
          resetPasswordBtn.disabled = false;
          resetPasswordBtn.textContent =
            "Reset Password";

          return;
        }

        resetPasswordBtn.textContent =
          "Password Reset";

        setTimeout(() => {
          window.location.href =
            "/login";
        }, 1500);

      } catch (error) {
        console.error(error);

        message.textContent =
          "Something went wrong. Please try again.";

        resetPasswordBtn.disabled = false;
        resetPasswordBtn.textContent =
          "Reset Password";
      }
    }
  );
}

logoutBtn?.addEventListener("click", async () => {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } finally {
    sessionStorage.removeItem("accessToken");
    window.location.href = "/";
  }
});

// to send resend verification email again incase user didnt get it
sendVerificationEmailBtn?.addEventListener("click", async () => {
  sendVerificationEmailBtn.disabled = true; 
  const email = document.getElementById("email").value
  console.log(email);
  try {
    const response = await api("/api/auth/resend-verification", { method: "POST", body: JSON.stringify({ email: email }) });
    const data = await response.json();
    alert(data.message || (response.ok ? "Verification link sent." : "Failed to send link."));
  } catch (error) { 
    console.error(error);
    alert("Something went wrong. Please try again.");
  } finally {
    sendVerificationEmailBtn.disabled = false;
  }
});
