import { create } from 'zustand';

interface PostState {
  title: string;
  content: string;
  imageUrlArr: string[];
  thumbnailUrl: string;
  userId: string;
  contentSummary: string;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setImageUrlArr: (imageUrlArr: string[]) => void;
  setThumbnailUrl: (thumbnail: string) => void;
  setContentSummary: (content_description: string) => void;
}

export const usePostStore = create<PostState>((set) => ({
  title: '',
  content: '',
  imageUrlArr: [],
  thumbnailUrl: '',
  userId: '',
  contentSummary: '',
  setTitle: (title) => set({ title }),
  setContent: (content) => set({ content }),
  setImageUrlArr: (publicUrl) =>
    set((state) => ({ imageUrlArr: [...state.imageUrlArr, ...publicUrl] })),
  setThumbnailUrl: (thumbnailUrl) => set({ thumbnailUrl }),
  setContentSummary: (contentSummary) => set({ contentSummary }),
}));
