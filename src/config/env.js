import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "ACCESS_TOKEN_EXPIRES_IN",
  "REFRESH_TOKEN_EXPIRES_IN_DAYS",
  "SESSION_SECRET",
  "APP_URL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "SMTP_FROM"
];

for (const name of requiredEnv) {
  if (!process.env[name]) {
    throw new Error(
      `Missing required environment variable: ${name}`
    );
  }
}