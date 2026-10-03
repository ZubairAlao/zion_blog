import { prisma } from "../config/prismaClient.js";


// GET ALL USERS
export async function getAllUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
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
      },

      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
}


// GET ALL POSTS
export async function getAllPosts(req, res, next) {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },

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


// GET ALL COMMENTS
export async function getAllComments(req, res, next) {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        },

        post: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },

      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(comments);
  } catch (error) {
    next(error);
  }
}


// DELETE USER
export async function deleteUser(req, res, next) {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting their own account
    if (userId === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete your own admin account"
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    await prisma.user.delete({
      where: {
        id: userId
      }
    });

    res.json({
      message: "User deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}


// DELETE POST
export async function deletePost(req, res, next) {
  try {
    const postId = req.params.id;

    const post = await prisma.post.findUnique({
      where: {
        id: postId
      }
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    await prisma.post.delete({
      where: {
        id: postId
      }
    });

    res.json({
      message: "Post deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}


// DELETE COMMENT
export async function deleteComment(req, res, next) {
  try {
    const commentId = req.params.id;

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId
      }
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }

    await prisma.comment.delete({
      where: {
        id: commentId
      }
    });

    res.json({
      message: "Comment deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}