import Blog from "../models/blog.model.js";

export const getBlogs = async (req, res) => {
    try {
        const { trimester, category } = req.query;
        let query = {};

        if (trimester) query.trimester = trimester;
        if (category) query.category = category;

        const blogs = await Blog.find(query).sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Optional: Seed/Create for testing (not explicitly requested but helpful)
export const createBlog = async (req, res) => {
    try {
        const blog = await Blog.create(req.body);
        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
