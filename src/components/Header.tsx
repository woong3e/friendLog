import { useState } from 'react';
import { Link } from 'react-router-dom';
import Darkmode from './Darkmode';

const Header = () => {
  // const pages: string[] = ['Home', 'Contact', 'Blog'];
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  return (
    <nav className="flex justify-between h-12 md:h-14 mx-1 sticky">
      <div className="flex items-center w-1/3 ml-2" onClick={handleOpenMenu}>
        {/* hamburger menu icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </div>
      <Link to="/" className="flex justify-center items-center w-1/3 text-xl">
        FriendLog
      </Link>
      <div className="flex justify-end items-center w-1/3 mr-2">
        <Darkmode />
      </div>
    </nav>
  );
};

export default Header;
