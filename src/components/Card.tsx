import dayjs from 'dayjs';

const Card = ({ post }) => {
  const imageArray = JSON.parse(post.image_url || '[]');
  const imageUrl = imageArray[0];

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <img
        className="w-full rounded-t-lg h-80"
        src={post.thumbnail_url}
        alt=""
      />
      <div className="p-5">
        <h5 className="mb-2 text-lg font-bold tracking-tight truncate ">
          {post.title}
        </h5>
        <p className="mb-3 text-sm line-clamp-5 min-h-25">
          {post.content_summary}
        </p>
        <p className="mb-3 text-sm ">
          {dayjs(post.created_at).format('YYYY-MM-DD HH:mm:ss')}
        </p>
        <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
        <p className="mb-3 text-sm">by {post.nickname}</p>
        <p className="mb-3 text-sm">rating:5.0</p>
      </div>
    </div>
  );
};
export default Card;
