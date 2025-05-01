import { useState } from 'react';
import supabase from '../utils/supabase';

const PostRegister = () => {
  const bucket = import.meta.env.VITE_PUBLIC_STORAGE_BUCKET;
  const [postList, setPostList] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [file, setFile] = useState<File | null>(null);

  const addPost = async () => {
    const imageUrl = await uploadFile();

    const payload = {
      ...form,
      image_url: imageUrl,
    };

    const { data, error } = await supabase
      .from('posts')
      .insert([payload])
      .single();

    if (error) {
      console.error('Error Messange: ', error);
    } else {
      setPostList((prev) => [...prev, data]);
      setForm({ title: '', content: '' });
      setFile(null);
    }
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!file) return null;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(file.name, file, {
        upsert: true,
      });

    if (error) {
      console.error('파일 업로드 실패: ', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(`public/${file.name}`);

    return urlData?.publicUrl || null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFile = e.target.files?.[0];
    if (uploadFile) setFile(uploadFile);
  };

  return (
    <>
      <form className="flex flex-col items-center h-svh">
        <input
          name="title"
          id="title"
          value={form.title}
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 placeholder:text-center"
          placeholder="컨텐츠명을 입력하세요"
          required
          onChange={handleChange}
        />
        <input
          name="content"
          id="content"
          value={form.content}
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full h-1/4 md:w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 placeholder:text-center"
          placeholder="내용을 입력하세요"
          required
          onChange={handleChange}
        />
        {/* drop zone */}
        <div className="flex items-center justify-center w-full md:w-1/2">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                SVG, PNG, JPG or GIF (MAX. 800x400px)
              </p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
        <div className="flex justify-end md:w-1/2">
          <button
            type="button"
            className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={addPost}
          >
            출간하기
          </button>
        </div>
      </form>
    </>
  );
};
export default PostRegister;
