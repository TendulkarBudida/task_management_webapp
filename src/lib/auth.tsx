/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabaseClient';
import { NextRequest } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import payload from 'payload'

interface LocalUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

interface AuthContextType {
  user: LocalUser | null
  login: (email: string, password: string) => Promise<void>
  signup: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>
  logout: () => Promise<void>
  loginWithGoogle: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


export async function getUser(req: NextRequest) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  try {
    const payloadUser = await payload.find({
      collection: 'users',
      where: {
        supabaseId: {
          equals: session.user.id,
        },
      },
    })

    if (payloadUser.docs.length === 0) {
      const newUser = await payload.create({
        collection: 'users',
        data: {
          email: session.user.email || '',
          // @ts-expect-error
          supabaseId: session.user.id || ''
        },
      })
      return newUser
    }

    return payloadUser.docs[0]
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}



export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const { id, email, user_metadata } = session.user;
        setUser({
          id,
          email: email || '',
          firstName: user_metadata?.firstName,
          lastName: user_metadata?.lastName,
        });
      } else {
        setUser(null);
      }
      if (!session?.user) {
        router.push('/login');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email : email, password : password });
    if (error) {
      if (error.message === 'Email not confirmed') {
        // Handle the specific error for unconfirmed email
        alert('Please confirm your email before logging in.');
      } else {
        throw error;
      }
    }
  };

  const signup = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
  };

  

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );

  
}



