
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { LogOut, Edit, User } from 'lucide-react';
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
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactEmail, setNewContactEmail] = useState('');
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

  const handleAddContact = async () => {
    try {
      // First, find the profile by email
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', newContactEmail)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          toast.error('User with this email or username not found.');
        } else {
          throw profileError;
        }
        return;
      }

      const newProfile = profileData as Profile;

      if (!newProfile) {
        toast.error('User with this email or username not found.');
        return;
      }

      if (newProfile.id === user?.id) {
        toast.error('You can\'t add yourself as a contact.');
        return;
      }

      const existingContact = contacts.find(
        contact => contact.contact_id === newProfile.id
      );

      if (existingContact) {
        toast.error('Contact already exists.');
        return;
      }

      const { error } = await supabase.from('contacts').insert([
        {
          user_id: user?.id,
          contact_id: newProfile.id,
        },
      ]);

      if (error) throw error;

      toast.success('Contact added successfully!');
      setNewContactEmail('');
      setShowAddContact(false);
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
            onClick={() => setShowAddContact(true)}
          >
            <Edit size={20} />
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
        {filteredContacts.map(contact => (
          <Button
            key={contact.id}
            variant="ghost"
            className="flex items-center justify-start w-full p-4 hover:bg-nothing-darkgray text-nothing-white"
            onClick={() => navigate(`/chat/${contact.contact_id}`)}
          >
            <Avatar className="mr-4">
              <AvatarImage src={contact.profile.avatar_url || ''} />
              <AvatarFallback>{contact.profile.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>{contact.profile.username}</span>
          </Button>
        ))}
      </div>

      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="bg-nothing-black border-nothing-darkgray text-nothing-white">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Enter the username of the user you want to add as a contact.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                type="text"
                id="username"
                value={newContactEmail}
                onChange={e => setNewContactEmail(e.target.value)}
                className="col-span-3 bg-nothing-darkgray border-nothing-gray text-nothing-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowAddContact(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleAddContact}>
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contacts;
