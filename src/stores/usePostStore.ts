import { create } from 'zustand';

interface PostState {
  title: string;
  content: string;
  imageUrlArr: string[];
  thumbnailUrl: string;
  nickname: string;
  contentSummary: string;
  created_at: string;
  isEdit: boolean;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setImageUrlArr: (imageUrlArr: string[]) => void;
  setThumbnailUrl: (thumbnail: string) => void;
  setNickname: (nickname: string) => void;
  setContentSummary: (content_description: string) => void;
  setCreated_At: (created_at: string) => void;
  setIsEdit: (isEdit: boolean) => void;
}

export const usePostStore = create<PostState>((set) => ({
  title: '',
  content: '',
  imageUrlArr: [],
  thumbnailUrl: '',
  nickname: '',
  contentSummary: '',
  created_at: '',
  isEdit: false,
  setTitle: (title) => set({ title }),
  setContent: (content) => set({ content }),
  setImageUrlArr: (publicUrl) =>
    set((state) => ({ imageUrlArr: [...state.imageUrlArr, ...publicUrl] })),
  setThumbnailUrl: (thumbnailUrl) => set({ thumbnailUrl }),
  setNickname: (nickname) => set({ nickname }),
  setContentSummary: (contentSummary) => set({ contentSummary }),
  setCreated_At: (created_at) => set({ created_at }),
  setIsEdit: (isEdit) => set({ isEdit }),
}));
