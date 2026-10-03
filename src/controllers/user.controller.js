import { prisma } from "../config/prismaClient.js";
import {
  generateToken,
  hashToken
} from "../utils/crypto.js";

import {
  sendVerificationEmail,
} from "../services/email.service.js";

// GET /api/users/me
// Logged-in user's account information
export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id
      },

      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,

        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}


// GET /api/users/:username
// Public author profile
export async function getUserProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: req.params.username
      },

      select: {
        id: true,
        username: true,
        createdAt: true,

        posts: {
          where: {
            published: true
          },

          select: {
            id: true,
            title: true,
            slug: true,
            content: true,
            createdAt: true,
            updatedAt: true,

            _count: {
              select: {
                comments: true
              }
            }
          },

          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}


// GET /api/users/me/posts
// All posts belonging to logged-in user
export async function getMyPosts(req, res, next) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: req.user.id
      },

      include: {
        _count: {
          select: {
            comments: true
          }
        }
      },

      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(posts);
  } catch (error) {
    next(error);
  }
}


// PATCH /api/users/me
// Update username/email
export async function updateProfile(req, res, next) {
  try {
    const { username, email } = req.body;
    const data = {};
    if (username !== undefined) data.username = username;

    const emailChanged = email !== undefined && email !== req.user.email;
    if (emailChanged) {
      data.email = email;
      data.emailVerified = false;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, email: true, username: true, role: true, emailVerified: true, createdAt: true, updatedAt: true }
    });

    if (emailChanged) {
      const token = generateToken(32);
      await prisma.verificationToken.create({
        data: { tokenHash: hashToken(token), userId: req.user.id, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
      });
      // if this throws, let it hit the outer catch → next(error). Do NOT delete the user.
      await sendVerificationEmail(data.email, token);
      return res.json({ message: "Profile updated. Check your email to verify the new address.", user });
    }

    return res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    next(error);
  }
}