import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';
import { AUTH_STORAGE_KEY, TOKEN_KEY } from '../utils/constants';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      role: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = await authService.login(email, password);
          localStorage.setItem(TOKEN_KEY, data.token);
          set({
            token: data.token,
            role: data.role,
            user: { nomComplet: data.nomComplet, email },
            isLoading: false,
          });
          return data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },


      logout: async () => {
        try {
          await authService.logout();
        } finally {
          localStorage.removeItem(TOKEN_KEY);
          set({ token: null, user: null, role: null, isLoading: false });
        }
      },

      setAuth: ({ token, role, user }) => {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        set({ token, role, user });
      },

      isAuthenticated: () => {
        const { token } = get();
        return Boolean(token || localStorage.getItem(TOKEN_KEY));
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        role: state.role,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          localStorage.setItem(TOKEN_KEY, state.token);
        }
      },
    },
  ),
);
