import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import supabase from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  // useEffect(() => {
  //   if (session) {
  //     navigate('/', { replace: true });
  //   }
  // }, [session, navigate]);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (data) {
        setSession(data.session);
        navigate('/');
      }
      if (error) {
        console.log(error.message);
      }
    },
  });

  return (
    <section className="">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow-2xl dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl">
              로그인하기
            </h1>
            <form
              className="space-y-4 md:space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                loginMutation.mutate();
              }}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium"
                >
                  이메일
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  id="email"
                  className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="이메일을 입력해주세요."
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium"
                >
                  비밀번호
                </label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-end">
                <a
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  비밀번호 찾기
                </a>
              </div>
              <button
                type="submit"
                className="w-full  bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                disabled={loginMutation.isPending}
              >
                로그인
              </button>
              <p className="text-sm font-light">
                아직 계정이 없습니까?{' '}
                <a
                  href="signup"
                  className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  가입하기
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
