import ReactStars from 'react-rating-stars-component';
import supabase from '../utils/supabase';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useState, useEffect } from 'react';

const StarRatings = () => {
  const { id } = useParams();
  const post_id = parseInt(id);
  const session = useAuthStore((state) => state.session);
  const user_id = session?.user.id;
  const [avg, setAvg] = useState<number | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      if (!post_id) return;
      const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('post_id', post_id);

      if (!error && data.length > 0) {
        const avgRating =
          data.reduce((acc, cur) => acc + cur.rating, 0) / data.length;
        setAvg(avgRating);
        console.log(data);
      } else {
        setAvg(null);
      }
    };
    fetchRating();
  }, [avg, post_id]);

  return (
    <>
      <div className="flex flex-row justify-center">
        <img
          src="https://fdngliaptbsfvxvygvgi.supabase.co/storage/v1/object/public/friendlog/public-assets/left-laurel-wreath.png"
          alt="left-laurel-wreath"
          className="w-20 h-30"
        />
        <p className="flex items-center text-black text-7xl dark:text-white">
          {avg?.toFixed(2)}
        </p>
        <img
          src="https://fdngliaptbsfvxvygvgi.supabase.co/storage/v1/object/public/friendlog/public-assets/right-laurel-wreath.png"
          alt="right-laurel-wreath"
          className="w-20 h-30"
        />
      </div>
    </>
  );
};

export default StarRatings;
