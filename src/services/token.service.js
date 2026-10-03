import jwt from "jsonwebtoken";
import { prisma } from "../config/prismaClient.js";
import { generateToken, hashToken } from "../utils/crypto.js";

export function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
    }
  );
}

export async function createRefreshToken(userId) {
  const rawToken = generateToken(64);

  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() +
      Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 7)
  );

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt
    }
  });

  return rawToken;
}