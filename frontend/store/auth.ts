import { create } from "zustand";
import type { User } from "@/types/auth";

const TOKEN_KEY = "signalx_token";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ user, token, isLoading: false });
  },

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null, isLoading: false });
  },

  setLoading: (v) => set({ isLoading: v }),
}));
