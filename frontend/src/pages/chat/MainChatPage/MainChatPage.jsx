import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisteredLayout from '../../../layout/registered';
import InputField from '../../../components/common/InputField/InputField';
import PromptButton from '../../../components/common/PromptButton/PromptButton';
import CardsGrid from '../../../components/layout/CardsGrid/CardsGrid';
import MyTasksCard from '../../../components/cards/MyTasksCard/MyTasksCard';
import PinnedChatsCard from '../../../components/cards/PinnedChatsCard/PinnedChatsCard';
import { useConversations } from '../../../hooks/chat/useConversations';

const MainChatPage = () => {
  const navigate = useNavigate();
  const { data: conversations = [], isFetching: isFetchingConvos } = useConversations();

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

  // Process conversations to get pinned chats (same logic as sidebar)
  const chatItems = useMemo(() => {
    return (conversations || []).map((c) => ({
      id: c.id,
      name: c.title || `Cuộc trò chuyện ${c.id}`,
      isPinned: !!(c.pinned ?? c.is_pinned),
      updatedAt: c.updated_at ? new Date(c.updated_at) : null,
    }));
  }, [conversations]);

  const pinnedChats = useMemo(() => chatItems.filter(i => i.isPinned), [chatItems]);

  // Transform data to match PinnedChatsCard format
  const formatTimeLabel = (date) => {
    if (!date) return 'Older';
    const now = new Date();
    const diffMs = now - date;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Hôm qua';
    if (days <= 7) return `${days} ngày trước đó`;
    if (days <= 30) return `${Math.floor(days / 7)} tuần trước đó`;
    return `${Math.floor(days / 30)} tháng trước đó`;
  };

  const pinnedChatsData = useMemo(() => {
    return pinnedChats.map(chat => ({
      id: chat.id,
      title: chat.name,
      timeLabel: formatTimeLabel(chat.updatedAt)
    }));
  }, [pinnedChats]);

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
          <PinnedChatsCard chats={pinnedChatsData} />
        </CardsGrid>
      </div>
    </RegisteredLayout>
  );
};

export default MainChatPage;