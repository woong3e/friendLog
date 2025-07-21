import { useEffect } from 'react';
import dayjs from 'dayjs';

const Card = ({ post }) => {
  useEffect(() => {
    console.log(post);
  }, []);

  const imageArray = JSON.parse(post.image_url || '[]');
  const imageUrl = imageArray[0];

  return (
    <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <img className="w-full rounded-t-lg h-47" src={imageUrl} alt="" />
      <div className="p-5">
        <h5 className="mb-2 text-lg font-bold tracking-tight text-gray-900 truncate dark:text-white">
          {post.title}
        </h5>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400 line-clamp-5 min-h-25">
          {post.content_summary}
        </p>
        <p className="mb-3 text-sm text-gray-400 dark:text-gray-500">
          {dayjs(post.created_at).format('YYYY-MM-DD HH:mm:ss')}
        </p>
        <div className="my-1 border-t border-gray-200"></div>
        <p className="mb-3 text-sm text-gray-400 dark:text-gray-500">by {}</p>
      </div>
    </div>
  );
};
export default Card;
