import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../stores/useThemeStore';
import supabase from '../utils/supabase';

const ToastViewer = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const isDark = useThemeStore((state) => state.isDark);
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    const getPosts = async () => {
      const { data, error } = await supabase.from('posts').select('*');
      if (error) {
        console.error(error);
        return;
      }
      if (data && data.length > 0) {
        setContent(data[0].content);
      }
    };
    getPosts();
  }, []);

  useEffect(() => {
    if (divRef.current && content) {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }

      viewerRef.current = new Viewer({
        el: divRef.current,
        height: '90svh',
        theme: isDark ? 'dark' : 'light',
        viewer: true,
        initialValue: content,
      });
    }
  }, [isDark, content]);

  return <div ref={divRef}></div>;
};
export default ToastViewer;
