
import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'other';
  timestamp: Date;
  read: boolean;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={cn(
      "flex mb-2",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div
        className={cn(
          isUser ? "chat-bubble-user" : "chat-bubble-other"
        )}
      >
        <div className="flex flex-col">
          <p className="text-sm font-normal">{message.content}</p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-[10px] opacity-70">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isUser && (
              <Check 
                size={12} 
                className={cn(
                  "opacity-70",
                  message.read ? "text-nothing-red" : ""
                )} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
