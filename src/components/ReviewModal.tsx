interface ReviewModal {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

import { createPortal } from 'react-dom';
import { useState, useEffect, SetStateAction } from 'react';
import ReactStars from 'react-rating-stars-component';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import supabase from '../utils/supabase';

const ReviewModal = ({ visible, setVisible, isClosing, setIsClosing }) => {
  const { id } = useParams();
  const post_id = parseInt(id as string);
  const session = useAuthStore((state) => state.session);
  const user_id = session?.user.id;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const nickname = session?.user.user_metadata.nickname;
  const avatarImageUrl = session?.user.user_metadata.avatarImageUrl;

  useEffect(() => {
    console.log(session?.user.user_metadata.avatarImageUrl);
  }, []);
  useEffect(() => {
    if (visible) {
      setIsClosing(false);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  const handleAnimationEnd = () => {
    if (isClosing) {
      setVisible(false);
    }
  };
  const handleClose = () => {
    setIsClosing(true);
  };

  const ratingChanged = async (newRating) => {
    console.log(newRating);
    setRating(newRating);
  };

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log(
      'submit triggered',
      rating,
      comment,
      post_id,
      user_id,
      nickname
    );
    e.preventDefault();
    const ratingData = {
      post_id: post_id,
      user_id: user_id,
      rating: rating,
      comment: comment,
      nickname: nickname,
      avatar_image_url: avatarImageUrl,
    };

    const { data, error } = await supabase
      .from('ratings')
      .upsert([ratingData], { onConflict: ['post_id', 'user_id'] })
      .single();

    if (error) {
      console.error('Error Message: ', error);
    } else {
      console.log(data);
    }

    window.location.reload();
  };

  const handleCommentChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setComment(e.target.value);
    console.log(e.target.value);
  };

  return createPortal(
    <main
      className={`fixed inset-0 w-full h-full z-1000 bg-white dark:bg-gray-900 flex justify-center py-5
        ${visible && !isClosing ? 'animate-slideup' : ''}
        ${isClosing ? 'animate-slidedown' : ''}
        `}
      onAnimationEnd={handleAnimationEnd}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <div className="flex-col justify-center w-full flex-grow overflow-y-auto pt-15">
        <p className="flex justify-center">신선함</p>
        <div className="flex justify-center">
          <ReactStars
            count={5}
            onChange={ratingChanged}
            value={rating}
            size={60}
            isHalf={true}
            activeColor={'#ffd700'}
          />
        </div>
        <hr className="h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" />
        <p className="flex justify-center">준비성</p>
        <div className="flex justify-center">
          <ReactStars
            count={5}
            onChange={ratingChanged}
            value={rating}
            size={60}
            isHalf={true}
            activeColor={'#ffd700'}
          />
        </div>
        <hr className="h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" />

        <p className="flex justify-center">만족도</p>
        <div className="flex justify-center">
          <ReactStars
            count={5}
            onChange={ratingChanged}
            value={rating}
            size={60}
            isHalf={true}
            activeColor={'#b90505'}
          />
        </div>
        <hr className="h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" />
        <section className="py-8 antialiased bg-white dark:bg-gray-900">
          <div className="max-w-2xl px-4 mx-auto">
            <form className="mb-6" onSubmit={handleSubmitReview}>
              <div className="px-4 py-2 mb-4 bg-white border border-gray-200 rounded-lg rounded-t-lg dark:bg-gray-900 dark:border-gray-700">
                <textarea
                  id="comment"
                  rows={3}
                  className="w-full px-0 text-base text-gray-900 border-0 focus:ring-0 focus:outline-none dark:text-white dark:placeholder-gray-400 dark:bg-gray-900"
                  placeholder="코멘트를 남겨주세요.&#10;내가 준 점수는 표시되지 않습니다.&#10;코멘트만 게시글 아래에 표기됩니다."
                  onChange={handleCommentChange}
                ></textarea>
              </div>
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  className="items-center py-2.5 px-5 text-sm text-center font-medium bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
                  onClick={handleClose}
                >
                  취소하기
                </button>
                <button
                  type="submit"
                  className="focus:outline-none  bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>,
    document.getElementById('modal-root')!
  );
};

export default ReviewModal;
