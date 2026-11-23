import { create } from 'zustand';
import type { AuthSession } from '../api/auth';

interface AuthState {
  session: AuthSession | null;
  isInitialized: boolean;
  setSession: (session: AuthSession | null) => void;
  setInitialized: (isInitialized: boolean) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isInitialized: false,
  setSession: (session) => set({ session }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  clearSession: () => set({ session: null }),
}));
