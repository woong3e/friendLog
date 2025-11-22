import { create } from "zustand";

interface profileState {
  nickname: string | null;
  email: string;
  avatarImageUrl: string | null;
  setNickname: (nickname: string | null) => void;
  setEmail: (email: string) => void;
  setAvatarImageUrl: (avatarImageUrl: string | null) => void;
}

export const useProfileStore = create<profileState>((set) => ({
  nickname: null,
  email: '',
  avatarImageUrl: null,
  setNickname: (nickname) => set({ nickname }),
  setEmail: (email) => set({ email }),
  setAvatarImageUrl: (avatarImageUrl) => set({ avatarImageUrl }),
}));
