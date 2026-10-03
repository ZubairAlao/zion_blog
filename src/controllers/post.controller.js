import { prisma } from "../config/prismaClient.js";

function generateSlug(title) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  }

export async function getPosts(req, res, next) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true
      },

      include: {
        author: {
          select: {
            username: true
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


export async function getPost(req, res, next) {
  try {
    const post = await prisma.post.findUnique({
      where: {
        slug: req.params.slug
      },

      include: {
        author: {
          select: {
            username: true
          }
        },

        comments: {
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
        }
      }
    });

    if (!post || !post.published) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
}

export async function createPost(req, res, next) {
  try {
    const {
      title,
      content,
    } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: "Title and content are required" });
    } 
    const slug = generateSlug(title); 
    
    const existingPost = await prisma.post.findUnique({ 
      where: { 
        slug
      } 
    }); 
      
    if (existingPost) { 
      return res.status(409).json({ message: "A post with this title already exists" }); 
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(), 
        content: content.trim(), 
        slug, published: true, 
        authorId: req.user.id
      },
      include: { 
        author: { 
          select: { 
            id: true, username: true 
          } 
        }
      }
    });

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
}

export async function updatePost(req, res, next) {
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    // Authorisation
    if (post.authorId !== req.user.id) {
      return res.status(403).json({
        message: "You can only edit your own posts"
      });
    }

    const { title, content } = req.body;

    const data = {};

    // Only update fields that were actually supplied
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Title cannot be empty"
        });
      }

      data.title = title.trim();
      data.slug = generateSlug(title);
    }

    if (content !== undefined) {
      if (!content.trim()) {
        return res.status(400).json({
          message: "Content cannot be empty"
        });
      }

      data.content = content.trim();
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        message: "Nothing to update"
      });
    }

    // Check slug collision only when title changed
    if (data.slug && data.slug !== post.slug) {
      const existingPost = await prisma.post.findUnique({
        where: {
          slug: data.slug
        }
      });

      if (existingPost && existingPost.id !== post.id) {
        return res.status(409).json({
          message: "A post with this title already exists"
        });
      }
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: post.id
      },

      data,

      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
}

export async function deletePost(req, res, next) {
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete your own posts"
      });
    }

    await prisma.post.delete({
      where: {
        id: post.id
      }
    });

    res.json({
      message: "Post deleted successfully"
    });
  } catch (error) {
    next(error);
  }
} 