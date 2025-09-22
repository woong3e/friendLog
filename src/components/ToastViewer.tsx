interface ReviewModal {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import '../styles/custom-toast-editor-dark.css';
import { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../stores/useThemeStore';
import supabase from '../utils/supabase';
import { useParams } from 'react-router-dom';
import FAB from './FAB';
import StarRatings from './StarRatings';
import CommentSection from './CommentSection';

const ToastViewer = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const isDark = useThemeStore((state) => state.isDark);
  const [post, setPost] = useState('');
  const { id } = useParams();
  const [visible, setVisible] = useState<boolean>(false);

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
      }
    };
    getPosts();
  }, [id]);

  useEffect(() => {
    if (divRef.current && post) {
      divRef.current.classList.remove('toastui-editor-dark');
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
      <div className="flex flex-col px-2 mx-auto my-0 md:w-3xl">
        <h1 className="flex">
          <p className="text-4xl font-bold">{post.title}</p>
        </h1>
        <div ref={divRef} className="flex justify-around"></div>
        <hr className="h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" />
        <StarRatings />
        <CommentSection />
      </div>
      <FAB visible={visible} setVisible={setVisible} />
    </>
  );
};
export default ToastViewer;
