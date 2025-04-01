import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Contact, Profile, Tables } from '@/models/Contact';
import { Button } from '@/components/ui/button';
import { Plus, User, Search, LogOut, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});
  const [lastMessages, setLastMessages] = useState<{[key: string]: {text: string, time: Date}}>({});
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Fetch contacts and all users
  useEffect(() => {
    if (!user) return;
    
    const fetchContacts = async () => {
      try {
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('contact_id')
          .eq('user_id', user.id);
          
        if (contactsError) throw contactsError;
        
        if (contactsData && contactsData.length > 0) {
          const contactIds = contactsData.map(c => c.contact_id);
          
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', contactIds);
            
          if (profilesError) throw profilesError;
          
          if (profilesData) {
            const formattedContacts: Contact[] = profilesData.map(profile => ({
              id: profile.id,
              name: profile.username,
              status: 'offline', // Default status
              avatar: profile.avatar_url,
              email: profile.username, // Using username as email for display
            }));
            
            setContacts(formattedContacts);
            
            // Fetch last messages and unread counts for each contact
            fetchLastMessages(formattedContacts);
            fetchUnreadCounts(formattedContacts);
          }
        }
      } catch (error: any) {
        console.error('Error fetching contacts:', error);
        toast.error('Could not load your contacts');
      }
    };
    
    const fetchAllUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id);
          
        if (error) throw error;
        
        if (data) {
          setAllUsers(data);
        }
      } catch (error: any) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchContacts();
    fetchAllUsers();
    
    // Set up real-time listeners for new messages
    const messagesChannel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const senderId = payload.new.sender_id;
          
          // Update unread count
          setUnreadCounts(prev => ({
            ...prev,
            [senderId]: (prev[senderId] || 0) + 1,
          }));
          
          // Update last message
          setLastMessages(prev => ({
            ...prev,
            [senderId]: {
              text: payload.new.content,
              time: new Date(payload.new.created_at),
            },
          }));
          
          // Show notification
          toast(`New message from ${senderId}`);
        }
      )
      .subscribe();
      
    // Set up real-time listeners for notifications
    const notificationsChannel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          toast(payload.new.content);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [user]);
  
  // Fetch last messages for each contact
  const fetchLastMessages = async (contactsList: Contact[]) => {
    if (!user || contactsList.length === 0) return;
    
    const newLastMessages: {[key: string]: {text: string, time: Date}} = {};
    
    for (const contact of contactsList) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .or(`sender_id.eq.${contact.id},receiver_id.eq.${contact.id}`)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          newLastMessages[contact.id] = {
            text: data[0].content,
            time: new Date(data[0].created_at),
          };
        }
      } catch (error) {
        console.error(`Error fetching last message for contact ${contact.id}:`, error);
      }
    }
    
    setLastMessages(newLastMessages);
  };
  
  // Fetch unread message counts for each contact
  const fetchUnreadCounts = async (contactsList: Contact[]) => {
    if (!user || contactsList.length === 0) return;
    
    const newUnreadCounts: {[key: string]: number} = {};
    
    for (const contact of contactsList) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('sender_id', contact.id)
          .eq('receiver_id', user.id)
          .eq('read', false);
          
        if (error) throw error;
        
        if (data) {
          newUnreadCounts[contact.id] = data.length;
        }
      } catch (error) {
        console.error(`Error fetching unread count for contact ${contact.id}:`, error);
      }
    }
    
    setUnreadCounts(newUnreadCounts);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      const results = allUsers.filter(
        profile => 
          !contacts.some(contact => contact.id === profile.id) && 
          profile.username.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const addContact = async (profile: Profile) => {
    if (!user) return;
    
    try {
      // Check if contact already exists
      if (contacts.some(contact => contact.id === profile.id)) {
        toast.info(`${profile.username} is already in your contacts.`);
        return;
      }
      
      // Add contact to database
      const { error } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          contact_id: profile.id,
        });
        
      if (error) throw error;
      
      // Add contact to state
      const newContact: Contact = {
        id: profile.id,
        name: profile.username,
        status: 'offline',
        avatar: profile.avatar_url,
        email: profile.username,
      };
      
      setContacts(prev => [...prev, newContact]);
      setSearchTerm('');
      setSearchResults([]);
      toast.success(`${profile.username} added to your contacts.`);
      
      // Add notification for the contact
      await supabase
        .from('notifications')
        .insert({
          user_id: profile.id,
          type: 'contact_request',
          content: `${user.email} added you as a contact`,
          related_user_id: user.id,
        });
        
    } catch (error: any) {
      console.error('Error adding contact:', error);
      toast.error('Failed to add contact');
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openChat = (contactId: string) => {
    navigate(`/chat/${contactId}`);
  };

  const handleLogout = () => {
    signOut();
  };

  const blockContact = async (contact: Contact) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('user_id', user.id)
        .eq('contact_id', contact.id);
        
      if (error) throw error;
      
      setContacts(contacts.filter(c => c.id !== contact.id));
      toast.success(`${contact.name} has been blocked`);
    } catch (error: any) {
      console.error('Error blocking contact:', error);
      toast.error('Failed to block contact');
    }
  };

  const reportContact = (contact: Contact) => {
    // In a real app, send the report to your backend
    toast.success(`${contact.name} has been reported`, { 
      description: "Our team will review your report." 
    });
  };

  const formatTimeString = (date: Date | undefined) => {
    if (!date) return '';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const isToday = new Date(date).setHours(0, 0, 0, 0) === new Date(now).setHours(0, 0, 0, 0);
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-nothing-black overflow-hidden dot-matrix">
      <div className="p-4 border-b border-nothing-darkgray flex justify-between items-center">
        <h1 className="text-nothing-white text-xl font-bold">Contacts</h1>
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-nothing-white">
                <Search />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-nothing-black border-nothing-darkgray">
              <SheetHeader>
                <SheetTitle className="text-nothing-white">Search Users</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <Input
                  placeholder="Search by name"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-nothing-darkgray border-nothing-gray text-nothing-white"
                />
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map(profile => (
                      <div key={profile.id} className="p-3 bg-nothing-darkgray rounded-md flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {profile.avatar_url ? (
                              <AvatarImage src={profile.avatar_url} alt={profile.username} />
                            ) : (
                              <AvatarFallback className="bg-nothing-gray">
                                <User size={18} className="text-nothing-white" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="text-nothing-white font-medium">{profile.username}</p>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => setSelectedUser(profile)}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          {selectedUser && (
                            <DialogContent className="bg-nothing-black border-nothing-darkgray">
                              <DialogHeader>
                                <DialogTitle className="text-nothing-white">User Profile</DialogTitle>
                              </DialogHeader>
                              <div className="flex flex-col items-center gap-4 py-4">
                                <Avatar className="h-24 w-24">
                                  {selectedUser.avatar_url ? (
                                    <AvatarImage src={selectedUser.avatar_url} alt={selectedUser.username} />
                                  ) : (
                                    <AvatarFallback className="bg-nothing-gray">
                                      <User size={36} className="text-nothing-white" />
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="text-center">
                                  <h3 className="text-xl font-bold text-nothing-white">{selectedUser.username}</h3>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button 
                                  className="w-full bg-nothing-red hover:bg-nothing-red/90"
                                  onClick={() => {
                                    addContact(selectedUser);
                                    openChat(selectedUser.id);
                                  }}
                                >
                                  Add & Message
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          )}
                        </Dialog>
                      </div>
                    ))
                  ) : searchTerm.trim() ? (
                    <p className="text-nothing-lightgray text-center">No users found</p>
                  ) : null}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button variant="ghost" size="icon" className="text-nothing-white" onClick={handleLogout}>
            <LogOut />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-nothing-lightgray" />
          <Input
            placeholder="Search contacts"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-nothing-darkgray border-nothing-gray text-nothing-white"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length > 0 ? (
          filteredContacts.map(contact => (
            <div 
              key={contact.id}
              className="flex items-center p-4 border-b border-nothing-darkgray hover:bg-nothing-darkgray/50 cursor-pointer transition-colors"
            >
              <div className="relative mr-3" onClick={() => openChat(contact.id)}>
                <Avatar>
                  {contact.avatar ? (
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                  ) : (
                    <AvatarFallback className="bg-nothing-gray">
                      <User size={20} className="text-nothing-white" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-nothing-black ${
                  contact.status === 'online' ? 'bg-nothing-red' : 
                  contact.status === 'away' ? 'bg-yellow-500' : 'bg-nothing-lightgray'
                }`} />
              </div>
              
              <div className="flex-1" onClick={() => openChat(contact.id)}>
                <div className="flex justify-between">
                  <span className="text-nothing-white font-medium">{contact.name}</span>
                  {lastMessages[contact.id] && (
                    <span className="text-nothing-lightgray text-xs">
                      {formatTimeString(lastMessages[contact.id].time)}
                    </span>
                  )}
                </div>
                
                {lastMessages[contact.id] && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-nothing-lightgray text-sm truncate pr-2">
                      {lastMessages[contact.id].text}
                    </span>
                    {unreadCounts[contact.id] > 0 && (
                      <div className="bg-nothing-red text-nothing-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCounts[contact.id]}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-nothing-white">
                    <MoreVertical size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-nothing-black border-nothing-darkgray">
                  <DropdownMenuItem
                    className="text-nothing-white hover:bg-nothing-darkgray cursor-pointer"
                    onClick={() => blockContact(contact)}
                  >
                    Block Contact
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-nothing-red hover:bg-nothing-darkgray cursor-pointer"
                    onClick={() => reportContact(contact)}
                  >
                    Report Contact
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        ) : (
          <div className="text-center p-8 text-nothing-lightgray">
            {contacts.length === 0 ? "No contacts yet. Search for users to add." : "No contacts found"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
