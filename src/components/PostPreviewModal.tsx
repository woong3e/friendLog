import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';

const PostPreviewModal = ({ visible, setVisible }) => {
  const [isClosing, setIsClosing] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      setIsClosing(false);
    }
    console.log(visible);
  }, [visible]);

  const handleAnimationEnd = () => {
    if (isClosing) {
      setVisible(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
  };

  if (!visible && !isClosing) return null;

  return createPortal(
    <main
      className={`fixed top-0 left-0 w-full h-full z-1000 dark:bg-blue-950 flex justify-center
        ${visible && !isClosing ? 'animate-slideup' : ''}
        ${isClosing ? 'animate-slidedown' : ''}
        `}
      onAnimationEnd={handleAnimationEnd}
    >
      <section className="w-full flex flex-col justify-center items-center bg-blue-950">
        <h1 className="text-2xl font-bold">포스트 미리보기</h1>
        <div className="w-95/100 h-3/4 flex flex-col justify-center items-center">
          <div className="w-full h-2/3 bg-blue-900 flex justify-center items-center flex-col m-1 p-1">
            <figure className="w-full h-full flex justify-center items-center flex-col">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="w-30 h-30"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-1"
              >
                썸네일 업로드
              </button>
            </figure>
          </div>
          <p className="w-full">
            <textarea
              className="w-full h-30 resize-none outline-none bg-blue-900 px-4 py-3 text-sm mt-10 placeholder:text-center"
              placeholder="당신의 포스트를 짧게 소개해보세요."
            ></textarea>
          </p>
          <div className="w-full flex justify-end items-end">
            <button
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-1"
              onClick={handleClose}
            >
              취소
            </button>
            <button
              type="button"
              className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            >
              출간하기
            </button>
          </div>
        </div>
      </section>
    </main>,
    document.getElementById('modal-root')!
  );
};

export default PostPreviewModal;
