import { create } from 'zustand';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type State = {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
};

export const useAuth = create<State>((set) => ({
  user: null,
  loading: true,
  setUser: (u) => set({ user: u, loading: false }),
  logout: async () => {
    await signOut(auth);
    set({ user: null });
  }
}));

onAuthStateChanged(auth, (u) => useAuth.getState().setUser(u));

