import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    invitationCode: string,
    referralCode?: string
  ) => Promise<{ error: any }>;
  verifyOtp: (email: string, password: string, otp: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  profile: any;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();

  // --- Profile Fetch ---
  const refreshProfile = async () => {
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      setProfile(data);
    }
  };

  // --- Auth State Sync ---
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) refreshProfile();
      else setProfile(null);
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) refreshProfile();
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Notify Admin (unchanged) ---
  const notifyAdmin = async (userEmail: string) => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-login-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: userEmail }),
      });
    } catch (err) {
      console.error('Error notifying admin:', err);
    }
  };

  // --- Sign Up via OTP Edge Function ---
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    invitationCode: string,
    referralCode?: string
  ) => {
    try {
      // validate invitation
      const { data: codeData, error: codeError } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('code', invitationCode)
        .eq('is_used', false)
        .single();
      if (codeError || !codeData) return { error: { message: 'Invalid or expired invitation code' } };

      let referrerId = null;
      if (referralCode) {
        const { data: referrerData } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('referral_code', referralCode)
          .single();
        if (referrerData) referrerId = referrerData.user_id;
      }

      // 🔹 call edge function
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auth-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, action: 'send_otp' }),
      });

      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Failed to send OTP' };

      toast({
        title: 'OTP Sent',
        description: 'Please check your email for your verification code.',
      });

      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  // --- Verify OTP ---
  const verifyOtp = async (email: string, password: string, otp: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auth-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, action: 'verify_otp' }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Invalid OTP' };

      // sign in after verification
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };

      toast({
        title: 'Email Verified',
        description: 'Your account has been verified and you are now signed in.',
      });

      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  // --- Sign In (same as before) ---
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        toast({ title: 'Welcome back!', description: 'You have successfully signed in.' });
        notifyAdmin(email);
      }
      return { error };
    } catch (err) {
      return { error: err };
    }
  };

  // --- Sign Out (same as before) ---
  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
    toast({ title: 'Signed out', description: 'You have been successfully signed out.' });
    window.location.href = '/';
  };

  const value = {
    user,
    session,
    signUp,
    verifyOtp,
    signIn,
    signOut,
    isLoading,
    profile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

