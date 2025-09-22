import { Outlet } from 'react-router-dom';
import Header from './components/Header';

const HasHeaderFooter = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default HasHeaderFooter;
