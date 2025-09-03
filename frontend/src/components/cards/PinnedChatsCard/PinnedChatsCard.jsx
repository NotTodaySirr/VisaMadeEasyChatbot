import React from 'react';
import './PinnedChatsCard.css';

const ChatTag = ({ title, timeLabel }) => (
  <div className="chat-tag">
    <div className="chat-title">{title}</div>
    <div className="chat-time">{timeLabel}</div>
  </div>
);

const PinnedChatsCard = ({ chats = [] }) => {
  return (
    <section className="card pinnedchats-card">
      <h2 className="card-title">Đoạn chat đã ghim</h2>
      <div className="chat-list">
        {chats.map(c => (
          <ChatTag key={c.id} title={c.title} timeLabel={c.timeLabel} />
        ))}
      </div>
    </section>
  );
};

export default PinnedChatsCard;


