
import React from 'react';
import { ArrowLeft, MoreVertical, User } from 'lucide-react';

interface ChatHeaderProps {
  name: string;
  status: string;
  onBack?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  name, 
  status,
  onBack 
}) => {
  return (
    <div className="flex items-center justify-between p-3 border-b border-nothing-darkgray bg-nothing-black">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-full text-nothing-white hover:bg-nothing-darkgray transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-nothing-darkgray flex items-center justify-center text-nothing-white">
            <User size={16} />
          </div>
        </div>
        
        <div className="flex flex-col">
          <span className="font-medium text-nothing-white">{name}</span>
          <span className="text-xs text-nothing-lightgray">
            {status || 'No status'}
          </span>
        </div>
      </div>
      
      <button className="p-2 rounded-full text-nothing-white hover:bg-nothing-darkgray transition-colors">
        <MoreVertical size={20} />
      </button>
    </div>
  );
};

export default ChatHeader;
