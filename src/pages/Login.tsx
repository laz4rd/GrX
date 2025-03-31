
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Mail, Github, Smartphone } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (provider: string) => {
    // In a real app, this would authenticate with the provider
    console.log(`Logging in with ${provider}`);
    navigate('/contacts');
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-nothing-black dot-matrix p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-nothing-white text-4xl font-bold mb-2 tracking-tighter">
            nothing<span className="text-nothing-red">.</span>chat
          </h1>
          <p className="text-nothing-lightgray text-sm mt-2 mb-12">
            sign in to continue
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            className="w-full bg-nothing-darkgray hover:bg-nothing-gray text-nothing-white flex items-center justify-center gap-2 h-12 rounded-xl"
            onClick={() => handleLogin('mail')}
          >
            <Mail size={18} />
            Continue with Email
          </Button>
          
          <Button 
            className="w-full bg-nothing-darkgray hover:bg-nothing-gray text-nothing-white flex items-center justify-center gap-2 h-12 rounded-xl"
            onClick={() => handleLogin('github')}
          >
            <Github size={18} />
            Continue with GitHub
          </Button>
          
          <Button 
            className="w-full bg-nothing-darkgray hover:bg-nothing-gray text-nothing-white flex items-center justify-center gap-2 h-12 rounded-xl"
            onClick={() => handleLogin('phone')}
          >
            <Smartphone size={18} />
            Continue with Phone
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-nothing-lightgray text-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
