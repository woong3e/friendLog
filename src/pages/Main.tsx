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
    <main className="flex flex-wrap h-auto gap-5">
      {posts.map((post) => (
        <Link key={post.id} to={`posts/${post.id}`}>
          <Card post={post} />
        </Link>
      ))}
    </main>
  );
};

export default Main;
