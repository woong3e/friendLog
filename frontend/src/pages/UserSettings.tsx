import { useEffect, useState } from 'react';
import { getProfile, updateAvatarUrl, updateNickname } from '../api/profiles';
import { uploadImage, deleteImageByUrl } from '../api/storage';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../stores/useAuthStore';
import { useProfileStore } from '../stores/useProfileStore';
import imageCompression from 'browser-image-compression';

const UserSettings = () => {
  const [isEdit, setIsEdit] = useState<boolean>(true);
  const [editedNickname, setEditedNickname] = useState<string>('');
  const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
    noClick: true,
    noKeyboard: true,
  });

  const { nickname, avatarImageUrl, setNickname, setAvatarImageUrl } =
    useProfileStore();

  const { session } = useAuthStore();

  useEffect(() => {
    fetchUserProfiles();
  }, [session]);

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      mutate(acceptedFiles[0]);
    }
  }, [acceptedFiles]);

  const fetchUserProfiles = async () => {
    if (!session?.user?.id) return;

    try {
      const profile = await getProfile(session.user.id);
      setNickname(profile.nickname);
      setAvatarImageUrl(profile.avatar_image_url);
      setEditedNickname(profile.nickname);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // upload Storage
  const uploadAvatarImage = async (file: File) => {
    if (file.type == undefined) return;

    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.7,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const url = await uploadImage('avatar-image', compressedFile);
      setAvatarImageUrl(url);
      return url;
    } catch (error) {
      console.error('upload Failed', error);
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: uploadAvatarImage,
    onSuccess: async (url: string) => {
      if (!url) return;
      setAvatarImageUrl(url);

      try {
        await updateAvatarUrl(session.user.id, url);
      } catch (error) {
        console.error('Error updating avatar in profile:', error);
      }
    },
  });

  const handleRemove = async () => {
    try {
      await updateAvatarUrl(session.user.id, null);
    } catch (error) {
      console.error(error);
      return;
    }

    try {
      await deleteImageByUrl(avatarImageUrl);
    } catch (error) {
      console.error('삭제 실패:', error);
    }
    setAvatarImageUrl(null);
  };

  //edit nickname
  const editNicknameMutation = useMutation({
    mutationFn: () => updateNickname(session.user.id, editedNickname),
    onSuccess: (profile) => {
      setNickname(profile.nickname);
      setIsEdit(true);
    },
    onError: (error) => console.error(error),
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
