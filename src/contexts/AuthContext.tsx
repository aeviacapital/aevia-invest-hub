import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string, invitationCode: string, referralCode?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  profile: any;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();

  const refreshProfile = async () => {
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setProfile(data);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            refreshProfile();
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          refreshProfile();
        }, 0);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  //  Notify admin email via Resend
const notifyAdmin = async (userEmail: string) => {
  try {
    const {data} = await supabase.auth.getSession(); 
    const token = data?.session?.access_token; 
    const res = await fetch(
      "https://niwhcvzhvjqrqhyayarv.supabase.co/functions/v1/send-login-alert",
      {
        method: "POST", headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email: userEmail }),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      console.error("Error sending email:", data);
    } else {
      console.log("Login alert sent successfully");
    }
  } catch (err) {
    console.error("Error notifying admin:", err);
  }
};
  
  
  const signUp = async (email: string, password: string, fullName: string, invitationCode: string, referralCode?: string) => {
    try {
      const { data: codeData, error: codeError } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('code', invitationCode)
        .eq('is_used', false)
        .single();

      if (codeError || !codeData) {
        return { error: { message: 'Invalid or expired invitation code' } };
      }

      let referrerId = null;
      if (referralCode) {
        const { data: referrerData } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('referral_code', referralCode)
          .single();

        if (referrerData) referrerId = referrerData.user_id;
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: fullName, invitation_code: invitationCode },
        },
      });

      if (!error && data.user) {
        await supabase
          .from('invitation_codes')
          .update({ is_used: true, used_at: new Date().toISOString() })
          .eq('id', codeData.id);

        if (referrerId) {
          await supabase
            .from('profiles')
            .update({ referred_by: referrerId })
            .eq('user_id', data.user.id);

          await supabase
            .from('referrals')
            .insert({ referrer_id: referrerId, referred_id: data.user.id });
        }

        toast({
          title: 'Success',
          description: 'Account created successfully! Please check your email for verification.',
        });
      }

      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  // ✅ Sign In + notify admin
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });

        // Notify admin asynchronously
        notifyAdmin(email);
      }

      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
    toast({
      title: 'Signed out',
      description: 'You have been successfully signed out.',
    });
    window.location.href = '/';
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    isLoading,
    profile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

