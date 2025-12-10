import Card from '../components/Card';
import { useEffect, useRef } from 'react';
import supabase from '../utils/supabase';
import { Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';

const Main = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * 8;
      const to = from + 7;
      const { data, error } = await supabase
        .from('posts')
        .select()
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 8) return undefined;
      return allPages.length;
    },
  });

  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending') return <div className="p-4 text-center">Loading...</div>;
  if (status === 'error') return <div className="p-4 text-center">Error loading posts</div>;

  return (
    <main className="w-full p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {data?.pages.map((page) =>
          page.map((post) => (
            <Link
              key={post.id}
              to={`posts/${post.id}`}
              className="block w-full h-full"
            >
              <Card post={post} />
            </Link>
          ))
        )}
      </div>
      <div ref={observerRef} className="h-10 flex justify-center items-center mt-4">
        {isFetchingNextPage && <p>Loading more...</p>}
      </div>
    </main>
  );
};

export default Main;
