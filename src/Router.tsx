import { Routes, Route } from 'react-router-dom';
import Main from './pages/Main';
import About from './pages/About';
import NotFoundPage from './pages/404';
import Detail from './pages/Detail';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import PostRegister from './pages/PostRegister';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/about" element={<About />} />
      <Route path="/detail/:id" element={<Detail />} />
      <Route path="/register" element={<PostRegister />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
