import api from "./api";

const communityService = {
    getPosts: async () => {
        const response = await api.get("/community/posts");
        return response.data;
    },
    createPost: async (content) => {
        const response = await api.post("/community/post", { content });
        return response.data;
    },
    deletePost: async (id) => {
        const response = await api.delete(`/community/post/${id}`);
        return response.data;
    },
};

export default communityService;
