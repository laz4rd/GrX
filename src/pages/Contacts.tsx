
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Contact } from '@/models/Contact';
import { Button } from '@/components/ui/button';
import { Plus, User, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

// Sample data
const initialContacts: Contact[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    status: 'online',
    lastMessage: 'See you tomorrow!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 0,
  },
  {
    id: '2',
    name: 'Sam Taylor',
    status: 'away',
    lastMessage: 'Can we talk later?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 180),
    unreadCount: 2,
  },
  {
    id: '3',
    name: 'Jordan Lee',
    status: 'offline',
    lastMessage: 'Thanks for the help!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 12),
    unreadCount: 0,
  },
];

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const navigate = useNavigate();

  const addContact = () => {
    if (!newContactName.trim()) return;
    
    const newContact: Contact = {
      id: Date.now().toString(),
      name: newContactName,
      status: 'offline',
    };
    
    setContacts([...contacts, newContact]);
    setNewContactName('');
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openChat = (contactId: string) => {
    navigate(`/chat/${contactId}`);
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
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-nothing-white">
              <Plus />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-nothing-black border-nothing-darkgray">
            <SheetHeader>
              <SheetTitle className="text-nothing-white">Add Contact</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <Input
                placeholder="Contact name"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="bg-nothing-darkgray border-nothing-gray text-nothing-white"
              />
              <Button 
                onClick={addContact} 
                className="w-full bg-nothing-red hover:bg-nothing-red/90 text-nothing-white"
              >
                Add Contact
              </Button>
            </div>
          </SheetContent>
        </Sheet>
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
              onClick={() => openChat(contact.id)}
            >
              <div className="relative mr-3">
                {contact.avatar ? (
                  <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-nothing-gray flex items-center justify-center">
                    <User size={20} className="text-nothing-white" />
                  </div>
                )}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-nothing-black ${
                  contact.status === 'online' ? 'bg-nothing-red' : 
                  contact.status === 'away' ? 'bg-yellow-500' : 'bg-nothing-lightgray'
                }`} />
              </div>
              
              <div className="flex-1">
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
