import dayjs from 'dayjs';

const Card = ({ post }) => {
  const imageArray = JSON.parse(post.image_url || '[]');
  const imageUrl = imageArray[0];

  return (
    <div
      className="w-full h-full bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 object-contain
"
    >
      <img
        className="w-full h-auto max-h-50 rounded-t-lg object-contain border-b-1"
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
          <p className="text-sm">rating:5.0</p>
        </div>
      </div>
    </div>
  );
};
export default Card;
