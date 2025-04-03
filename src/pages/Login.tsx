import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Github, Smartphone, ArrowRight, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const signupSchema = loginSchema.extend({
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const Login: React.FC = () => {
  const { signIn, signUp, signInWithGithub } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleLoginSubmit = async (values: LoginFormValues) => {
    try {
      await signIn(values.email, values.password);
      navigate('/contacts');
      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to log in. Please check your credentials.');
    }
  };

  const handleSignupSubmit = async (values: SignupFormValues) => {
    try {
      await signUp(values.email, values.password);
      toast.success('Account created! Please check your email to verify.');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
    }
  };

  const handleGithubLogin = async () => {
    try {
      await signInWithGithub();
    } catch (error) {
      console.error('GitHub login error:', error);
      toast.error('Failed to login with GitHub');
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    loginForm.reset();
    signupForm.reset();
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-nothing-black dot-matrix p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-nothing-white text-4xl font-bold mb-2 tracking-tighter">
            GrX<span className="text-nothing-red">.</span>
          </h1>
          <p className="text-nothing-lightgray text-sm mt-2 mb-8">
            {isLogin ? 'sign in to continue' : 'create an account'}
          </p>
        </div>

        {isLogin ? (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-nothing-white">Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="your@email.com" 
                        className="bg-nothing-darkgray border-nothing-gray text-nothing-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-nothing-white">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="bg-nothing-darkgray border-nothing-gray text-nothing-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-nothing-red hover:bg-nothing-red/90 text-nothing-white flex items-center justify-center gap-2 h-12 rounded-xl mt-6"
              >
                Sign In
                <ArrowRight size={16} />
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...signupForm}>
            <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-nothing-white">Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="your@email.com" 
                        className="bg-nothing-darkgray border-nothing-gray text-nothing-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-nothing-white">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="bg-nothing-darkgray border-nothing-gray text-nothing-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={signupForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-nothing-white">Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="bg-nothing-darkgray border-nothing-gray text-nothing-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-nothing-red hover:bg-nothing-red/90 text-nothing-white flex items-center justify-center gap-2 h-12 rounded-xl mt-6"
              >
                Create Account
                <User size={16} />
              </Button>
            </form>
          </Form>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-nothing-darkgray"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-nothing-black text-nothing-lightgray">or continue with</span>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            className="w-full bg-nothing-darkgray hover:bg-nothing-gray text-nothing-white flex items-center justify-center gap-2 h-12 rounded-xl"
            onClick={handleGithubLogin}
          >
            <Github size={18} />
            Continue with GitHub
          </Button>
        </div>

        <div className="text-center mt-8">
          <Button 
            variant="link" 
            className="text-nothing-lightgray hover:text-nothing-white"
            onClick={toggleAuthMode}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-nothing-lightgray text-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
