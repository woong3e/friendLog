import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

const HasHeaderFooter = () => {
  return (
    <div className="h-dvh">
      <Header />
      <Outlet />
    </div>
  );
};

export default HasHeaderFooter;
