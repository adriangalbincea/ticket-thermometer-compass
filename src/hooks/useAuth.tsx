import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  requires2FA: boolean;
  signOut: () => Promise<void>;
  check2FARequirement: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  requires2FA: false,
  signOut: async () => {},
  check2FARequirement: async () => false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const check2FARequirement = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get client IP first
      let clientIp = null;
      try {
        const { data: ipData } = await supabase.functions.invoke('get-client-ip');
        clientIp = ipData?.ip;
        console.log('Client IP for 2FA check:', clientIp);
      } catch (error) {
        console.log('Could not get client IP, proceeding without IP check:', error);
      }

      // Check 2FA requirement with IP
      const { data, error } = await supabase
        .rpc('is_2fa_required_with_ip', { 
          user_id: user.id,
          user_ip: clientIp 
        });

      if (error) {
        console.error('Error checking 2FA requirement:', error);
        // Fallback to original function without IP
        const { data: fallbackData } = await supabase
          .rpc('is_2fa_required', { user_id: user.id });
        return fallbackData || false;
      }

      return data || false;
    } catch (error) {
      console.error('Error checking 2FA requirement:', error);
      return false;
    }
  };

  const signOut = async () => {
    setRequires2FA(false);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, requires2FA, signOut, check2FARequirement }}>
      {children}
    </AuthContext.Provider>
  );
};