interface EditorModalProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { usePostStore } from '../stores/usePostStore';
import supabase from '../utils/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

const EditorModal = ({ visible, setVisible }: EditorModalProps) => {
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const navigate = useNavigate();
  const bucket = import.meta.env.VITE_PUBLIC_STORAGE_BUCKET;
  const {
    title,
    content,
    imageUrlArr,
    thumbnailUrl,
    contentSummary,
    nickname,
    isEdit,
    setThumbnailUrl,
    setContentSummary,
    setNickname,
  } = usePostStore();
  const { session } = useAuthStore();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');

  useEffect(() => {
    const fetchNickname = async () => {
      if (session?.user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', session.user.id)
          .single();
        
        if (data?.nickname) {
          setNickname(data.nickname);
        } else {
          setNickname(session.user.user_metadata.nickname);
        }
      }
    };
    fetchNickname();
  }, [session]);

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
    await supabase.storage.from(bucket).upload(`thumbnail/${fileName}`, file, {
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
    image_url: JSON.stringify(imageUrlArr),
    thumbnail_url: thumbnailUrl,
    content_summary: contentSummary,
    nickname: nickname,
    email: session?.user?.email,
  };

  const handlePostPublish = async () => {
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

  const handlePostUpdate = async () => {
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
      .update(postData)
      .eq('id', Number(id));

    if (error) {
      console.error('Error Message: ', error);
    } else {
      console.log(data);
      navigate('/');
    }
  };

  return createPortal(
    <main
      className={`fixed top-0 left-0 w-full h-dvh z-1000 dark:bg-blue-950 flex justify-center overflow-hidden
        ${visible && !isClosing ? 'animate-slideup' : ''}
        ${isClosing ? 'animate-slidedown' : ''}
        `}
      onAnimationEnd={handleAnimationEnd}
    >
      <section className="flex flex-col items-center justify-center w-full bg-blue-950">
        <h1 className="text-2xl font-bold">포스트 미리보기</h1>
        <div className="flex flex-col items-center justify-center w-full p-1 m-1 bg-blue-950 h-2/3">
          {thumbnailUrl && (
            <div className="flex justify-end w-full gap-5">
              <button
                className="cursor-pointer"
                onClick={() => {
                  console.log('재업로드');
                }}
              >
                재업로드
              </button>
              <button
                className="cursor-pointer"
                onClick={() => {
                  console.log('제거');
                }}
              >
                제거
              </button>
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
              <figure className="flex flex-col items-center justify-center w-full h-full hover:cursor-pointer bg-blue-800">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-50 h-50"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <g id="Media / Image_01">
                      <path
                        id="Vector"
                        d="M3.00005 17.0001C3 16.9355 3 16.8689 3 16.8002V7.2002C3 6.08009 3 5.51962 3.21799 5.0918C3.40973 4.71547 3.71547 4.40973 4.0918 4.21799C4.51962 4 5.08009 4 6.2002 4H17.8002C18.9203 4 19.4801 4 19.9079 4.21799C20.2842 4.40973 20.5905 4.71547 20.7822 5.0918C21 5.5192 21 6.07899 21 7.19691V16.8031C21 17.2881 21 17.6679 20.9822 17.9774M3.00005 17.0001C3.00082 17.9884 3.01337 18.5058 3.21799 18.9074C3.40973 19.2837 3.71547 19.5905 4.0918 19.7822C4.5192 20 5.07899 20 6.19691 20H17.8036C18.9215 20 19.4805 20 19.9079 19.7822C20.2842 19.5905 20.5905 19.2837 20.7822 18.9074C20.9055 18.6654 20.959 18.3813 20.9822 17.9774M3.00005 17.0001L7.76798 11.4375L7.76939 11.436C8.19227 10.9426 8.40406 10.6955 8.65527 10.6064C8.87594 10.5282 9.11686 10.53 9.33643 10.6113C9.58664 10.704 9.79506 10.9539 10.2119 11.4541L12.8831 14.6595C13.269 15.1226 13.463 15.3554 13.6986 15.4489C13.9065 15.5313 14.1357 15.5406 14.3501 15.4773C14.5942 15.4053 14.8091 15.1904 15.2388 14.7607L15.7358 14.2637C16.1733 13.8262 16.3921 13.6076 16.6397 13.5361C16.8571 13.4734 17.0896 13.4869 17.2988 13.5732C17.537 13.6716 17.7302 13.9124 18.1167 14.3955L20.9822 17.9774M20.9822 17.9774L21 17.9996M15 10C14.4477 10 14 9.55228 14 9C14 8.44772 14.4477 8 15 8C15.5523 8 16 8.44772 16 9C16 9.55228 15.5523 10 15 10Z"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </g>
                  </g>
                </svg>
                {isDragActive ? (
                  <p>사진을 놓아주세요.</p>
                ) : (
                  <p>썸네일 이미지를 업로드해주세요.</p>
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
            value={contentSummary}
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
          {!id ? (
            <button
              type="button"
              className="focus:outline-none bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              onClick={handlePostPublish}
            >
              출간하기
            </button>
          ) : (
            <button
              type="button"
              className="focus:outline-none bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              onClick={handlePostUpdate}
            >
              수정하기
            </button>
          )}
        </div>
      </section>
    </main>,
    document.getElementById('modal-root')!
  );
};

export default EditorModal;
