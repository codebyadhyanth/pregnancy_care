import axios from 'axios';

const getBaseUrl = () => {
    let base = process.env.OLLAMA_API_BASE || 'http://localhost:11434/api';
    if (base.endsWith('/')) base = base.slice(0, -1);
    return base;
};

const getHeaders = () => {
    const headers = {};
    if (process.env.OLLAMA_API_KEY) {
        headers['Authorization'] = `Bearer ${process.env.OLLAMA_API_KEY.trim()}`;
    }
    return headers;
};

// Cache the working model to avoid repeated lookups
let cachedModel = null;

const fetchAvailableModel = async () => {
    try {
        const baseUrl = getBaseUrl();
        // Standard Ollama endpoint to list models
        const url = `${baseUrl}/tags`;
        const response = await axios.get(url, { headers: getHeaders() });

        if (response.data && response.data.models && response.data.models.length > 0) {
            // Return the name of the first available model
            console.log("Auto-detected available model:", response.data.models[0].name);
            return response.data.models[0].name;
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch available models:", error.message);
        return null;
    }
};

export const generateAIResponse = async (prompt, model = null) => {
    const baseUrl = getBaseUrl();
    const generateUrl = `${baseUrl}/generate`;
    const headers = getHeaders();

    // 1. Determine target model
    let targetModel = model || process.env.OLLAMA_MODEL || cachedModel || 'mistral';

    // Helper to perform the request
    const performRequest = async (modelToUse) => {
        return axios.post(generateUrl, {
            model: modelToUse,
            prompt: prompt,
            stream: false
        }, { headers });
    };

    try {
        // 2. Try with the determined target model
        const response = await performRequest(targetModel);
        // If successful, cache it if it wasn't already
        if (!cachedModel) cachedModel = targetModel;
        return response.data.response;

    } catch (error) {
        // 3. Handle Model Not Found (404) by attempting auto-discovery
        const isModelError = error.response && (error.response.status === 404 || error.response.status === 400);

        if (isModelError && !cachedModel) {
            console.log(`Model '${targetModel}' failed. Attempting to auto-detect available models...`);

            const detectedModel = await fetchAvailableModel();

            if (detectedModel && detectedModel !== targetModel) {
                try {
                    // Retry with detected model
                    const retryResponse = await performRequest(detectedModel);
                    cachedModel = detectedModel; // Update cache
                    return retryResponse.data.response;
                } catch (retryError) {
                    console.error("Retry with detected model failed:", retryError.message);
                }
            }
        }

        console.error("AI Service Error:", error.message);
        if (error.response) {
            console.error("Data:", error.response.data);
        }
        return "AI service is currently unavailable. Please try again later.";
    }
};
