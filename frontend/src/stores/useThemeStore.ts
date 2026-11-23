import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  setDark: (value: boolean) => void;
  toggleDark: () => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  let initialTheme = true;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme');
    if (saved) {
      initialTheme = saved === 'dark';
    } else {
      initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  }

  return {
    isDark: initialTheme,
    setDark: (value) => set({ isDark: value }),
    toggleDark: () =>
      set((state) => {
        const newTheme = !state.isDark;
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        return { isDark: newTheme };
      }),
  };
});
