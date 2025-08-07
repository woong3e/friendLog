interface PostPreviewModalProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { usePostStore } from '../stores/usePostStore';
import { useAuthStore } from '../stores/useAuthStore';
import supabase from '../utils/supabase';

import { useNavigate } from 'react-router-dom';

const PostPreviewModal = ({ visible, setVisible }: PostPreviewModalProps) => {
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const session = useAuthStore((state) => state.session);
  const navigate = useNavigate();
  const bucket = import.meta.env.VITE_PUBLIC_STORAGE_BUCKET;
  const {
    title,
    content,
    imageUrlArr,
    thumbnailUrl,
    userId,
    contentSummary,
    setThumbnailUrl,
    setContentSummary,
  } = usePostStore();

  useEffect(() => {
    if (visible) {
      setIsClosing(false);
    }
  }, [visible]);

  const handleAnimationEnd = () => {
    if (isClosing) {
      setVisible(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
  };

  if (!visible && !isClosing) return null;

  const onDrop = useCallback((acceptedFiles) => {
    console.log(acceptedFiles);
    onUploadThumbnail(acceptedFiles[0]);
  }, []);

  const onUploadThumbnail = async (file: File) => {
    uploadThumbnail(file);
  };

  const uploadThumbnail = async (file: File) => {
    const ext = file.type.split('/')[1];
    const fileName = `${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`thumbnail/${fileName}`, file, {
        contentType: file.type,
        upsert: true,
      });
    getThumbnailUrl(`thumbnail/${fileName}`);
  };

  const getThumbnailUrl = (filePath: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    setThumbnailUrl(data.publicUrl);
    return data.publicUrl;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    onDrop,
  });

  const handleContentSummary = (e) => {
    setContentSummary(e.target.value);
  };

  const postData = {
    title: title,
    content: content,
    image_url: imageUrlArr,
    thumbnail_url: thumbnailUrl,
    content_summary: contentSummary,
    nickname: session?.user.email?.split('@')[0],
  };

  const handlePublish = async () => {
    if (title === '') {
      alert('제목을 입력해주세요');
      return;
    }

    if (content === '') {
      alert('내용을 입력해주세요');
      return;
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .single();

    if (error) {
      console.error('Error Message: ', error);
    } else {
      console.log(data);
      navigate('/');
    }
  };

  return createPortal(
    <main
      className={`fixed top-0 left-0 w-full h-full z-1000 dark:bg-blue-950 flex justify-center
        ${visible && !isClosing ? 'animate-slideup' : ''}
        ${isClosing ? 'animate-slidedown' : ''}
        `}
      onAnimationEnd={handleAnimationEnd}
    >
      <section className="flex flex-col items-center justify-center w-full bg-blue-950">
        <h1 className="text-2xl font-bold">포스트 미리보기</h1>
        <div className="flex flex-col items-center justify-center w-full p-1 m-1 bg-blue-900 h-2/3">
          {thumbnailUrl && (
            <div className="flex justify-end w-full gap-5">
              <button className="cursor-pointer">재업로드</button>
              <button className="cursor-pointer">제거</button>
            </div>
          )}
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              className="flex flex-col items-center justify-center object-contain w-95/100 h-3/4"
            />
          ) : (
            <div
              className="flex flex-col items-center justify-center w-95/100 h-3/4"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <figure className="flex flex-col items-center justify-center w-full h-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-30 h-30"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
                {isDragActive ? (
                  <p>사진을 놓아주세요.</p>
                ) : (
                  <p>썸네일 사진을 드래그&드랍 or 클릭해서 선택하세요.</p>
                )}
              </figure>
            </div>
          )}
        </div>
        <p className="w-full">
          <textarea
            className="w-full px-4 py-3 mt-10 text-sm bg-blue-900 outline-none resize-none h-30 placeholder:text-center"
            placeholder="당신의 컨텐츠를 짧게 소개해보세요."
            onChange={handleContentSummary}
          ></textarea>
        </p>
        <div className="flex items-end justify-end w-full">
          <button
            type="button"
            className=" bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-1"
            onClick={handleClose}
          >
            취소
          </button>
          <button
            type="button"
            className="focus:outline-none  bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={handlePublish}
          >
            출간하기
          </button>
        </div>
      </section>
    </main>,
    document.getElementById('modal-root')!
  );
};

export default PostPreviewModal;
