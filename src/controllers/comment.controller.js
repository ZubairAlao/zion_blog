import { prisma } from "../config/prismaClient.js";


// POST /api/posts/:postId/comments
export async function createComment(req, res, next) {
  try {
    const {
      content
    } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty"
      });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: req.params.postId
      }
    });

    if (!post || !post.published) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: req.user.id,
        postId: post.id
      },

      include: {
        author: {
          select: {
            username: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
}


// GET /api/posts/:postId/comments
export async function getPostComments(req, res, next) {
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: req.params.postId
      },

      select: {
        id: true,
        published: true
      }
    });

    if (!post || !post.published) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId: post.id
      },

      include: {
        author: {
          select: {
            username: true
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


// PATCH /api/comments/:id
export async function updateComment(req, res, next) {
  try {
    const {
      content
    } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty"
      });
    }

    const comment = await prisma.comment.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }

    if (comment.authorId !== req.user.id) {
      return res.status(403).json({
        message: "You can only edit your own comment"
      });
    }

    const updatedComment =
      await prisma.comment.update({
        where: {
          id: comment.id
        },

        data: {
          content: content.trim()
        },

        include: {
          author: {
            select: {
              username: true
            }
          }
        }
      });

    res.json(updatedComment);
  } catch (error) {
    next(error);
  }
}


// DELETE /api/comments/:id
export async function deleteComment(req, res, next) {
  try {
    const comment = await prisma.comment.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }

    if (comment.authorId !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete your own comment"
      });
    }

    await prisma.comment.delete({
      where: {
        id: comment.id
      }
    });

    res.json({
      message: "Comment deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}