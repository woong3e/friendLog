import { create } from 'zustand';

interface PostState {
  title: string;
  content: string;
  imageUrlArr: string[];
  thumbnailUrl: string;
  nickname: string;
  contentSummary: string;
  created_at: string;
  email: string;
  isEdit: boolean;
  eventDate: string | null;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setImageUrlArr: (imageUrlArr: string | string[]) => void;
  setThumbnailUrl: (thumbnail: string) => void;
  setNickname: (nickname: string) => void;
  setContentSummary: (content_description: string) => void;
  setCreated_At: (created_at: string) => void;
  setEmail: (email: string) => void;
  setIsEdit: (isEdit: boolean) => void;
  setEventDate: (eventDate: string | null) => void;
}

export const usePostStore = create<PostState>((set) => ({
  title: '',
  content: '',
  imageUrlArr: [],
  thumbnailUrl: '',
  nickname: '',
  contentSummary: '',
  created_at: '',
  email: '',
  isEdit: false,
  eventDate: null,
  setTitle: (title) => set({ title }),
  setContent: (content) => set({ content }),
  setImageUrlArr: (publicUrl) =>
    set((state) => ({ imageUrlArr: [...state.imageUrlArr, ...(Array.isArray(publicUrl) ? publicUrl : [publicUrl])] })), 
  setThumbnailUrl: (thumbnailUrl) => set({ thumbnailUrl }),
  setNickname: (nickname) => set({ nickname }),
  setContentSummary: (contentSummary) => set({ contentSummary }),
  setCreated_At: (created_at) => set({ created_at }),
  setEmail: (email) => set({ email }),
  setIsEdit: (isEdit) => set({ isEdit }),
  setEventDate: (eventDate) => set({ eventDate }),
}));
