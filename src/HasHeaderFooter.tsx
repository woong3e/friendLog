import { Outlet } from 'react-router-dom';
import Header from './components/Header';

const HasHeaderFooter = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Outlet />
    </div>
  );
};

export default HasHeaderFooter;
