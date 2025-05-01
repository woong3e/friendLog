import { useState } from 'react';
import { Link } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import Darkmode from './Darkmode';

const Header = () => {
  // const pages: string[] = ['Home', 'Contact', 'Blog'];
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] =
    useState<boolean>(false);

  const toggleHamburgerMenu = () => {
    setIsHamburgerMenuOpen((prev) => !prev);
  };

  return (
    <nav className="sticky flex justify-between h-12 mx-1 md:h-14">
      <HamburgerMenu
        isHamburgerMenuOpen={isHamburgerMenuOpen}
        setIsHamburgerMenuOpen={setIsHamburgerMenuOpen}
        toggleHamburgerMenu={toggleHamburgerMenu}
      />
      <Link to="/" className="flex items-center justify-center w-1/3 text-xl">
        FriendLog
      </Link>
      <div className="flex items-center justify-end w-1/3 mr-2">
        <Darkmode />
      </div>
    </nav>
  );
};

export default Header;
