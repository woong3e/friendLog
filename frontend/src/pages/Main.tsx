import Card from '../components/Card';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Sort from '../components/Sort';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getPosts, POST_PAGE_SIZE, PostSort } from '../api/posts';

const Main = () => {
  const [sortOrder, setSortOrder] = useState<PostSort>('latest');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ['posts', sortOrder],
      queryFn: ({ pageParam }) => getPosts(pageParam, sortOrder),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length < POST_PAGE_SIZE) return undefined;
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

    const currentTarget = observerRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending')
    return <div className="p-4 text-center">Loading...</div>;
  if (status === 'error')
    return <div className="p-4 text-center">Error loading posts</div>;

  return (
    <main className="w-full p-4">
      <div className="flex justify-end">
        <Sort currentSort={sortOrder} onSortChange={setSortOrder} />
      </div>
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
      <div
        ref={observerRef}
        className="h-10 flex justify-center items-center mt-4"
      >
        {isFetchingNextPage && <p>Loading more...</p>}
      </div>
    </main>
  );
};

export default Main;
