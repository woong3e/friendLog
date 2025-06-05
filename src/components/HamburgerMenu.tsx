import { useOutsideClick } from '../hooks/useOnClickOutside';
import { useRef } from 'react';
const HamburgerMenu = ({
  isHamburgerMenuOpen,
  setIsHamburgerMenuOpen,
  toggleHamburgerMenu,
}) => {
  const hamburgerMenuRef = useRef<HTMLDivElement>(null);

  useOutsideClick(hamburgerMenuRef, () => {
    if (isHamburgerMenuOpen) {
      setIsHamburgerMenuOpen(false);
    }
  });

  return (
    <div className="relative flex w-1/3 ml-2" ref={hamburgerMenuRef}>
      <button onClick={toggleHamburgerMenu}>
        {/* hamburgerMenu icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.0"
          stroke="currentColor"
          className="w-6 h-6 text-gray-900 hover:cursor-pointer dark:text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {isHamburgerMenuOpen && (
        <div
          className="absolute left-0 z-50 w-full bg-gray-100 rounded-lg shadow-md top-10 dark:bg-gray-800"
          id="navbar-hamburger"
        >
          <ul className="flex flex-col p-2 font-medium">
            <li>
              <a
                href="/"
                className="block w-full px-3 py-2 text-gray-900 rounded-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white "
              >
                홈으로
              </a>
            </li>
            <li>
              <a
                href="/editor"
                className="block px-3 py-2 text-gray-900 rounded-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                등록하기
              </a>
            </li>
            <li>
              <a
                href="/about"
                className="block px-3 py-2 text-gray-900 rounded-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                About
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
