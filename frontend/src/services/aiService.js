import api from "./api";

const aiService = {
    getAdvice: async (prompt) => {
        const response = await api.post("/ai/advice", { prompt });
        return response.data; // Expected { response: "AI advice..." }
    },
};

export default aiService;
