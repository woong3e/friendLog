import { Routes, Route } from 'react-router-dom';
import Main from './pages/Main';
import About from './pages/About';
import NotFoundPage from './pages/404';
import Detail from './pages/Detail';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import PostRegister from './pages/PostRegister';
import ToastEditor from './components/ToastEditor';
import ToastViewer from './components/ToastViewer';
import HasHeaderFooter from './HasHeaderFooter';
import OtpInput from './components/OtpInput';

export default function Router() {
  return (
    <Routes>
      <Route element={<HasHeaderFooter />}>
        <Route path="/" element={<Main />}  />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<PostRegister />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup/otp" element={<OtpInput />} />
        <Route path="/editor" element={<ToastEditor />} /> 
        <Route path="/posts/:id" element={<ToastViewer />} />
      </Route>
    </Routes>
  );
}
