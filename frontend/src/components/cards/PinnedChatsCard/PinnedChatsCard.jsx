import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PinnedChatsCard.css';

const ChatTag = ({ title, timeLabel, onClick }) => (
  <div className="chat-tag" onClick={onClick} style={{ cursor: 'pointer' }}>
    <div className="chat-title">{title}</div>
    <div className="chat-time">{timeLabel}</div>
  </div>
);

const PinnedChatsCard = ({ chats = [] }) => {
  const navigate = useNavigate();

  const handleChatClick = (chat) => {
    // Navigate to existing conversation
    navigate(`/chat/in/${chat.id}`);
  };

  return (
    <section className="card pinnedchats-card">
      <h2 className="card-title">Đoạn chat đã ghim</h2>
      {chats.length === 0 ? (
        <div>Hiện tại chưa có đoạn chat nào được ghim.</div>
      ) : (
        <div className="chat-list">
          {chats.map(c => (
            <ChatTag 
              key={c.id} 
              title={c.title} 
              timeLabel={c.timeLabel}
              onClick={() => handleChatClick(c)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default PinnedChatsCard;


