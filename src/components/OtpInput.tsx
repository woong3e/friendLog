import { useEffect, useRef } from 'react';

const OtpInput = () => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const nextInput = inputRefs.current[index + 1];
    const prevInput = inputRefs.current[index - 1];

    if (value === '' && prevInput) {
      prevInput.focus();
    } else if (value !== '' && nextInput) {
      nextInput.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    console.log(e.clipboardData);
    const paste = e.clipboardData.getData('text');
    const digits = paste.replace(/\D/g, '').slice(0, 6);

    console.log(paste);

    digits.split('').forEach((digit, i) => {
      const input = inputRefs.current[i];
      if (input) {
        input.value = digit;
      }
    });

    const nextInput = inputRefs.current[digits.length];
    if (nextInput) {
      nextInput.focus();
    }
  };

  return (
    <form className="max-w-sm mx-auto h-svh">
      <div className="flex mb-2 space-x-2 rtl:space-x-reverse justify-center">
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
              onChange={(e) => handleChange(i, e.target.value)}
              onPaste={handlePaste}
              className="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              required
            />
          </div>
        ))}
      </div>
      <p className="flex mt-2 text-sm text-gray-500 dark:text-gray-400 justify-center">
        메일로 발송된 인증문자 6자리를 입력해주세요
      </p>
    </form>
  );
};

export default OtpInput;
