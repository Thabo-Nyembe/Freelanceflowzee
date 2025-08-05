'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function LoginPage({ searchParams }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Debug component mounting
  console.log('LoginPage component rendered', { email, password: password.length > 0 ? '***' : 'empty' });
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted', { email, password: password ? '***' : 'empty' });
    setIsLoading(true);
    
    try {
      // Simulate login for testing
      if (email.includes('@') && password.length > 0) {
        console.log('Credentials valid, setting localStorage...');
        localStorage.setItem('kazi-auth', 'true');
        localStorage.setItem('kazi-user', JSON.stringify({ email, name: 'Test User' }));
        
        const redirect = typeof searchParams?.redirect === 'string' ? searchParams.redirect : '/dashboard';
        console.log('Redirecting to:', redirect);
        router.push(redirect);
      } else {
        console.error('Invalid credentials - email:', email, 'password length:', password.length);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen kazi-bg-light dark:kazi-bg-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md kazi-card">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/kazi-brand/logo.svg" 
              alt="KAZI" 
              className="h-8 w-auto"
            />
            <h1 className="text-2xl font-bold kazi-text-primary kazi-headline">KAZI</h1>
          </div>
          <CardTitle className="kazi-headline">Welcome Back</CardTitle>
          <CardDescription className="kazi-body">
            Sign in to your KAZI workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium kazi-text-dark dark:kazi-text-light kazi-body-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="thabo@kaleidocraft.co.za"
                className="mt-1 kazi-focus"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium kazi-text-dark dark:kazi-text-light kazi-body-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1 kazi-focus"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full btn-kazi-primary kazi-ripple kazi-focus"
              disabled={isLoading}
              onClick={(e) => {
                console.log('Button clicked');
                // Let the form onSubmit handle it
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 kazi-body">
              Test credentials: thabo@kaleidocraft.co.za / password1234
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 