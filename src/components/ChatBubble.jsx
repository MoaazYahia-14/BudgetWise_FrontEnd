/* ملف الـ Chat Bubble — زر الشات العائم */
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChatBubble = () => {
  const navigate = useNavigate();

  return (
    <button
      className="chat-bubble"
      onClick={() => navigate('/chat')}
    >
      ✨
    </button>
  );
};

export default ChatBubble;
