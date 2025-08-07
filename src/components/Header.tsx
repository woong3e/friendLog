import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import DarkMode from './Darkmode';
import Avatar from './Avatar';
import { useAuthStore } from '../stores/useAuthStore';
import { useOutsideClick } from '../hooks/useOnClickOutside';

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

  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerMenuRef = useRef<HTMLDivElement>(null);

  useOutsideClick(avatarMenuRef, () => {
    if (isAvatarMenuOpen) {
      setIsAvatarMenuOpen(false);
    }
  });

  useOutsideClick(hamburgerMenuRef, () => {
    if (isHamburgerMenuOpen) {
      setIsHamburgerMenuOpen(false);
    }
  });

  return (
    <header className="flex items-center justify-between mx-1 bg-white dark:bg-gray-900 h-1/12">
      <HamburgerMenu
        isHamburgerMenuOpen={isHamburgerMenuOpen}
        setIsHamburgerMenuOpen={setIsHamburgerMenuOpen}
        toggleHamburgerMenu={toggleHamburgerMenu}
      />
      <Link
        to="/"
        className="flex items-center justify-center w-1/3 text-xl hover:cursor-default"
      >
        <span className="hover:cursor-pointer ">FriendLog</span>
      </Link>
      <div className="flex items-center justify-end w-1/3 mr-2">
        <div className="flex items-center mr-2" ref={avatarMenuRef}>
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
    </header>
  );
};

export default Header;
