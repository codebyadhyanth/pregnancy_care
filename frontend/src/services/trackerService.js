import api from "./api";

const trackerService = {
    // Medication
    getMedications: async () => {
        const response = await api.get("/tracker/medication");
        return response.data;
    },
    addMedication: async (data) => {
        const response = await api.post("/tracker/medication", data);
        return response.data;
    },
    deleteMedication: async (id) => {
        const response = await api.delete(`/tracker/medication/${id}`);
        return response.data;
    },

    // Exercise
    getExercises: async () => {
        const response = await api.get("/tracker/exercise");
        return response.data;
    },
    addExercise: async (data) => {
        const response = await api.post("/tracker/exercise", data);
        return response.data;
    },
    deleteExercise: async (id) => {
        const response = await api.delete(`/tracker/exercise/${id}`);
        return response.data;
    },
};

export default trackerService;
