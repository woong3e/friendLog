import { useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
dayjs.extend(relativeTime);
dayjs.locale('ko');

const CommentSection = () => {
  const { id } = useParams();
  const post_id = parseInt(id);
  const [commentData, setCommentData] = useState<object | null>();

  useEffect(() => {
    const fetchRating = async () => {
      const { data } = await supabase
        .from('ratings')
        .select()
        .eq('post_id', post_id);
      setCommentData(data);
    };
    fetchRating();
  }, [post_id]);

  const fetchUserMeta = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log(user);
    return user;
  };

  useEffect(() => {
    fetchUserMeta();
  }, []);

  return (
    <section className="py-8 antialiased bg-white dark:bg-gray-900 lg:py-16">
      <div className="max-w-2xl mx-auto">
        {commentData?.map((item, index) => (
          <article
            key={index}
            className="p-4 text-base bg-white rounded-lg dark:bg-gray-900"
          >
            <footer className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <p className="inline-flex items-center mr-3 text-sm font-semibold text-gray-900 dark:text-white">
                  <img
                    className="w-6 h-6 mr-2 rounded-full"
                    src={item.avatar_image_url}
                    alt="Michael Gough"
                  />
                  {item.nickname}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <time dateTime={dayjs().fromNow()} title={dayjs().fromNow()}>
                    {dayjs(item.created_at).fromNow()}
                  </time>
                </p>
              </div>
              <button
                id="dropdownComment1Button"
                data-dropdown-toggle="dropdownComment1"
                className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 bg-white rounded-lg dark:text-gray-400 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                type="button"
              >
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 16 3"
                >
                  <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                </svg>
                <span className="sr-only">Comment settings</span>
              </button>
              <div
                id="dropdownComment1"
                className="z-10 hidden bg-white divide-y divide-gray-100 rounded shadow w-36 dark:bg-gray-700 dark:divide-gray-600"
              >
                <ul
                  className="py-1 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownMenuIconHorizontalButton"
                >
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Edit
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Remove
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Report
                    </a>
                  </li>
                </ul>
              </div>
            </footer>
            <p className="text-gray-500 dark:text-gray-400">{item.comment}</p>
            <div className="flex items-center mt-4 space-x-4">
              <button
                type="button"
                className="flex items-center text-sm font-medium text-gray-500 hover:underline dark:text-gray-400"
              >
                <svg
                  className="mr-1.5 w-3.5 h-3.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 18"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 5h5M5 8h2m6-3h2m-5 3h6m2-7H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3v5l5-5h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z"
                  />
                </svg>
                Reply
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CommentSection;
