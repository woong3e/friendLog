export interface Post {
  title: string;
  content: string;
  rating: number | null;
  image_url: string | null;
  thumbnail_url: string | null;
  content_summary: string | null;
  created_at: string;
  nickname: string;
}

import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import '../styles/custom-toast-editor-dark.css';
import supabase from '../utils/supabase';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useThemeStore } from '../stores/useThemeStore';
import { usePostStore } from '../stores/usePostStore';
import { useAuthStore } from '../stores/useAuthStore';
import FAB from '../components/FAB';
import StarRatings from '../components/StarRatings';
import CommentSection from '../components/CommentSection';
import DeleteModal from '../components/DeleteModal';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
dayjs.extend(relativeTime);
dayjs.locale('ko');

const ToastViewer = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef(null);
  const isDark = useThemeStore((state) => state.isDark);
  const { id } = useParams();
  const [visible, setVisible] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const {
    title,
    content,
    nickname,
    created_at,
    isEdit,
    setTitle,
    setContent,
    setImageUrlArr,
    setThumbnailUrl,
    setNickname,
    setContentSummary,
    setCreated_At,
    setIsEdit,
  } = usePostStore();
  const navigate = useNavigate();

  const { session } = useAuthStore();

  useEffect(() => {
    console.log(session?.user.email);
  }, []);

  useEffect(() => {
    getPosts();
  }, [id]);

  useEffect(() => {
    if (isEdit) {
      navigate(`/editor?id=${id}`);
    }
  }, [isEdit]);

  useEffect(() => {
    if (divRef.current && title) {
      divRef.current.classList.remove('toastui-editor-dark');
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }

      viewerRef.current = new Viewer({
        el: divRef.current,
        height: '90dvh',
        theme: isDark ? 'dark' : 'light',
        viewer: true,
        initialValue: content,
      });
    }
  }, [isDark, content]);

  const getPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', Number(id))
      .single();
    if (error) {
      console.error(error);
      return;
    }
    if (data) {
      setTitle(data?.title);
      setContent(data.content);
      setImageUrlArr(data.image_url);
      setThumbnailUrl(data?.thumbnail_url);
      setNickname(data.nickname);
      setCreated_At(data.created_at);
      setContentSummary(data?.content_summary);
    }
  };

  const handlePostUpdate = () => {
    setIsEdit(true);
  };

  return (
    <>
      <div
        className="flex flex-col px-2 mx-auto md:w-3xl h-dvh my-3 relative"
      >
        <div>
          <h1 className="flex">
            <p className="text-4xl font-bold">{title}</p>
          </h1>
          {session?.user.user_metadata.nickname === nickname ? (
            <div className="flex justify-end gap-3">
              <button
                className="text-gray-400 hover:text-green-600 cursor-pointer"
                onClick={handlePostUpdate}
              >
                수정
              </button>
              <button
                className="text-gray-400 hover:text-red-600 cursor-pointer"
                onClick={() => {
                  setOpenDeleteModal(true);
                }}
              >
                삭제
              </button>
            </div>
          ) : null}
          <div className="flex gap-1">
            <p>{nickname}</p>
            <p>·</p>
            <p>{dayjs(created_at).fromNow()}</p>
          </div>
        </div>
        <div ref={divRef} className="flex justify-around"></div>
        <hr className="h-px my-6 bg-gray-200 border-px dark:bg-gray-700" />
        <StarRatings />
        <CommentSection />
      </div>
      <FAB visible={visible} setVisible={setVisible} />
      <DeleteModal
        openDeleteModal={openDeleteModal}
        setOpenDeleteModal={setOpenDeleteModal}
      />
    </>
  );
};

export default ToastViewer;
