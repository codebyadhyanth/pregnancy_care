import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        summary: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ["health", "nutrition", "exercise", "general"],
            default: "general"
        },
        trimester: {
            type: Number,
            min: 1,
            max: 3
        },
        image: {
            type: String, // URL or placeholder
            default: "https://images.unsplash.com/photo-1555243896-c709bfa0b564?auto=format&fit=crop&q=80&w=800"
        }
    },
    { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
