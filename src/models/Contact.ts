export type Profile = {
  id: string;
  username: string;
  avatar_url?: string;
  status?: string;
  updated_at?: string;
  show_dot_matrix?: boolean;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
};

export type Contact = {
  id: string;
  contact_id: string;
  user_id: string;
  created_at?: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  content: string;
  created_at?: string;
  is_read?: boolean;
  related_user_id?: string;
  related_entity_id?: string;
  related_entity_id?: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          username: string;
          avatar_url?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string;
          status?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: Message;
        Insert: {
          sender_id: string;
          receiver_id: string;
          content: string;
          read?: boolean;
        };
        Update: {
          read?: boolean;
        };
      };
      contacts: {
        Row: Contact;
        Insert: {
          user_id: string;
          contact_id: string;
        };
        Update: {
          user_id?: string;
          contact_id?: string;
        };
      };
      notifications: {
        Row: Notification;
        Insert: {
          user_id: string;
          type: string;
          content: string;
          related_user_id?: string;
          related_entity_id?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

export type Tables = Database['public']['Tables'];
