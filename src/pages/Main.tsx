import Card from '../components/Card';
import { useState, useEffect } from 'react';
import supabase from '../utils/supabase';

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
    <main className="flex flex-col flex-wrap justify-items-start h-full gap-3 mx-2 md:flex-row">
      <Card posts={posts} />
      <Card posts={posts} />
      <Card posts={posts} />
      <Card posts={posts} />
    </main>
  );
};

export default Main;
