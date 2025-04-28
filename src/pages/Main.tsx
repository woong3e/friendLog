import Card from '../components/Card';
import { useState, useEffect } from 'react';
const Main = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchMockData = async () => {
      try {
        const response = await fetch('/mockData/mockData.json');
        const data = await response.json();
        setImages(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMockData();
  }, []);

  return (
    <main className="mx-2 flex flex-col md:flex-row justify-start flex-wrap gap-2">
      <Card />
      <Card />
      <Card />
    </main>
  );
};

export default Main;
