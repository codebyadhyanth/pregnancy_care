import Post from "../models/post.model.js";

// Create Post with Media
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    let media = [];

    if (req.files && req.files.length > 0) {
      media = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        type: file.mimetype.startsWith('image') ? 'image' : file.mimetype.startsWith('video') ? 'video' : 'document'
      }));
    }

    const post = await Post.create({
      user: req.user._id,
      content,
      media
    });

    const populatedPost = await Post.findById(post._id).populate("user", "name");

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Posts
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name") // Ensure user fields exist
      .populate({
        path: "replies.user",
        select: "name"
      })
      .sort({ createdAt: -1 });

    if (!posts) {
      return res.json([]);
    }

    res.json(posts);
  } catch (error) {
    console.error("Fetch posts error:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

// Like/Unlike Post
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check if user already liked
    if (post.likes.includes(req.user._id)) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Like
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reply to Post
export const replyPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newReply = {
      user: req.user._id,
      content,
      createdAt: new Date()
    };

    post.replies.push(newReply);
    await post.save();

    // Re-fetch to populate user details for the new reply (or just send back simple confirmation and let frontend refresh)
    // Better to return the full list of replies with populated users or just the single reply.
    // For simplicity, let's return the updated post with populated replies 
    const updatedPost = await Post.findById(req.params.id).populate("replies.user", "name");

    res.json(updatedPost.replies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id, // ensures user deletes only their own post
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found or not authorized",
      });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





