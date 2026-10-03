import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  // secure: true,
  family: 4,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP ERROR:", error);
  } else {
    console.log("SMTP server is ready");
  }
});

export async function sendVerificationEmail(email, token) {
  const url =`${process.env.APP_URL}/verify-email.html?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Verify Your Zion Blog Account",
    html: `
      <h1>Welcome to Zion Blog</h1>

      <p>
        Thanks for creating your account.
        Please verify your email address to activate your account.
      </p>

      <p>
        <a href="${url}">
          Verify Your Email
        </a>
      </p>

      <p>
        This verification link expires in 24 hours.
      </p>

      <p>
        If you did not create this account, you can safely ignore this email.
      </p>
    `
  });
}

export async function sendPasswordResetEmail(email, token) {
  const url = `${process.env.APP_URL}/reset-password.html?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Reset Your Zion Blog Password",
    html: `
      <h1>Reset Your Password</h1>

      <p>
        We received a request to reset your Zion Blog password.
      </p>

      <p>
        <a href="${url}">
          Reset Your Password
        </a>
      </p>

      <p>
        This link expires in 15 minutes.
      </p>

      <p>
        If you did not request a password reset, you can safely ignore this email.
      </p>
    `
  });
}