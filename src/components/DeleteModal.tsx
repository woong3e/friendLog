import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { deletePost } from '../api/posts';
import { useParams, useNavigate } from 'react-router-dom';

const DeleteModal = ({ openDeleteModal, setOpenDeleteModal }) => {
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (openDeleteModal) {
      setIsClosing(false);
    }
  }, [openDeleteModal]);

  const handleAnimationEnd = () => {
    if (isClosing) {
      setOpenDeleteModal(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
  };

  if (!openDeleteModal && !isClosing) return null;

  const handleDelete = async () => {
    try {
      await deletePost(Number(id));
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        openDeleteModal && !isClosing ? 'animate-slideup' : ''
      }
        ${isClosing ? 'animate-slidedown' : ''}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="bg-gray-500 dark:bg-blue-800 rounded-lg shadow-lg p-8 min-w-[320px] max-w-[90%]">
        <h1 className="text-lg font-bold mb-4">포스트 삭제</h1>
        <div className="mb-6">정말로 삭제하시겠습니까?</div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 cursor-pointer"
            onClick={handleClose}
          >
            취소
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 dark:hover:bg-blue-500 cursor-pointer"
            onClick={handleDelete}
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!
  );
};

export default DeleteModal;
