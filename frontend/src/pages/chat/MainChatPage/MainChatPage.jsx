import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisteredLayout from '../../../layout/registered';
import InputField from '../../../components/common/InputField/InputField';
import PromptButton from '../../../components/common/PromptButton/PromptButton';
import CardsGrid from '../../../components/layout/CardsGrid/CardsGrid';
import MyTasksCard from '../../../components/cards/MyTasksCard/MyTasksCard';
import PinnedChatsCard from '../../../components/cards/PinnedChatsCard/PinnedChatsCard';

const MainChatPage = () => {
  const navigate = useNavigate();

  const handleSend = (text) => {
    if (!text) return;
    navigate('/chat/in', { state: { initialMessage: text } });
  };

  const prompts = [
    'Tra cứu',
    'Kiểm tra tiến độ',
    'Cập nhật thông tin',
    'Tóm tắt văn bản'
  ];

  // Mock data removed - MyTasksCard now fetches real data

  const mockPinned = [
    { id: 'c1', title: 'Giấy tờ tài chính cần thiết', timeLabel: 'Hôm qua' },
    { id: 'c2', title: 'Thông tin đơn xin visa Mỹ', timeLabel: '10/4/2025' },
    { id: 'c3', title: 'Yêu cầu bảng điểm đại học', timeLabel: '7 ngày trước đó' },
    { id: 'c4', title: 'Cách nộp visa du học Mỹ', timeLabel: '30 ngày trước đó' }
  ];

  return (
    <RegisteredLayout>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          paddingTop: '16px'
        }}>
          <h1 style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: '700',
            fontSize: '30px',
            color: '#0F172B',
            margin: 0,
            textAlign: 'center',
            caretColor: 'transparent'
          }}>
            Mình có thể giúp gì cho bạn?
          </h1>
          <div style={{ width: '760px', maxWidth: '100%' }}>
            <InputField onSubmit={handleSend} placeholder="Hỏi mình về hồ sơ du học nè" />
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            justifyContent: 'center'
          }}>
            {prompts.map((text) => (
              <PromptButton key={text} text={text} onClick={handleSend} />
            ))}
          </div>
        </div>
        <CardsGrid>
          <MyTasksCard />
          <PinnedChatsCard chats={mockPinned} />
        </CardsGrid>
      </div>
    </RegisteredLayout>
  );
};

export default MainChatPage;