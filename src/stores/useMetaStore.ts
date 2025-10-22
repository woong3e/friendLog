import { User } from '@supabase/supabase-js';
import { create } from 'zustand';

interface MetaState {
  userMeta: User | null;
  avatarImageUrl: string;
  editedNickname: string;
  setUserMeta: (userMeta: User | null) => void;
  setAvatarImageUrl: (avatarImageUrl: string) => void;
  setEditedNickname: (editedNickname: string) => void;
}

export const useMetaStore = create<MetaState>((set) => ({
  userMeta: null,
  avatarImageUrl: '',
  editedNickname: '',
  setUserMeta: (userMeta) => set({ userMeta }),
  setAvatarImageUrl: (avatarImageUrl) => set({ avatarImageUrl }),
  setEditedNickname: (editedNickname) => set({ editedNickname }),
}));
