import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

// Role lives in app_metadata (server-set at signup, see architecture §1).
const roleFromSession = (s) => s?.user?.app_metadata?.role ?? null;

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = async () => {
    const result = await supabase.auth.signOut();
    queryClient.clear();
    return result;
  };

  const value = {
    session,
    user: session?.user ?? null,
    role: roleFromSession(session),
    isSignedIn: !!session,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
