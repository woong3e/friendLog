import dayjs from 'dayjs';
import { useEffect } from 'react';

const Card = ({ post }) => {
  return (
    <div
      className="w-full h-full bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 object-contain
"
    >
      <img
        className="w-full h-50 rounded-t-lg object-cover object-center border-b-1"
        src={post.thumbnail_url}
        onError={(e) => {
          e.currentTarget.src =
            'https://fdngliaptbsfvxvygvgi.supabase.co/storage/v1/object/public/friendlog/public-assets/thumbnail-default-light.png';
        }}
      />
      <div className="pt-4 pb-2">
        <h5 className="mb-2 text-lg font-bold tracking-tight truncate px-4">
          {post.title}
        </h5>
        <p className="text-sm font-light line-clamp-3 h-15 px-4">
          {post.content_summary}
        </p>
        <p className="my-3 py-1 text-sm border-b-1 font-extralight px-4 flex justify-end">
          {dayjs(post.created_at).format('YYYY-MM-DD')}
        </p>
        <div className="flex justify-between items-end px-4 mb-1">
          <p className="text-sm">by {post.nickname}</p>
          <p className="text-sm flex">
            <div className="flex justify-center items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#ffd700"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                />
              </svg>
            </div>
            :{post.rating?.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};
export default Card;
