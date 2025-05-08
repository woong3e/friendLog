import { useState } from 'react';
import { Link } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import DarkMode from './DarkMode';

const Header = () => {
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] =
    useState<boolean>(false);

  const toggleHamburgerMenu = () => {
    setIsHamburgerMenuOpen((prev) => !prev);
  };

  return (
    <nav className="flex justify-between h-14 mx-1 md:h-14 bg-white dark:bg-gray-900">
      <HamburgerMenu
        isHamburgerMenuOpen={isHamburgerMenuOpen}
        setIsHamburgerMenuOpen={setIsHamburgerMenuOpen}
        toggleHamburgerMenu={toggleHamburgerMenu}
      />
      <Link
        to="/"
        className="text-black dark:text-white flex items-center justify-center w-1/3 text-xl hover:cursor-default"
      >
        <span className="hover:cursor-pointer">FriendLog</span>
      </Link>
      <div className="flex items-center justify-end w-1/3 mr-2">
        <DarkMode />
      </div>
    </nav>
  );
};

export default Header;
