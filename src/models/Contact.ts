
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
