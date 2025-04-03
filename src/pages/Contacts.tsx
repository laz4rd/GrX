
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Edit, User, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile } from '@/models/Contact';

interface ContactWithProfile {
  id: string;
  contact_id: string;
  user_id: string;
  created_at: string | null;
  profile: Profile;
}

const Contacts = () => {
  const [contacts, setContacts] = useState<ContactWithProfile[]>([]);
  const [search, setSearch] = useState('');
  const [showSearchContacts, setShowSearchContacts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchContacts();

    // Subscribe to new messages for notifications
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const message = payload.new as any;
          
          // Show notification if message is sent to current user
          if (message.receiver_id === user.id && !window.location.pathname.includes(`/chat/${message.sender_id}`)) {
            // Find the contact name
            const contact = contacts.find(c => c.contact_id === message.sender_id);
            const contactName = contact?.profile.username || 'Someone';
            
            toast.info(`New message from ${contactName}`, {
              action: {
                label: "View",
                onClick: () => navigate(`/chat/${message.sender_id}`),
              },
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate, contacts]);

  const fetchContacts = async () => {
    try {
      // First get all contacts for the current user
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user?.id);

      if (contactsError) throw contactsError;
      
      if (!contactsData || contactsData.length === 0) {
        setContacts([]);
        return;
      }
      
      // Then get the profile information for each contact
      const contactsWithProfiles = await Promise.all(
        contactsData.map(async (contact) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', contact.contact_id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            return null;
          }
          
          return {
            ...contact,
            profile: profileData as Profile
          };
        })
      );
      
      // Filter out any null results (failed profile fetches)
      const validContacts = contactsWithProfiles.filter(
        (contact): contact is ContactWithProfile => contact !== null
      );
      
      setContacts(validContacts);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      toast.error('Could not load contacts');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchContacts = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      // Search for profiles that match the query (case insensitive)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', user?.id) // Exclude current user
        .limit(10);

      if (error) throw error;

      // Filter out contacts that are already in the user's contacts
      const filteredResults = data.filter(profile => 
        !contacts.some(contact => contact.contact_id === profile.id)
      );
      
      setSearchResults(filteredResults);
    } catch (error: any) {
      console.error('Error searching profiles:', error);
      toast.error('Error searching for contacts');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddContact = async (profileId: string) => {
    try {
      // Check if contact already exists
      const existingContact = contacts.find(
        contact => contact.contact_id === profileId
      );

      if (existingContact) {
        toast.error('Contact already exists.');
        return;
      }

      // Add contact
      const { error } = await supabase.from('contacts').insert([
        {
          user_id: user?.id,
          contact_id: profileId,
        },
      ]);

      if (error) throw error;

      toast.success('Contact added successfully!');
      setSearchQuery('');
      setShowSearchContacts(false);
      fetchContacts();
    } catch (error: any) {
      console.error('Error adding contact:', error);
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Modified search logic to allow partial matches
  const filteredContacts = contacts.filter(contact => 
    contact.profile.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen max-h-screen bg-nothing-black overflow-hidden dot-matrix">
      <div className="flex justify-between items-center p-4 border-b border-nothing-darkgray">
        <div className="flex items-center">
          <h1 className="text-nothing-white text-xl font-medium">Contacts</h1>
        </div>
        <div className="flex">
          <Button
            variant="ghost"
            className="text-nothing-white"
            onClick={() => navigate('/customize')}
          >
            <User size={20} />
          </Button>
          <Button
            variant="ghost"
            className="text-nothing-white ml-2"
            onClick={() => setShowSearchContacts(true)}
          >
            <Search size={20} />
          </Button>
          <Button
            variant="ghost"
            className="text-nothing-white ml-2"
            onClick={handleLogout}
          >
            <LogOut size={20} />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Input
          type="text"
          placeholder="Search contacts..."
          className="bg-nothing-darkgray border-nothing-gray text-nothing-white"
          value={search}
          onChange={handleSearch}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-2">
          {filteredContacts.length > 0 ? (
            filteredContacts.map(contact => (
              <Button
                key={contact.id}
                variant="ghost"
                className="flex items-center justify-start w-full p-4 hover:bg-nothing-darkgray text-nothing-white rounded-lg"
                onClick={() => navigate(`/chat/${contact.contact_id}`)}
              >
                <Avatar className="mr-4">
                  <AvatarFallback />
                </Avatar>
                <div className="flex flex-col items-start">
                  <span>{contact.profile.username}</span>
                  <span className="text-xs text-nothing-lightgray">
                    {contact.profile.status || 'No status'}
                  </span>
                </div>
              </Button>
            ))
          ) : search ? (
            <div className="text-center p-4 text-nothing-white">
              No contacts found matching "{search}"
            </div>
          ) : (
            <div className="text-center p-4 text-nothing-white">
              You have no contacts yet. Search for contacts using the search button.
            </div>
          )}
        </div>
      </div>

      <Dialog open={showSearchContacts} onOpenChange={setShowSearchContacts}>
        <DialogContent className="bg-nothing-black border-nothing-darkgray text-nothing-white">
          <DialogHeader>
            <DialogTitle>Search for Contacts</DialogTitle>
            <DialogDescription>
              Search for users by username to add them to your contacts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                id="searchQuery"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-nothing-darkgray border-nothing-gray text-nothing-white flex-1"
                placeholder="Enter username to search"
              />
              <Button onClick={handleSearchContacts} disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="max-h-60 overflow-y-auto border border-nothing-darkgray rounded-md">
                {searchResults.map(profile => (
                  <div 
                    key={profile.id} 
                    className="p-2 flex items-center justify-between hover:bg-nothing-darkgray border-b border-nothing-darkgray last:border-b-0"
                  >
                    <div className="flex items-center">
                      <Avatar className="mr-2">
                        <AvatarFallback />
                      </Avatar>
                      <div>
                        <p className="text-nothing-white">{profile.username}</p>
                        <p className="text-xs text-nothing-lightgray">{profile.status || 'No status'}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="text-nothing-white hover:bg-nothing-gray" 
                      onClick={() => handleAddContact(profile.id)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchQuery && !isSearching ? (
              <p className="text-nothing-lightgray text-center p-4">No users found matching "{searchQuery}"</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowSearchContacts(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contacts;
