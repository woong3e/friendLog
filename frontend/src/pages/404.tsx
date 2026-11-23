import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <h1 className="text-7xl font-extrabold text-blue-600 dark:text-blue-400 mb-4 select-none">
        404
      </h1>
      <p className="text-xl mb-8 text-center">
        죄송합니다. 찾으시는 페이지를 찾을 수 없습니다.
      </p>
      <button
        className="px-6 py-3 rounded-lg bg-blue-600 dark:bg-blue-500  font-semibold shadow hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
        onClick={() => navigate('/')}
      >
        홈으로 돌아가기
      </button>
    </div>
  );
};

export default NotFoundPage;
