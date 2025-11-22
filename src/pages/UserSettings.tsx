import { useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../stores/useAuthStore';
import { useProfileStore } from '../stores/useProfileStore';

const UserSettings = () => {
  const bucket = import.meta.env.VITE_PUBLIC_STORAGE_BUCKET;
  const [isEdit, setIsEdit] = useState<boolean>(true);
  const [editedNickname, setEditedNickname] = useState<string>('');
  const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
    noClick: true,
    noKeyboard: true,
  });

  const {
    nickname,
    email,
    avatarImageUrl,
    setNickname,
    setEmail,
    setAvatarImageUrl,
  } = useProfileStore();

  const { session } = useAuthStore();

  useEffect(() => {
    console.log(session);
  }, []);


  useEffect(() => {
    const fetchProfiles = async () => {
      const user = await fetchUserProfiles();
      console.log(user);
    };
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      mutate(acceptedFiles[0]);
    }
  }, [acceptedFiles]);

  // Profiles
  // Profiles
  const fetchUserProfiles = async () => {
    if (!session?.user?.id) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      console.log('fetch user profiles', data);
      setNickname(data.nickname);
      setAvatarImageUrl(data.avatar_image_url);
      setEditedNickname(data.nickname);
    }
    return data;
  };

  // upload Storage
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
    onSuccess: async (url: string) => {
      if (!url) return;
      setAvatarImageUrl(url);
      
      // Update profile in DB
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_image_url: url })
        .eq('id', session.user.id);
        
      if (error) console.error('Error updating avatar in profile:', error);
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
    setAvatarImageUrl('');
  };

  //edit nickname
  const editNicknameMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ nickname: editedNickname })
        .eq('id', session.user.id)
        .select();
        
      if (error) {
        console.error(error);
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      if (data && data.length > 0) {
        setNickname(data[0].nickname);
      }
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
      <hr className="h-px my-6 bg-gray-200 border-px dark:bg-gray-700" />

      <label htmlFor="nickname" className="text-xl">
        닉네임
      </label>
      {isEdit ? (
        <>
          <h2 className="text-2xl">{nickname}</h2>
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
