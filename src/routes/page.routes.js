import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, "../../public");

// Public pages
router.get("/", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
});

router.get("/login", (req, res) => {
    res.sendFile(path.join(publicDir, "login.html"));
});

router.get("/register", (req, res) => {
    res.sendFile(path.join(publicDir, "register.html"));
});

router.get("/forgot-password", (req, res) => {
    res.sendFile(path.join(publicDir, "forgot-password.html"));
});

router.get("/reset-password", (req, res) => {
    res.sendFile(path.join(publicDir, "reset-password.html"));
});

router.get("/verify-email", (req, res) => {
    res.sendFile(path.join(publicDir, "verify-email.html"));
});

router.get("/post/:slug", (req, res) => {
    res.sendFile(path.join(publicDir, "post.html"));
});

// Authenticated pages
router.get("/profile", (req, res) => {
    res.sendFile(path.join(publicDir, "profile.html"));
});

router.get("/change-password", (req, res) => {
    res.sendFile(path.join(publicDir, "change-password.html"));
});

router.get("/create-post", (req, res) => {
    res.sendFile(path.join(publicDir, "create-post.html"));
});

router.get("/edit-post/:slug", (req, res) => {
  res.sendFile(path.join(publicDir, "edit-post.html"));
});

// Admin pages
router.get("/admin", (req, res) => {
    res.sendFile(path.join(publicDir, "admin.html"));
});

router.get("/users/:username", (req, res) => {
    res.sendFile(path.join(publicDir, "users.html"));
});

export { router as pageRoutes };