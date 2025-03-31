
export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
}
