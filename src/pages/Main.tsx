import Card from '../components/Card';
import { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import { Link } from 'react-router-dom';

const Main = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase.from('posts').select();
    if (error) console.error('Error Message: ', error);
    else setPosts(data);
  }

  return (
    <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full p-4">
      {posts.map((post) => (
        <Link
          key={post.id}
          to={`posts/${post.id}`}
          className="block w-full h-full"
        >
          <Card post={post} />
        </Link>
      ))}
    </main>
  );
};

export default Main;
