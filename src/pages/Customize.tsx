
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/models/Contact';

const customizeSchema = z.object({
  username: z.string().min(2, { message: 'Username must be at least 2 characters' }),
  status: z.string().optional(),
});

type CustomizeFormValues = z.infer<typeof customizeSchema>;

const Customize: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<CustomizeFormValues>({
    resolver: zodResolver(customizeSchema),
    defaultValues: {
      username: '',
      status: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setProfile(data);
        form.reset({
          username: data.username || '',
          status: data.status || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Could not load profile information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, form]);

  const handleSubmit = async (values: CustomizeFormValues) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: values.username,
          status: values.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success('Profile updated successfully');
      navigate('/contacts');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-nothing-black dot-matrix">
      <div className="flex items-center p-4 border-b border-nothing-darkgray">
        <Button 
          variant="ghost" 
          className="text-nothing-white p-2 mr-2"
          onClick={() => navigate('/contacts')}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-nothing-white text-xl font-medium">Customize Profile</h1>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-md mx-auto mt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-nothing-white">Display Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your name" 
                        className="bg-nothing-darkgray border-nothing-gray text-nothing-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-nothing-white">Status</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="What's on your mind?" 
                        className="bg-nothing-darkgray border-nothing-gray text-nothing-white"
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-nothing-red hover:bg-nothing-red/90 text-nothing-white flex items-center justify-center gap-2 h-12 rounded-xl mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
                <Save size={16} />
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Customize;
