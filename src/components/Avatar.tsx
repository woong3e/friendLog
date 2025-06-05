import { useAuthStore } from '../stores/useAuthStore';
import supabase from '../utils/supabase';

const Avatar = ({ isAvatarMenuOpen, toggleAvatarMenu }) => {
  const session = useAuthStore((state) => state.session);
  const clearSession = useAuthStore((state) => state.clearSession);
  const signOut = async () => {
    clearSession();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleAvatarMenu}
        className="flex items-center justify-center w-6 h-6 overflow-hidden rounded-full hover:cursor-pointer"
      >
        <svg
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-gray-900 hover:cursor-pointer dark:text-white"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>

      {isAvatarMenuOpen && (
        <div
          className="absolute right-0 z-50 w-24 bg-gray-100 rounded-lg shadow-md top-10 dark:bg-gray-800"
          id="navbar-avatar"
        >
          <ul className="flex flex-col p-2 font-medium ">
            <li>
              <button
                onClick={signOut}
                className="block w-full px-3 py-2 text-gray-900 rounded-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                로그아웃
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Avatar;
