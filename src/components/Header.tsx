import { useState } from 'react';
import { Link } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import DarkMode from './DarkMode';
import Avatar from './Avatar';
import { useAuthStore } from '../stores/useAuthStore';

const Header = () => {
  const session = useAuthStore((state) => state.session);
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] =
    useState<boolean>(false);

  const toggleHamburgerMenu = () => {
    setIsHamburgerMenuOpen((prev) => !prev);
  };

  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState<boolean>(false);

  const toggleAvatarMenu = () => {
    setIsAvatarMenuOpen((prev) => !prev);
  };

  return (
    <nav className="flex items-center justify-between mx-1 bg-white h-14 dark:bg-gray-900">
      <HamburgerMenu
        isHamburgerMenuOpen={isHamburgerMenuOpen}
        toggleHamburgerMenu={toggleHamburgerMenu}
      />
      <Link
        to="/"
        className="flex items-center justify-center w-1/3 text-xl text-black dark:text-white hover:cursor-default"
      >
        <span className="hover:cursor-pointer">FriendLog</span>
      </Link>
      <div className="flex items-center justify-end w-1/3 mr-2">
        <div className="flex items-center mr-2">
          {session ? (
            <Avatar
              isAvatarMenuOpen={isAvatarMenuOpen}
              toggleAvatarMenu={toggleAvatarMenu}
            />
          ) : (
            <Link to={'/login'}>로그인</Link>
          )}
        </div>
        <div className="flex items-center">
          <DarkMode />
        </div>
      </div>
    </nav>
  );
};

export default Header;
