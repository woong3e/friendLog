import { useParams } from 'react-router-dom';

export default function Detail() {
  const { id } = useParams();

  return (
    <div>
      <h1>상세 페이지</h1>
      <p>카드 ID: {id}</p>
    </div>
  );
}
