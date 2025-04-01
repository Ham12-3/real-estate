'use client';

import { useEffect, useState } from 'react';
  import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PropertyList from "@/components/property-list";
import { User } from '@supabase/supabase-js';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting user:', error);
      } else {
        setUser(data.user);
      }
      setLoading(false);
    }
    
    getUser();
  }, []);

  const handleSignIn = async () => {
    try {
      setAuthLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Sign in successful:', data);
      window.location.reload();
    } catch (error: any) {
      console.error('Sign-in failed:', error);
      alert(`Failed to sign in: ${error.message || 'Unknown error'}`);
    } finally {
      setAuthLoading(false);
    }
  };
  
  // Add a signup function for creating test users
  const handleSignUp = async () => {
    try {
      setAuthLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      alert('Sign up successful! Check your email to confirm your account.');
      console.log('Sign up data:', data);
    } catch (error: any) {
      console.error('Sign-up failed:', error);
      alert(`Failed to sign up: ${error.message || 'Unknown error'}`);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Available Properties</h1>
        
        {loading ? (
          <p>Loading...</p>
        ) : user ? (
          <div className="flex items-center gap-4">
            <p>Logged in as: {user.email}</p>
            <Link href="/properties/new">
              <Button>List Your Property</Button>
            </Link>
            <Button variant="outline" onClick={() => supabase.auth.signOut().then(() => window.location.reload())}>
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 border p-4 rounded">
            <h2 className="font-bold mb-2">Authentication</h2>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email"
              className="px-4 py-2 border rounded"
            />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password"
              className="px-4 py-2 border rounded"
            />
            <div className="flex gap-2">
              <Button onClick={handleSignIn} disabled={authLoading}>
                {authLoading ? 'Processing...' : 'Login'}
              </Button>
              <Button onClick={handleSignUp} variant="outline" disabled={authLoading}>
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <PropertyList />
    </div>
  );
}
