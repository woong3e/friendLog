import Card from '../components/Card';
import { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

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

  const session = useAuthStore((state) => state.session);
  console.log(session);
  return (
    <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {posts.map((post) => (
        <Link key={post.id} to={`posts/${post.id}`}>
          <Card post={post} />
        </Link>
      ))}
    </main>
  );
};

export default Main;
