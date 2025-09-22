import supabase from '../utils/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Avatar = ({ isAvatarMenuOpen, toggleAvatarMenu }) => {
  const bucket = import.meta.env.VITE_PUBLIC_STORAGE_BUCKET;
  const session = useAuthStore((state) => state.session);
  const [avatarImageUrl, setAvatarImageUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const user = await fetchUserMeta();
      setAvatarImageUrl(user?.user_metadata.avatarImageUrl);
    })();
  }, []);

  const clearSession = useAuthStore((state) => state.clearSession);

  const signOut = async () => {
    clearSession();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error.message);
    } else {
      navigate('/');
    }
  };

  const fetchUserMeta = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  };

  return (
    <div className="relative">
      <button
        onClick={toggleAvatarMenu}
        className="flex items-center justify-center w-15 h-10 overflow-hidden hover:cursor-pointer"
      >
        {avatarImageUrl ? (
          <div className="flex justify-between">
            <img
              src={avatarImageUrl}
              alt=""
              className="w-10 h-10 rounded-full"
              onError={(e) => {
                e.currentTarget.src =
                  'https://fdngliaptbsfvxvygvgi.supabase.co/storage/v1/object/public/friendlog/public-assets/avatar-image-default-light%20(1).png';
              }}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="w-10 h-10"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>
        ) : (
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 hover:cursor-pointer"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            ></path>
          </svg>
        )}
      </button>

      {isAvatarMenuOpen && (
        <div
          className="absolute -right-9 z-50 w-24 bg-gray-100 rounded-lg shadow-md top-10 dark:bg-gray-800"
          id="navbar-avatar"
        >
          <ul className="flex flex-col p-2 font-medium ">
            <li>
              <button
                onClick={signOut}
                className="block w-full px-3 py-2 rounded-sm hover:bg-gray-100  dark:hover:bg-gray-700 "
              >
                로그아웃
              </button>
            </li>
            <li>
              <a
                href={'/settings'}
                className="block w-full px-3 py-2 rounded-sm hover:bg-gray-100  dark:hover:bg-gray-700 "
              >
                설정
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Avatar;
