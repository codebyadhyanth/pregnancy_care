import { create } from "zustand";
import authService from "../services/authService";
import { toast } from "react-hot-toast";

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,

    signup: async (userData) => {
        set({ isSigningUp: true });
        try {
            const response = await authService.signup(userData);
            set({ user: response.user, isAuthenticated: true });
            toast.success("Account created successfully");
        } catch (error) {
            console.error("Signup error:", error);
            toast.error(error.response?.data?.message || "Error creating account");
            throw error;
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (credentials) => {
        set({ isLoggingIn: true });
        try {
            const response = await authService.login(credentials);
            // Ensure we store the full user object including isOnboarded
            set({ user: response.user, isAuthenticated: true });
            toast.success("Logged in successfully");
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.response?.data?.message || "Error logging in");
            throw error;
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await authService.logout();
            set({ user: null, isAuthenticated: false });
            toast.success("Logged out successfully");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error(error.response?.data?.message || "Error logging out");
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            const response = await authService.getCurrentUser();
            set({ user: response.user, isAuthenticated: true });
        } catch (error) {
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ isCheckingAuth: false });
        }
    },
}));
