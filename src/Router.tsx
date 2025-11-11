import { Routes, Route } from 'react-router-dom';
import Main from './pages/Main';
import NotFoundPage from './pages/404';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ToastEditor from './pages/ToastEditor';
import ToastViewer from './pages/ToastViewer';
import HasHeaderFooter from './HasHeaderFooter';
import OtpInput from './components/OtpInput';
import UserSettings from './pages/UserSettings';

export default function Router() {
  return (
    <Routes>
      <Route element={<HasHeaderFooter />}>
        <Route path="/" element={<Main />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup/otp" element={<OtpInput />} />
        <Route path="/editor" element={<ToastEditor />} />
        <Route path="/posts/:id" element={<ToastViewer />} />
        <Route path="/settings" element={<UserSettings />} />
      </Route>
    </Routes>
  );
}
