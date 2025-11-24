import EditorModal from '../components/EditorModal';
import TemplateModal from '../components/TemplateModal';
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
import { useNavigate, useLocation } from 'react-router-dom';
import imageCompression from 'browser-image-compression';

const ToastEditor = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const bucket = import.meta.env.VITE_PUBLIC_STORAGE_BUCKET;
  const divRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const editorContentRef = useRef('');
  const isDark = useThemeStore((state) => state.isDark);
  const [visible, setVisible] = useState<boolean>(false);
  const [templateModalVisible, setTemplateModalVisible] = useState<boolean>(false);

  const {
    title,
    content,
    imageUrlArr,
    isEdit,
    setTitle,
    setContent,
    setImageUrlArr,
    setIsEdit,
    setThumbnailUrl,
    setNickname,
    setCreated_At,
    setContentSummary,
    setEmail,
  } = usePostStore();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');

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
        initialValue: editorContentRef.current || (isEdit ? content : ''),
        initialEditType: 'markdown',
        hideModeSwitch: true,
        toolbarItems: [
          ['heading', 'bold', 'strike','hr','link',{
              el: UploadImagesBtn(),
              tooltip: '이미지 업로드하기',
            },
            {
              el: TemplateBtn(),
              tooltip: '템플릿 삽입',
            },'scrollSync'],
        ],
        hooks: {
          addImageBlobHook: onUploadImage,
        },
      });
    }
  }, [isDark]);

  useEffect(() => {
    if (isEdit && editorRef.current) {
      setTitle(title);
      editorRef.current.setMarkdown(content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [isEdit]);

  useEffect(() => {
    if (id) {
      getPost();
    }
  }, [id]);

  const getPost = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', Number(id))
      .single();

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setTitle(data.title);
      setContent(data.content);
      setImageUrlArr(data.image_url);
      setThumbnailUrl(data.thumbnail_url);
      setNickname(data.nickname);
      setCreated_At(data.created_at);
      setContentSummary(data.content_summary);
      setEmail((data as any)?.email);
      setIsEdit(true);
      if (editorRef.current) {
        editorRef.current.setMarkdown(data.content);
      }
    }
  };

  const TemplateBtn = () => {
    const button = document.createElement('button');

    button.className = 'toastui-editor-toolbar-icons last';
    button.style.backgroundImage = 'none';
    button.style.margin = '0';
    button.style.width = 'auto';
    button.style.padding = '0 5px';
    button.style.fontSize = '13px';
    button.style.color = isDark ? 'white' : 'black';
    button.innerHTML = `<i style="font-size: 20px;font-weight: bold;">T</i>`;

    button.addEventListener('click', () => {
      setTemplateModalVisible(true);
    });

    return button;
  };


  const UploadImagesBtn = () => {
    const fileInput = document.createElement('input');
    const uploadBtn = document.createElement('button');

    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', async function (event: Event) {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          await new Promise<void>((resolve) => {
            onUploadImage(file, (url) => {
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
    const file = blob as File;
    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.7,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const ext = compressedFile.type.split('/')[1];
      const fileName = `${Date.now()}.${ext}`;
      const uploadedFileName = await uploadImage(compressedFile, fileName);
      if (!uploadedFileName) return;
      const publicUrl = getImageUrl(uploadedFileName);
      setImageUrlArr([...imageUrlArr, publicUrl]);
      callback(publicUrl, fileName);
      console.log(imageUrlArr);
    } catch (error) {
      console.log(error);
    }
  };

  const updateEditorContent = (newContent: string) => {
    const currentContent = editorRef?.current?.getMarkdown();

    if (currentContent) {
      editorRef?.current?.setMarkdown(`${currentContent}\n${newContent}`);
    } else {
      editorRef?.current?.setMarkdown(newContent);
    }
  };

  const handleEditorChange = () => {
    setContent(editorRef.current?.getMarkdown());
    console.log(content);
  };

  return (
    <>
      <div className="flex justify-center h-1/18">
        <input
          className="p-1 pl-6 text-2xl font-bold bg-white rounded w-99/100 focus-within:outline-2 focus-within:outline-gray-900 dark:bg-gray-900"
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
              setIsEdit(false);
              navigate('/');
            }}
            className="bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            나가기
          </button>
          <div className="flex w-1/2 justify-end">
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
      {templateModalVisible && (
        <TemplateModal
          visible={templateModalVisible}
          setVisible={setTemplateModalVisible}
          onSubmit={updateEditorContent}
        />
      )}
    </>
  );
});

export default ToastEditor;
