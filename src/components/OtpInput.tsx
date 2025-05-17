import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import supabase from '../utils/supabase';
import { useAuthStore } from '../stores/useAuthStore';

const OtpInput = () => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [otpArr, setOtpArr] = useState(Array(6).fill(''));
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const otp = otpArr.join('');

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (otp.length === 6 && !verifyOtpMutation.isPending) {
      verifyOtpMutation.mutate();
    }
  }, [otp]);

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) {
        alert(error.message);
        setOtpArr(Array(6).fill('')); // 실패 시 입력 초기화
        inputRefs.current[0]?.focus();
        return;
      }

      if (data?.session) {
        setSession(data.session);
      }

      navigate('/');
    },
  });

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // 숫자만 허용
    const newArr = [...otpArr];
    newArr[index] = value.slice(-1); // 한 글자만 저장
    setOtpArr(newArr);

    if (value && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    } else if (!value && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const digits = paste.replace(/\D/g, '').slice(0, 6).split('');
    const newArr = Array(6).fill('');
    digits.forEach((digit, i) => {
      newArr[i] = digit;
    });
    setOtpArr(newArr);
    if (inputRefs.current[digits.length]) {
      inputRefs.current[digits.length]?.focus();
    }
  };

  return (
    <form className="flex flex-col items-center justify-center mx-auto h-svh">
      <div className="flex justify-center mb-2 space-x-2 rtl:space-x-reverse">
        {[...Array(6)].map((_, i) => (
          <div key={i}>
            <label htmlFor={`code-${i + 1}`} className="sr-only">
              code {i + 1}
            </label>
            <input
              id={`code-${i + 1}`}
              type="text"
              maxLength={1}
              ref={(el) => (inputRefs.current[i] = el)}
              value={otpArr[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onPaste={handlePaste}
              className="block py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg w-9 h-9 md:w-30 md:h-30 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 md:text-2xl"
              required
            />
          </div>
        ))}
      </div>
      <p className="flex justify-center w-full mt-2 text-sm gray-500 text: md:text-3xl mb-50 dark:text-gray-400">
        메일로 발송된 인증문자 6자리를 입력해주세요
      </p>
    </form>
  );
};

export default OtpInput;
