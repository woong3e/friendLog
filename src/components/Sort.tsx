type SortOption = 'latest' | 'oldest' | 'rating_high' | 'rating_low';

interface SortProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

import { useState, useRef } from 'react';
import { useOutsideClick } from '../hooks/useOnClickOutside';

const Sort = ({ currentSort, onSortChange }: SortProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useOutsideClick(sortRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  const options: { value: SortOption; label: string }[] = [
    { value: 'latest', label: '최신순' },
    { value: 'oldest', label: '오래된순' },
    { value: 'rating_high', label: '평점 높은순' },
    { value: 'rating_low', label: '평점 낮은순' },
  ];

  const currentLabel = options.find((opt) => opt.value === currentSort)?.label;

  return (
    <div className="relative mb-6" ref={sortRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-40 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <span>{currentLabel}</span>
        <svg
          className={`w-5 h-5 ml-2 -mr-1 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 w-40 mt-2 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 animate-fadeIn">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full px-4 py-2 text-sm text-left ${
                  currentSort === option.value
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sort;
