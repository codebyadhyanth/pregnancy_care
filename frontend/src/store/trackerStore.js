import { create } from "zustand";
import trackerService from "../services/trackerService";
import { toast } from "react-hot-toast";

export const useTrackerStore = create((set) => ({
    medications: [],
    exercises: [],
    isLoading: false,

    // Medication Actions
    fetchMedications: async () => {
        set({ isLoading: true });
        try {
            const response = await trackerService.getMedications();
            set({ medications: response.medications || [] });
        } catch (error) {
            console.error("Fetch medications error:", error);
            toast.error("Failed to fetch medications");
        } finally {
            set({ isLoading: false });
        }
    },

    addMedication: async (medicationData) => {
        try {
            const response = await trackerService.addMedication(medicationData);
            set((state) => ({ medications: [...state.medications, response.medication] }));
            toast.success("Medication added");
        } catch (error) {
            console.error("Add medication error:", error);
            toast.error(error.response?.data?.message || "Failed to add medication");
        }
    },

    deleteMedication: async (id) => {
        try {
            await trackerService.deleteMedication(id);
            set((state) => ({
                medications: state.medications.filter((m) => m._id !== id),
            }));
            toast.success("Medication deleted");
        } catch (error) {
            console.error("Delete medication error:", error);
            toast.error("Failed to delete medication");
        }
    },

    // Exercise Actions
    fetchExercises: async () => {
        set({ isLoading: true });
        try {
            const response = await trackerService.getExercises();
            set({ exercises: response.exercises || [] });
        } catch (error) {
            console.error("Fetch exercises error:", error);
            toast.error("Failed to fetch exercises");
        } finally {
            set({ isLoading: false });
        }
    },

    addExercise: async (exerciseData) => {
        try {
            const response = await trackerService.addExercise(exerciseData);
            set((state) => ({ exercises: [...state.exercises, response.exercise] }));
            toast.success("Exercise added");
        } catch (error) {
            console.error("Add exercise error:", error);
            toast.error(error.response?.data?.message || "Failed to add exercise");
        }
    },

    deleteExercise: async (id) => {
        try {
            await trackerService.deleteExercise(id);
            set((state) => ({
                exercises: state.exercises.filter((e) => e._id !== id),
            }));
            toast.success("Exercise deleted");
        } catch (error) {
            console.error("Delete exercise error:", error);
            toast.error("Failed to delete exercise");
        }
    },
}));
