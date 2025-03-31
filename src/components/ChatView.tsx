
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatHeader from './ChatHeader';
import ChatMessage, { Message } from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

// Dummy data for initial messages
const initialMessages: Message[] = [
  {
    id: '1',
    content: 'Hey there!',
    sender: 'other',
    timestamp: new Date(Date.now() - 60000 * 15),
    read: true,
  },
  {
    id: '2',
    content: 'Hi! How are you doing today?',
    sender: 'user',
    timestamp: new Date(Date.now() - 60000 * 14),
    read: true,
  },
  {
    id: '3',
    content: 'I\'m doing great! Just checking out this new chat app. The design is really sleek.',
    sender: 'other',
    timestamp: new Date(Date.now() - 60000 * 10),
    read: true,
  },
  {
    id: '4',
    content: 'Yeah, I love the minimalist Nothing OS inspired design. The animations are so smooth!',
    sender: 'user',
    timestamp: new Date(Date.now() - 60000 * 8),
    read: true,
  },
  {
    id: '5',
    content: 'The high contrast makes it really easy to read. And these red accents are 🔥',
    sender: 'other',
    timestamp: new Date(Date.now() - 60000 * 5),
    read: true,
  },
];

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { contactId } = useParams();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleBack = () => {
    navigate('/contacts');
  };

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      read: false,
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate typing and response
    setTimeout(() => setIsTyping(true), 1000);
    
    setTimeout(() => {
      setIsTyping(false);
      
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getResponseForMessage(content),
        sender: 'other',
        timestamp: new Date(),
        read: true,
      };
      
      setMessages(prev => [...prev, responseMessage]);
      
      // Mark user message as read
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, read: true } : msg
        )
      );
    }, 3000);
  };

  // Simple function to generate responses
  const getResponseForMessage = (message: string): string => {
    const responses = [
      "That's interesting!",
      "I see what you mean.",
      "Tell me more about that.",
      "I'm not sure I follow. Could you explain?",
      "That makes sense to me.",
      "Hmm, I never thought about it that way.",
      "I completely agree with you!",
      "That's a great point.",
      "I'm glad you brought that up."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-nothing-black overflow-hidden dot-matrix">
      <ChatHeader 
        name="Alex"
        status="online"
        onBack={handleBack}
      />
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatView;
