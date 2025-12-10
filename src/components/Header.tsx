import { useState, useRef } from 'react';
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
    <header className="flex mx-1 bg-white dark:bg-gray-900 h-1/18 justify-between">
      <HamburgerMenu
        isHamburgerMenuOpen={isHamburgerMenuOpen}
        setIsHamburgerMenuOpen={setIsHamburgerMenuOpen}
        toggleHamburgerMenu={toggleHamburgerMenu}
      />
      <Link
        to="/"
        className="flex justify-center items-center text-xl hover:cursor-default h-full"
      >
        <p className="hover:cursor-pointer text-2xl ml-15">FRIENDLOG</p>
      </Link>
      <div className="flex mr-2 h-full justify-end">
        <div className="flex items-center mr-2" ref={avatarMenuRef}>
          {session ? (
            <Avatar
              isAvatarMenuOpen={isAvatarMenuOpen}
              toggleAvatarMenu={toggleAvatarMenu}
            />
          ) : (
            <div className="text-xl font-extrabold h-6">
              <Link to={'/login'}>로그인</Link>
            </div>
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
