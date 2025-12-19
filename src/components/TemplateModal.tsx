import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { usePostStore } from '../stores/usePostStore';

interface TemplateModalProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (template: string) => void;
}

const TemplateModal = ({
  visible,
  setVisible,
  onSubmit,
}: TemplateModalProps) => {
  const [topic, setTopic] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [participants, setParticipants] = useState('');

  useEffect(() => {
    if (visible) {
      setTopic('');
      setLocation('');
      setTime('');
      setParticipants('건웅 에녹 인엽 용훈 지석 준호');
    }
  }, [visible]);

  const { setEventDate } = usePostStore();

  const handleClose = () => {
    setVisible(false);
  };

  const handleSubmit = () => {
    const eventDate = time ? time.replace('T', ' ') : '';
    const template = `### 주제: ${topic}\n### 장소: ${location}\n### 시간: ${eventDate}\n### 참여자: ${participants}`;
    onSubmit(template);
    setEventDate(time || null);
    handleClose();
  };

  if (!visible) return null;

  return createPortal(
    <div className="fixed top-0 left-0 w-full h-dvh z-[1100] flex justify-center items-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-4 shadow-xl flex flex-col gap-4">
        <h2 className="text-xl font-bold dark:text-white mb-2">
          모임 정보 입력
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            주제
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="모임 주제를 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            장소
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="모임 장소를 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            시간
          </label>
          <input
            type="datetime-local"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker()}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            참여자
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            placeholder="참여자를 입력하세요"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!
  );
};

export default TemplateModal;
