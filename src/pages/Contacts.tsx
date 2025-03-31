
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Contact } from '@/models/Contact';
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

// Sample data
const initialContacts: Contact[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    status: 'online',
    lastMessage: 'See you tomorrow!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 0,
    bio: 'Software developer interested in AI and machine learning.',
    email: 'alex@example.com',
  },
  {
    id: '2',
    name: 'Sam Taylor',
    status: 'away',
    lastMessage: 'Can we talk later?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 180),
    unreadCount: 2,
    bio: 'Product manager and coffee enthusiast.',
    email: 'sam@example.com',
  },
  {
    id: '3',
    name: 'Jordan Lee',
    status: 'offline',
    lastMessage: 'Thanks for the help!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 12),
    unreadCount: 0,
    bio: 'Photographer and traveler.',
    email: 'jordan@example.com',
  },
];

// All users in the system
const allUsers: Contact[] = [
  ...initialContacts,
  {
    id: '4',
    name: 'Taylor Morgan',
    status: 'online',
    bio: 'Designer and illustrator based in NYC.',
    email: 'taylor@example.com',
  },
  {
    id: '5',
    name: 'Morgan Smith',
    status: 'offline',
    bio: 'Musician and audio engineer.',
    email: 'morgan@example.com',
  },
  {
    id: '6',
    name: 'Jessie Patel',
    status: 'away',
    bio: 'Digital marketer specializing in SEO.',
    email: 'jessie@example.com',
  },
];

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [selectedUser, setSelectedUser] = useState<Contact | null>(null);
  const navigate = useNavigate();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      const results = allUsers.filter(
        user => 
          !contacts.some(contact => contact.id === user.id) && 
          user.name.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const addContact = (user: Contact) => {
    if (!contacts.some(contact => contact.id === user.id)) {
      setContacts([...contacts, user]);
      setSearchTerm('');
      setSearchResults([]);
      toast.success(`${user.name} added to your contacts.`);
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openChat = (contactId: string) => {
    navigate(`/chat/${contactId}`);
  };

  const handleLogout = () => {
    // In a real app, you would sign out the user here
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const blockContact = (contact: Contact) => {
    setContacts(contacts.filter(c => c.id !== contact.id));
    toast.success(`${contact.name} has been blocked`);
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
                    searchResults.map(user => (
                      <div key={user.id} className="p-3 bg-nothing-darkgray rounded-md flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {user.avatar ? (
                              <AvatarImage src={user.avatar} alt={user.name} />
                            ) : (
                              <AvatarFallback className="bg-nothing-gray">
                                <User size={18} className="text-nothing-white" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="text-nothing-white font-medium">{user.name}</p>
                            {user.bio && (
                              <p className="text-nothing-lightgray text-xs truncate">{user.bio}</p>
                            )}
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => setSelectedUser(user)}
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
                                  {selectedUser.avatar ? (
                                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                                  ) : (
                                    <AvatarFallback className="bg-nothing-gray">
                                      <User size={36} className="text-nothing-white" />
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="text-center">
                                  <h3 className="text-xl font-bold text-nothing-white">{selectedUser.name}</h3>
                                  <p className="text-nothing-lightgray">{selectedUser.email}</p>
                                  <div className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                                    selectedUser.status === 'online' ? 'bg-nothing-red/20 text-nothing-red' : 
                                    selectedUser.status === 'away' ? 'bg-yellow-500/20 text-yellow-500' : 
                                    'bg-nothing-lightgray/20 text-nothing-lightgray'
                                  }`}>
                                    {selectedUser.status || 'offline'}
                                  </div>
                                </div>
                                {selectedUser.bio && (
                                  <p className="text-nothing-white text-center mt-2">{selectedUser.bio}</p>
                                )}
                              </div>
                              <DialogFooter>
                                <Button 
                                  className="w-full bg-nothing-red hover:bg-nothing-red/90"
                                  onClick={() => {
                                    addContact(selectedUser);
                                    openChat(selectedUser.id);
                                  }}
                                >
                                  Message
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
                  {contact.lastMessageTime && (
                    <span className="text-nothing-lightgray text-xs">
                      {formatTimeString(contact.lastMessageTime)}
                    </span>
                  )}
                </div>
                
                {contact.lastMessage && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-nothing-lightgray text-sm truncate pr-2">
                      {contact.lastMessage}
                    </span>
                    {contact.unreadCount && contact.unreadCount > 0 ? (
                      <div className="bg-nothing-red text-nothing-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {contact.unreadCount}
                      </div>
                    ) : null}
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
            No contacts found
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
