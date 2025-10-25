import EditorModal from './EditorModal';
import '@toast-ui/editor/dist/toastui-editor.css';
import Editor from '@toast-ui/editor';
import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import '../styles/custom-toast-editor-dark.css';
import supabase from '../utils/supabase';
import { useThemeStore } from '../stores/useThemeStore';
import { usePostStore } from '../stores/usePostStore';
import { useNavigate } from 'react-router-dom';

const ToastEditor = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const bucket = import.meta.env.VITE_PUBLIC_STORAGE_BUCKET;
  const divRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const editorContentRef = useRef('');
  const isDark = useThemeStore((state) => state.isDark);
  const [visible, setVisible] = useState<boolean>(false);

  const {
    title,
    content,
    imageUrlArr,
    isEdit,
    setTitle,
    setContent,
    setImageUrlArr,
  } = usePostStore();

  useEffect(() => {
    if (isEdit) {
      setTitle(title);
      editorRef?.current?.setMarkdown(content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [isEdit]);

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
        height: '100%',
        theme: isDark ? 'dark' : 'light',
        previewStyle: 'vertical',
        previewHighlight: false,
        placeholder: '내용을 입력하세요.',
        usageStatistics: false,
        initialValue: editorContentRef.current,
        initialEditType: 'markdown',
        hideModeSwitch: true,
        toolbarItems: [
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task'],
          [
            'table',
            'link',
            {
              el: UploadImagesBtn(),
              tooltip: '이미지 업로드하기',
            },
          ],
          ['scrollSync'],
        ],
        hooks: {
          addImageBlobHook: onUploadImage,
        },
      });
    }
  }, [isDark]);

  const UploadImagesBtn = () => {
    const fileInput = document.createElement('input');
    const uploadBtn = document.createElement('button');

    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', async function (event) {
      const files = event.target?.files;
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
    });

    uploadBtn.className = 'image toastui-editor-toolbar-icons';
    uploadBtn.style.position = 'relative';
    uploadBtn.style.bottom = '7px';
    uploadBtn.addEventListener('click', function () {
      fileInput.click();
    });

    return uploadBtn;
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

  const handleEditorChange = () => {
    setContent(editorRef.current?.getMarkdown());
    console.log(content);
  };

  return (
    <>
      <div className="flex justify-center h-1/18">
        <input
          className="p-1 pl-6 text-3xl font-bold bg-white rounded w-99/100 focus-within:outline-2 focus-within:outline-gray-900 dark:bg-gray-900"
          placeholder="제목을 입력하세요."
          type="text"
          defaultValue={title ?? title}
          onChange={(e) => setTitle(e.target.value)}
          id="title"
        />
      </div>
      <div className="h-15/18">
        <div ref={divRef} onDropCapture={onDrop}></div>
      </div>
      <div className="flex h-1/18">
        <div className="flex w-full justify-between">
          <button
            onClick={() => {
              navigate('/');
            }}
            className="bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            나가기
          </button>
          <div className="flex w-1/2 justify-end">
            <button
              type="button"
              className="bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-1"
            >
              임시저장
            </button>
            {!isEdit ? (
              <button
                onClick={() => {
                  setVisible(true);
                  handleEditorChange();
                }}
                type="button"
                className="focus:outline-none  bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-xs px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              >
                출간하기
              </button>
            ) : (
              <button
                onClick={() => {
                  setVisible(true);
                  handleEditorChange();
                }}
                type="button"
                className="focus:outline-none  bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              >
                수정하기
              </button>
            )}
          </div>
        </div>
      </div>
      {visible && <EditorModal visible={visible} setVisible={setVisible} />}
    </>
  );
});

export default ToastEditor;
