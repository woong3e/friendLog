import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../stores/useThemeStore';
import supabase from '../utils/supabase';
import { useParams } from 'react-router-dom';

const ToastViewer = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const isDark = useThemeStore((state) => state.isDark);
  const [post, setPost] = useState('');
  const { id } = useParams();

  useEffect(() => {
    const getPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        console.error(error);
        return;
      }
      if (data) {
        setPost(data);
        console.log(post);
      }
    };
    getPosts();
  }, [id]);

  useEffect(() => {
    if (divRef.current && post) {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }

      viewerRef.current = new Viewer({
        el: divRef.current,
        height: '90svh',
        theme: isDark ? 'dark' : 'light',
        viewer: true,
        initialValue: post.content,
      });
    }
  }, [isDark, post]);

  return (
    <>
      <div className="flex flex-col">
        <h1 className="flex justi">
          <p className="text-4xl font-bold">{post.title}</p>
        </h1>
        <div ref={divRef}></div>
      </div>
    </>
  );
};
export default ToastViewer;
