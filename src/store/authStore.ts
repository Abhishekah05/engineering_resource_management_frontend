import { create } from 'zustand';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'engineer' | 'manager';
  skills: string[];
  seniority: 'junior' | 'mid' | 'senior';
  maxCapacity: number;
  department: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user: User, token: string) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
  setUser: (user: User) => set((state) => ({ ...state, user })),
})); 