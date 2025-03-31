
import React from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';

interface ChatHeaderProps {
  avatarSrc?: string;
  name: string;
  status: string;
  onBack?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  avatarSrc, 
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
          {avatarSrc ? (
            <img 
              src={avatarSrc} 
              alt={name} 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-nothing-darkgray flex items-center justify-center text-nothing-white">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          {status === 'online' && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-nothing-red rounded-full"></div>
          )}
        </div>
        
        <div className="flex flex-col">
          <span className="font-medium text-nothing-white">{name}</span>
          <span className="text-xs text-nothing-lightgray">
            {status === 'online' ? 'Online' : 'Last seen recently'}
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
