
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatHeader from './ChatHeader';
import ChatMessage, { Message as UIMessage } from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Message, Profile, Tables } from '@/models/Contact';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [contactProfile, setContactProfile] = useState<Profile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { contactId } = useParams();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mark all messages from this contact as read
  const markMessagesAsRead = async () => {
    if (!user || !contactId) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', contactId)
        .eq('receiver_id', user.id)
        .eq('read', false);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    if (!contactId || !user) return;

    const fetchContactProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', contactId)
          .single();

        if (error) throw error;
        if (data) setContactProfile(data);
      } catch (error: any) {
        console.error('Error fetching contact profile:', error);
        toast.error('Could not load contact information');
      }
    };

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .or(`sender_id.eq.${contactId},receiver_id.eq.${contactId}`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        if (data) {
          const formattedMessages: UIMessage[] = data.map((msg: Message) => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender_id === user.id ? 'user' : 'other',
            timestamp: new Date(msg.created_at),
            read: msg.read,
          }));
          
          setMessages(formattedMessages);
          
          // Mark messages as read when the chat is opened
          await markMessagesAsRead();
        }
      } catch (error: any) {
        console.error('Error fetching messages:', error);
        toast.error('Could not load messages');
      }
    };

    fetchContactProfile();
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${contactId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          
          if (newMessage.receiver_id === user.id) {
            // Mark message as read immediately
            await supabase
              .from('messages')
              .update({ read: true })
              .eq('id', newMessage.id);
              
            // Add the new message to the UI
            setMessages(prev => [
              ...prev,
              {
                id: newMessage.id,
                content: newMessage.content,
                sender: 'other',
                timestamp: new Date(newMessage.created_at),
                read: true,
              },
            ]);
            
            // Show notification if user is viewing this chat
            toast.info(`${contactProfile?.username || 'Contact'} sent a message`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contactId, user]);

  // Mark messages as read when the component mounts and whenever the contact changes
  useEffect(() => {
    if (contactId && user) {
      markMessagesAsRead();
    }
  }, [contactId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleBack = () => {
    navigate('/contacts');
  };

  const handleSendMessage = async (content: string) => {
    if (!user || !contactId) return;
    
    try {
      setIsTyping(false);
      
      // Insert message into database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: contactId,
          content,
          read: false,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add message to UI
      const newMessage: UIMessage = {
        id: data?.id || '',
        content,
        sender: 'user',
        timestamp: new Date(),
        read: false,
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Create notification for recipient
      await supabase
        .from('notifications')
        .insert({
          user_id: contactId,
          type: 'message',
          content: `New message from ${user.email}`,
          related_user_id: user.id,
          related_entity_id: data?.id,
        });
        
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-nothing-black overflow-hidden dot-matrix">
      <ChatHeader 
        name={contactProfile?.username || 'Loading...'}
        status={contactProfile?.status || 'offline'}
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
