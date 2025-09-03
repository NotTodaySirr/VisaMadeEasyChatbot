import React from 'react';
import RegisteredLayout from '../../../layout/registered';
import InputField from '../../../components/common/InputField/InputField';
import PromptButton from '../../../components/common/PromptButton/PromptButton';
import CardsGrid from '../../../components/layout/CardsGrid/CardsGrid';
import MyTasksCard from '../../../components/cards/MyTasksCard/MyTasksCard';
import PinnedChatsCard from '../../../components/cards/PinnedChatsCard/PinnedChatsCard';

const MainChatPage = () => {
  

  const handleSend = (text) => {
    if (!text) return;
    // TODO: integrate with chat send action
    console.log('Send message:', text);
  };

  const prompts = [
    'Tra cứu',
    'Kiểm tra tiến độ',
    'Cập nhật thông tin',
    'Tóm tắt văn bản'
  ];

  const mockTasks = {
    stats: { pending: 3, overdue: 1, done: 2 },
    items: [
      { id: 't1', title: 'Hộ chiếu', dueLabel: 'Ngày mai', checked: false },
      { id: 't2', title: 'Bảng điểm đại học', dueLabel: '14/4', checked: false },
      { id: 't3', title: 'Bằng tốt nghiệp đại học', dueLabel: '14/4', checked: true },
      { id: 't4', title: 'Ảnh thẻ', dueLabel: '14/4', checked: true },
      { id: 't5', title: 'Xác nhận lương', dueLabel: '16/4', checked: false },
      { id: 't6', title: 'Lý lịch tư pháp số 2', dueLabel: '20/4', checked: false }
    ]
  };

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
            textAlign: 'center'
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
          <MyTasksCard tasks={mockTasks.items} stats={mockTasks.stats} />
          <PinnedChatsCard chats={mockPinned} />
        </CardsGrid>
      </div>
    </RegisteredLayout>
  );
};

export default MainChatPage;