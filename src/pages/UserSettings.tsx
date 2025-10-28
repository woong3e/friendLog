import { useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import { useMetaStore } from '../stores/useMetaStore';

const UserSettings = () => {
  const bucket = import.meta.env.VITE_PUBLIC_STORAGE_BUCKET;
  const [isEdit, setIsEdit] = useState<boolean>(true);
  const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
    noClick: true,
    noKeyboard: true,
  });
  const {
    userMeta,
    avatarImageUrl,
    editedNickname,
    setUserMeta,
    setAvatarImageUrl,
    setEditedNickname,
  } = useMetaStore();

  useEffect(() => {
    console.log(userMeta);
  }, []);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'USER_UPDATED') console.log('USER_UPDATED', session);
    });
  }, []);

  useEffect(() => {
    (async () => {
      const user = await fetchUserMeta();
      updateAvatarUrlMeta(user);
      setUserMeta(user);
    })();
  }, []);

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      mutate(acceptedFiles[0]);
    }
  }, [acceptedFiles]);

  useEffect(() => {
    storeAvatarUrlMeta();
  }, [avatarImageUrl]);

  const fetchUserMeta = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  };

  const storeAvatarUrlMeta = async () => {
    if (avatarImageUrl === '') return;
    const { data, error } = await supabase.auth.updateUser({
      data: { avatarImageUrl: avatarImageUrl },
    });
    if (error) console.error('Error updating avatar:', error);
    else console.log('Updated user metadata:', data);
  };

  const updateAvatarUrlMeta = (user) => {
    const metadata = user?.user_metadata;
    if (metadata?.avatarImageUrl) {
      setAvatarImageUrl(metadata.avatarImageUrl);
    }
  };

  const removeAvatarUrlMeta = async () => {
    const { data, error } = await supabase.auth.updateUser({
      data: { avatarImageUrl: null },
    });
    if (error) console.error('removing avatar Error', error);
    else console.log('Removed user meta', data);
  };

  const uploadAvatarImage = async (file: File) => {
    if (file.type == undefined) return;

    const ext = file.type.split('/')[1];
    const fileName = `${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`avatar-image/${fileName}`, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('upload Failed', error);
    } else {
      console.log('upload success', data);
    }
    return getAvatarImageUrl(`avatar-image/${fileName}`);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: uploadAvatarImage,
    onSuccess: (url: string) => {
      setAvatarImageUrl(url);
    },
  });

  const getAvatarImageUrl = (filePath: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    setAvatarImageUrl(data.publicUrl);
    return data.publicUrl;
  };

  const removeAvatarImage = async () => {
    const parts = avatarImageUrl.split('avatar-image/');
    const fileName = parts[1];
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([`avatar-image/${fileName}`]);
    if (error) {
      console.error('삭제 실패:', error);
    } else {
      console.log('삭제 성공:', data);
    }
  };

  const handleRemove = async () => {
    await removeAvatarImage();
    await removeAvatarUrlMeta();
    setAvatarImageUrl('');
  };

  const editNicknameMutation = useMutation({
    mutationFn: async () => {
      const { data } = await supabase.auth.updateUser({
        data: {
          nickname: editedNickname,
        },
      });
      return data;
    },
    onSuccess: async () => {
      const latestUser = await fetchUserMeta();
      setUserMeta(latestUser);
      setIsEdit(true);
    },
  });

  return (
    <main>
      <section className="w-full p-5 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="flex justify-center items-center w-28 h-28 rounded-full overflow-hidden mb-4">
            {avatarImageUrl ? (
              <img src={avatarImageUrl} className="w-28 h-28" />
            ) : (
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                className="w-25 h-25 hover:cursor-pointer"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                ></path>
              </svg>
            )}
          </div>
          <div>
            <div {...getRootProps({ className: 'dropzone' })}>
              <input {...getInputProps()} />
              <button
                type="button"
                className="flex justify-center items-center w-40 h-10 bg-blue-700 hover:bg-blue-800  font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800 disabled:bg-green-600"
                disabled={isPending}
                onClick={() => {
                  open();
                }}
              >
                {isPending ? '업로드 중...' : '이미지 업로드'}
              </button>
            </div>
          </div>
          <button
            className="flex justify-center items-center w-40 h-10 bg-red-700 hover:bg-red-800  font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-red-600 dark:hover:bg-red-700 focus:ring-4 focus:ring-red-300 focus:outline-none dark:focus:ring-red-800"
            onClick={handleRemove}
          >
            이미지 제거
          </button>
        </div>
      </section>
      <hr className="h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" />

      <label htmlFor="nickname" className="text-xl">
        닉네임
      </label>
      {isEdit ? (
        <>
          <h2 className="text-2xl">{userMeta?.user_metadata?.nickname}</h2>
          <button
            className="text-blue-500 underline cursor-pointer"
            onClick={() => {
              setIsEdit((prev) => !prev);
            }}
          >
            수정
          </button>
        </>
      ) : (
        <div className="flex ">
          <input
            id="nickname"
            type="text"
            className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(e) => {
              setEditedNickname(e.target.value);
            }}
          />
          <button
            type="submit"
            className="flex justify-center items-center w-40 h-10 bg-blue-700 hover:bg-blue-800  font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
            onClick={() => {
              editNicknameMutation.mutate();
            }}
          >
            저장
          </button>
        </div>
      )}
    </main>
  );
};

export default UserSettings;
