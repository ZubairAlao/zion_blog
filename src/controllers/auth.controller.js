import bcrypt from "bcryptjs";

import {prisma} from "../config/prismaClient.js"
import {
  generateToken,
  hashToken
} from "../utils/crypto.js";

import {
  createAccessToken,
  createRefreshToken
} from "../services/token.service.js";

import {
  sendVerificationEmail,
  sendPasswordResetEmail
} from "../services/email.service.js";

import { refreshCookieOptions } from "../utils/cookies.js";

export async function register(req, res, next) {
  try {
    const {
      email,
      username,
      password
    } = req.body;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existing) {
      return res.status(409).json({
        message: "Email or username already exists"
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash
      }
    });

    try {
      const token = generateToken(32);

      await prisma.verificationToken.create({
        data: {
          tokenHash: hashToken(token),
          userId: user.id,
          expiresAt: new Date(
            Date.now() + 24 * 60 * 60 * 1000
          )
        }
      });

      await sendVerificationEmail(
        user.email,
        token
      );

      res.status(201).json({
        message:
          "Account created. Check your email."
      });
    } catch (emailError) {
      await prisma.user.delete({
        where: {
          id: user.id
        }
      });

      console.error(
        "Verification email failed:",
        emailError
      );

      return res.status(500).json({
        message:
          "We could not send the verification email. Your account was not created. Please try again."
      });
    }
    
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
    try {
      const {
        email,
        password
      } = req.body;
  
      const user = await prisma.user.findUnique({
        where: { email }
      });
  
      if (!user) {
        return res.status(401).json({
          message: "Invalid credentials"
        });
      }
  
      const passwordMatches =
        await bcrypt.compare(
          password,
          user.passwordHash
        );
  
      if (!passwordMatches) {
        return res.status(401).json({
          message: "Invalid credentials"
        });
      }
  
      if (!user.emailVerified) {
        return res.status(403).json({
          message: "Verify your email first"
        });
      }
  
      const accessToken =
        createAccessToken(user);
  
      const refreshToken =
        await createRefreshToken(user.id);
  
      res.cookie(
        "refreshToken",
        refreshToken,
        refreshCookieOptions
      );
  
      res.json({
        message: "Login successful",
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          emailVerified: user.emailVerified
        }
      });
    } catch (error) {
      next(error);
    }
  }  

export async function refresh(req, res, next) {
  try {
    const rawToken = req.cookies.refreshToken;

    if (!rawToken) {
      return res.status(401).json({
        message: "Refresh token missing"
      });
    }

    const tokenHash = hashToken(rawToken);

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({
        message: "Invalid refresh token"
      });
    }

    const newAccessToken = createAccessToken(stored.user);

    const newRawRefreshToken =
      await createRefreshToken(stored.userId);

    await prisma.refreshToken.delete({
      where: {
        id: stored.id
      }
    });

    res.cookie(
      "refreshToken",
      newRawRefreshToken,
      refreshCookieOptions
    );

    res.json({
      accessToken: newAccessToken
    });

  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
    try {
      const rawToken =
        req.cookies.refreshToken;
  
      if (rawToken) {
        await prisma.refreshToken.deleteMany({
          where: {
            tokenHash: hashToken(rawToken)
          }
        });
      }
  
      
      res.clearCookie("refreshToken", refreshCookieOptions);
  
      res.json({
        message: "Logged out"
      });
    } catch (error) {
      next(error);
    }
  } 

  export async function resendVerification(req, res, next) {
    const { email } = req.body;
  
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });
  
      if (!user) {
        return res.json({
          message: "If an account exists with this email, a verification email has been sent."
        });
      }
  
      if (user.emailVerified) {
        return res.json({
          message: "If an account exists with this email, a verification email has been sent."
        });
      }
  
      await prisma.verificationToken.deleteMany({
        where: { userId: user.id }
      });
  
      const token = generateToken(32);
  
      await prisma.verificationToken.create({
        data: {
          tokenHash: hashToken(token),
          userId: user.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });
  
      await sendVerificationEmail(user.email, token);
  
      return res.json({
        message: "If an account exists with this email, a verification email has been sent."
      });
  
    } catch (error) {
      next(error);
    }
  }

export async function verifyEmail(req, res, next) {
    try {
      const { token } = req.body;
  
      const verificationToken =
        await prisma.verificationToken.findUnique({
          where: {
            tokenHash: hashToken(token)
          }
        });
  
      if (
        !verificationToken ||
        verificationToken.expiresAt < new Date()
      ) {
        return res.status(400).json({
          message: "Invalid or expired token"
        });
      }
  
      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: verificationToken.userId
          },
          data: {
            emailVerified: true
          }
        }),
  
        prisma.verificationToken.delete({
          where: {
            id: verificationToken.id
          }
        })
      ]);
  
      res.json({
        message: "Email verified"
      });
    } catch (error) {
      next(error);
    }
}

export async function forgotPassword(
    req,
    res,
    next
  ) {
    try {
      const { email } = req.body;
  
      const user =
        await prisma.user.findUnique({
          where: { email }
        });
  
      // Do not reveal whether an account exists.
      if (!user) {
        return res.json({
          message:
            "If that email exists, a reset link has been sent."
        });
      }
  
      await prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id
        }
      });
  
      const token =
        generateToken(32);
  
      await prisma.passwordResetToken.create({
        data: {
          tokenHash: hashToken(token),
          userId: user.id,
          expiresAt: new Date(
            Date.now() + 15 * 60 * 1000
          )
        }
      });
  
      await sendPasswordResetEmail(
        user.email,
        token
      );
  
      res.json({
        message:
          "If that email exists, a reset link has been sent."
      });
    } catch (error) {
      next(error);
    }
  }


  export async function resetPassword(
    req,
    res,
    next
  ) {
    try {
      const {
        token,
        password
      } = req.body;
  
      const reset =
        await prisma.passwordResetToken.findUnique({
          where: {
            tokenHash: hashToken(token)
          }
        });
  
      if (
        !reset ||
        reset.expiresAt < new Date()
      ) {
        return res.status(400).json({
          message:
            "Invalid or expired reset token"
        });
      }
  
      const passwordHash =
        await bcrypt.hash(password, 12);
  
      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: reset.userId
          },
          data: {
            passwordHash
          }
        }),
  
        prisma.passwordResetToken.delete({
          where: {
            id: reset.id
          }
        }),
  
        // Kill existing refresh sessions.
        prisma.refreshToken.deleteMany({
          where: {
            userId: reset.userId
          }
        })
      ]);
  
      res.json({
        message:
          "Password reset successfully"
      });
    } catch (error) {
      next(error);
    }
  }

export async function changePassword(
    req,
    res,
    next
  ) {
    try {
      const {
        currentPassword,
        newPassword
      } = req.body;
  
      const user =
        await prisma.user.findUnique({
          where: {
            id: req.user.id
          }
        });
  
      const valid =
        await bcrypt.compare(
          currentPassword,
          user.passwordHash
        );
  
      if (!valid) {
        return res.status(400).json({
          message:
            "Current password is incorrect"
        });
      }
  
      const passwordHash =
        await bcrypt.hash(
          newPassword,
          12
        );
  
      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            passwordHash
          }
        }),
  
        prisma.refreshToken.deleteMany({
          where: {
            userId: user.id
          }
        })
      ]);
  
      res.json({
        message:
          "Password changed. Please log in again."
      });
    } catch (error) {
      next(error);
    }
  }

  export async function deleteAccount(
    req,
    res,
    next
  ) {
    try {
      await prisma.user.delete({
        where: {
          id: req.user.id
        }
      });
  
      res.clearCookie("refreshToken", refreshCookieOptions);
  
      res.json({
        message:
          "Account permanently deleted"
      });
    } catch (error) {
      next(error);
    }
  }

