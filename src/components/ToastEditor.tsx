import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '../styles/custom-toast-editor-dark.css';
import { useThemeStore } from '../stores/useThemeStore';
import { Link } from 'react-router-dom';
import supabase from '../utils/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import PostPreviewModal from './PostPreviewModal';
import { usePostStore } from '../stores/usePostStore';

const ToastEditor = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const bucket = import.meta.env.VITE_PUBLIC_STORAGE_BUCKET;
  const divRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const editorContentRef = useRef('');
  const isDark = useThemeStore((state) => state.isDark);
  const [publicUrlArr, setPublicUrlArr] = useState<string[]>([]);
  const session = useAuthStore((state) => state.session);
  const [visible, setVisible] = useState<boolean>(false);
  const handleModalOpen = () => setVisible(true);

  const {
    title,
    content,
    imageUrlArr,
    userId,
    setTitle,
    setContent,
    setImageUrlArr,
    setContentSummary,
  } = usePostStore();

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
        height: '80vh',
        theme: isDark ? 'dark' : 'light',
        previewStyle: 'vertical',
        previewHighlight: false,
        placeholder: 'Please enter the content',
        usageStatistics: false,
        initialValue: editorContentRef.current,
        initialEditType: 'markdown',
        hideModeSwitch: true,
        toolbarItems: [
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task'],
          ['table', 'link', 'image'],
        ],
        hooks: {
          addImageBlobHook: onUploadImage,
        },
      });
    }
  }, [isDark]);

  const handlePublish = async () => {
    const content = editorRef.current?.getMarkdown();

    if (title === '') {
      alert('제목을 입력해주세요');
      return;
    }

    if (content === '') {
      alert('내용을 입력해주세요');
      return;
    }

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
    setImageUrlArr([...imageUrlArr, publicUrl]);
    callback(publicUrl, fileName);
    console.log(imageUrlArr);
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

  const handleEditorChange = () => {
    setContent(editorRef.current?.getMarkdown());
    console.log(content);
  };

  return (
    <div>
      <div className=" h-full">
        <div className="flex justify-center">
          <input
            className="p-1 text-3xl font-bold bg-white rounded w-99/100 focus-within:outline-2 focus-within:outline-gray-900 dark:bg-gray-900 dark:"
            placeholder="Please enter the title"
            value={title}
            type="text"
            onChange={(e) => setTitle(e.target.value)}
            id="title"
          />
        </div>
        <div ref={divRef} onDropCapture={onDrop}></div>
        <div className="flex justify-between w-full">
          <Link
            to={'/'}
            className=" bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            나가기
          </Link>
          <div>
            <button
              type="button"
              className=" bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-1"
            >
              임시저장
            </button>
            <button
              onClick={() => {
                setVisible(true);
                handleEditorChange();
              }}
              type="button"
              className="focus:outline-none  bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            >
              출간하기
            </button>
          </div>
        </div>
      </div>
      {visible && (
        <PostPreviewModal visible={visible} setVisible={setVisible} />
      )}
    </div>
  );
});

export default ToastEditor;
