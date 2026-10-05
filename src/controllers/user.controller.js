import { prisma } from "../config/prismaClient.js";
import {
  generateToken,
  hashToken
} from "../utils/crypto.js";
import bcrypt from "bcryptjs";

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


// PATCH /api/users/me/username
export async function updateUsername(req, res, next) {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        message: "Username is required"
      });
    }

    const user = await prisma.user.update({
      where: {
        id: req.user.id
      },
      data: {
        username
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.json({
      message: "Username updated successfully.",
      user
    });

  } catch (error) {
    next(error);
  }
}

// PATCH /api/users/me/email
export async function updateEmail(req, res, next) {
  try {
    const { email, currentPassword } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    if (!currentPassword) {
      return res.status(400).json({
        message: "Current password is required."
      });
    }

    if (email === req.user.email) {
      return res.status(400).json({
        message: "This is already your current email address."
      });
    }

    // Get the user's password hash
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    // Verify current password
    const passwordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!passwordValid) {
      return res.status(401).json({
        message: "Current password is incorrect."
      });
    }

    // Check whether the new email is already being used
    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email address is already in use."
      });
    }

    const token = generateToken(32);
    const tokenHash = hashToken(token);

    await prisma.$transaction(async (tx) => {

      // Invalidate previous verification tokens
      await tx.verificationToken.deleteMany({
        where: {
          userId: req.user.id
        }
      });

      // Change email and mark it as unverified
      await tx.user.update({
        where: {
          id: req.user.id
        },
        data: {
          email,
          emailVerified: false
        }
      });

      // Create new verification token
      await tx.verificationToken.create({
        data: {
          tokenHash,
          userId: req.user.id,
          expiresAt: new Date(
            Date.now() + 24 * 60 * 60 * 1000
          )
        }
      });
    });

    // Send verification email to the new address
    await sendVerificationEmail(email, token);

    return res.json({
      message:
        "Email updated. Check your new email address to verify it."
    });

  } catch (error) {
    next(error);
  }
}