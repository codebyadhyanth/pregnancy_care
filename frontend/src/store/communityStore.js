import { create } from "zustand";
import communityService from "../services/communityService";
import { toast } from "react-hot-toast";

export const useCommunityStore = create((set, get) => ({
    posts: [],
    isLoading: false,

    fetchPosts: async () => {
        set({ isLoading: true });
        try {
            const response = await communityService.getPosts();
            set({ posts: response.posts || [] });
        } catch (error) {
            console.error("Fetch posts error:", error);
            toast.error("Failed to fetch community posts");
        } finally {
            set({ isLoading: false });
        }
    },

    createPost: async (content) => {
        try {
            const response = await communityService.createPost(content);
            const newPost = response.post;
            // Optimistic update or refetch? Optimistic usually better for UX
            // But response contains populated user? Let's assume response is full post object
            set((state) => ({ posts: [newPost, ...state.posts] }));
            toast.success("Post created!");
        } catch (error) {
            console.error("Create post error:", error);
            toast.error(error.response?.data?.message || "Failed to create post");
        }
    },

    deletePost: async (id) => {
        try {
            await communityService.deletePost(id);
            set((state) => ({
                posts: state.posts.filter((post) => post._id !== id),
            }));
            toast.success("Post deleted");
        } catch (error) {
            console.error("Delete post error:", error);
            toast.error(error.response?.data?.message || "Failed to delete post");
        }
    }
}));
