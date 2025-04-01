
export interface Contact {
  id: string;
  name: string;
  status?: 'online' | 'offline' | 'away';
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  bio?: string;
  email?: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
  related_user_id?: string;
  related_entity_id?: string;
}
