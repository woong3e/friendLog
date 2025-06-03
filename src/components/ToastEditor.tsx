import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import { createCookieSessionStorage, useNavigate } from 'react-router-dom';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '../styles/toast-editor-dark.css';
import { useThemeStore } from '../stores/useThemeStore';
import { Link } from 'react-router-dom';
import supabase from '../utils/supabase';
import { useMutation } from '@tanstack/react-query';

const ToastEditor = forwardRef((props, ref) => {
  const bucket = import.meta.env.VITE_PUBLIC_STORAGE_BUCKET;
  const divRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const [title, setTitle] = useState('');
  const editorContentRef = useRef('');
  const isDark = useThemeStore((state) => state.isDark);
  const content = editorRef.current?.getMarkdown();
  const navigate = useNavigate();
  const [publicUrlArr, setPublicUrlArr] = useState<string[]>([]);

  useImperativeHandle(ref, () => ({
    getInstance: () => editorRef.current,
  }));

  //다크모드 상태 변화에 의한 에디터의 내용을 유지
  useEffect(() => {
    if (editorRef.current) {
      editorContentRef.current = editorRef.current.getMarkdown();
      editorRef.current.destroy();
      editorRef.current = null;
      if (divRef.current) divRef.current.innerHTML = '';
    }

    if (divRef.current) {
      editorRef.current = new Editor({
        el: divRef.current,
        height: '90svh',
        theme: isDark ? 'dark' : 'light',
        previewStyle: 'vertical',
        previewHighlight: false,
        usageStatistics: false,
        placeholder: 'Please enter the content',
        initialValue: editorContentRef.current,
        initialEditType: 'wysiwyg',
        toolbarItems: [
          ['heading', 'bold', 'italic', 'strike', 'hr', 'quote', 'image'],
        ],
        hooks: {
          addImageBlobHook: onUploadImage,
        },
      });
    }
  }, [isDark]);

  const payload = {
    title: title,
    content: content,
    image_url: publicUrlArr,
  };

  const handlePublish = async () => {
    const content = editorRef.current?.getMarkdown();
    const { data, error } = await supabase
      .from('posts')
      .insert([payload])
      .single();

    if (error) {
      console.error('Error Message: ', error);
    } else {
      console.log(data);
      navigate('/');
    }
  };

  const uploadImage = async (blob: Blob, fileName: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, {
        contentType: blob.type,
        upsert: true,
      });
    if (error) {
      console.error('Error Message: ', error);
      return null;
    }
    return fileName;
  };

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const onUploadImage = async (
    blob: Blob,
    callback: (url: string, alt: string) => void
  ) => {
    const ext = blob.type.split('/')[1];
    const fileName = `${Date.now()}.${ext}`;
    const uploadedFileName = await uploadImage(blob, fileName);
    if (!uploadedFileName) return;
    const publicUrl = getImageUrl(uploadedFileName);
    setPublicUrlArr((prev) => [...prev, publicUrl]);
    callback(publicUrl, fileName);
  };

  const updateEditorContent = (newContent: string) => {
    const currentContent = editorRef?.current?.getMarkdown();

    editorRef?.current?.setMarkdown(`${currentContent}\n${newContent}`);
  };

  const onDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = Array.from(event.dataTransfer.files);
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        await new Promise<void>((resolve, reject) => {
          onUploadImage(file, (url, alt) => {
            console.log('업로드완료', url);
            const markdownImageLink = `![${file.name}](${url})`;
            updateEditorContent(markdownImageLink);
            resolve();
          });
        });
      }
    }
  };

  return (
    <>
      <div className="flex justify-center">
        <input
          className="p-1 my-3 text-3xl font-bold text-gray-900 bg-white rounded w-99/100 focus-within:outline-2 focus-within:outline-gray-900 dark:bg-gray-900 dark:text-white"
          placeholder="Please enter the title"
          value={title}
          type="text"
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div ref={divRef} onDropCapture={onDrop}></div>
      <div className="flex justify-between w-full my-3">
        <Link
          to={'/'}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        >
          나가기
        </Link>
        <div>
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-1"
          >
            임시저장
          </button>
          <button
            type="button"
            className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={handlePublish}
          >
            출간하기
          </button>
        </div>
      </div>
    </>
  );
});

export default ToastEditor;
