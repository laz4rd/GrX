
import React, { useState } from 'react';
import { Send, Image } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 border-t border-nothing-darkgray bg-nothing-black"
    >
      <button 
        type="button" 
        className="p-2 rounded-full text-nothing-white hover:bg-nothing-darkgray transition-colors"
      >
        <Image size={20} />
      </button>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message"
        className="flex-1 bg-nothing-darkgray text-nothing-white rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-nothing-red placeholder:text-nothing-lightgray"
      />
      <button 
        type="submit" 
        className="p-2 rounded-full text-nothing-white hover:bg-nothing-darkgray transition-colors disabled:opacity-50"
        disabled={!message.trim()}
      >
        <Send size={20} className={message.trim() ? "text-nothing-red" : ""} />
      </button>
    </form>
  );
};

export default ChatInput;
