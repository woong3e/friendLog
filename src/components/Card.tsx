import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useEffect, useState } from 'react';
import supabase from '../utils/supabase';

dayjs.extend(duration);
import { useAuthStore } from '../stores/useAuthStore';

const Card = ({ post }) => {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isMeetingFuture, setIsMeetingFuture] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [currentNickname, setCurrentNickname] = useState<string>(post.nickname);
  const [hasRated, setHasRated] = useState(false);
  const session = useAuthStore((state) => state.session);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!post.email) return;
      const { data } = await supabase
        .from('profiles')
        .select('avatar_image_url, nickname')
        .eq('email', post.email)
        .single();

      if (data) {
        setAvatarUrl(data.avatar_image_url);
        if (data.nickname) {
          setCurrentNickname(data.nickname);
        }
      }
    };
    fetchProfile();
  }, [post.email]);

  useEffect(() => {
    const checkRating = async () => {
      if (!session?.user?.id || !post.id) {
        setHasRated(false);
        return;
      }

      const { data } = await supabase
        .from('ratings')
        .select('rating')
        .eq('post_id', post.id)
        .eq('user_id', session.user.id)
        .gte('rating', 0.5)
        .maybeSingle();

      if (data) {
        setHasRated(true);
      } else {
        setHasRated(false);
      }
    };

    checkRating();
  }, [post.id, session?.user?.id]);

  useEffect(() => {
    const match = post.content.match(/### 시간:\s*(.+)/);
    if (match) {
      const timeStr = match[1].split('\n')[0].trim();
      const targetDate = dayjs(timeStr);

      if (targetDate.isValid() && targetDate.isAfter(dayjs())) {
        setIsMeetingFuture(true);

        const updateTimer = () => {
          const now = dayjs();
          const diff = targetDate.diff(now);

          if (diff <= 0) {
            setIsMeetingFuture(false);
            setTimeLeft(null);
          } else {
            const dur = dayjs.duration(diff);
            const days = Math.floor(dur.asDays());
            const hours = dur.hours().toString().padStart(2, '0');
            const minutes = dur.minutes().toString().padStart(2, '0');
            const seconds = dur.seconds().toString().padStart(2, '0');

            if (days > 0) {
              setTimeLeft(`${days}일 ${hours}:${minutes}:${seconds}`);
            } else {
              setTimeLeft(`${hours}:${minutes}:${seconds}`);
            }
          }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
      }
    }
  }, [post.content]);

  return (
    <div className="relative w-full h-full bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 object-contain">
      {hasRated && (
        <div className="absolute top-2 right-2 z-10 bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-300 shadow opacity-90">
          ✅ 평가완료
        </div>
      )}
      {isMeetingFuture && timeLeft ? (
        <div className="w-full h-50 rounded-t-lg bg-black/80 flex flex-col items-center justify-center text-white border-b-1">
          <p className="text-sm text-gray-300 mb-1">모임 예정</p>
          <p className="font-bold text-2xl tracking-wider">{timeLeft}</p>
        </div>
      ) : (
        <img
          className="w-full h-50 rounded-t-lg object-cover object-center border-b-1"
          src={post.thumbnail_url}
          onError={(e) => {
            e.currentTarget.src =
              'https://fdngliaptbsfvxvygvgi.supabase.co/storage/v1/object/public/friendlog/public-assets/thumbnail-default-light.png';
          }}
        />
      )}
      <div className="pt-4 pb-2">
        <h5 className="mb-2 text-lg font-bold tracking-tight truncate px-4">
          {post.title}
        </h5>
        <p className="text-sm font-light line-clamp-3 h-15 px-4">
          {post.content_summary}
        </p>
        <p className="my-3 py-1 text-sm border-b-1 font-extralight px-4 flex justify-end">
          {dayjs(post.event_date).format('YYYY-MM-DD')}
        </p>
        <div className="flex justify-between items-end px-4 mb-1">
          <div className="flex items-center gap-2">
            <p className="text-sm">by</p>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 rounded-full"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                ></path>
              </svg>
            )}
            <p className="text-sm">{currentNickname}</p>
          </div>
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
