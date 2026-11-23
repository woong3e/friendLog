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
    <div className="relative flex ml-2 h-full z-50" ref={hamburgerMenuRef}>
      <button onClick={toggleHamburgerMenu}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.0"
          stroke="currentColor"
          className="w-10 h-10  hover:cursor-pointer "
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5"
            className={`
    transition-transform duration-300 ease-in-out
    origin-center
    [transform-box:fill-box]
    ${isHamburgerMenuOpen ? 'rotate-45 translate-y-[5.25px]' : ''}
  `}
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 12h16.5"
            className={`
    transition-opacity duration-300 ease-in-out
    origin-center
    [transform-box:fill-box]
    ${isHamburgerMenuOpen ? 'opacity-0' : 'opacity-100'}
  `}
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 17.25h16.5"
            className={`
    transition-transform duration-300 ease-in-out
    origin-center
    [transform-box:fill-box]
    ${isHamburgerMenuOpen ? '-rotate-45 -translate-y-[5.25px]' : ''}
  `}
          />
        </svg>
      </button>

      {isHamburgerMenuOpen && (
        <div
          className="absolute left-0 z-50 w-30 bg-gray-300 rounded-lg shadow-md top-15 dark:bg-gray-700"
          id="navbar-hamburger"
        >
          <ul className="flex flex-col p-2 font-medium">
            <li>
              <a
                href="/"
                className="block w-full px-3 py-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                홈으로
              </a>
            </li>
            <li>
              <a
                href="/editor"
                className="block px-3 py-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                등록하기
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
