import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: true
    },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video', 'document'], default: 'image' }
      }
    ],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    replies: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
