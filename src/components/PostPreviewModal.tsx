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
    <div
      className={`fixed top-0 left-3xl w-3xl h-full z-1000 flex justify-center items-center bg-amber-600 
        ${visible && !isClosing ? 'animate-slideup' : ''}
        ${isClosing ? 'animate-slidedown' : ''}
        `}
      onAnimationEnd={handleAnimationEnd}
    >
      <section className="w-3xl ">
        <h1 className="text-2xl font-bold">포스트 미리보기</h1>
        <div className="bg-blue-900 w-full h-full"></div>
        <button
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-1"
          onClick={handleClose}
        >
          취소하기
        </button>
      </section>
    </div>,
    document.getElementById('modal-root')!
  );
};

export default PostPreviewModal;
