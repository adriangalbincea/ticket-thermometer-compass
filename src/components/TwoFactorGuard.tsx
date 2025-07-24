import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TwoFactorPrompt } from './TwoFactorPrompt';

interface TwoFactorGuardProps {
  children: React.ReactNode;
}

export const TwoFactorGuard: React.FC<TwoFactorGuardProps> = ({ children }) => {
  const { user, check2FARequirement } = useAuth();
  const [needsTwoFA, setNeedsTwoFA] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkTwoFARequirement = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('TwoFactorGuard: Checking 2FA requirement for user:', user.email);
        
        // Check if 2FA is required for this user
        const requires2FA = await check2FARequirement();
        console.log('TwoFactorGuard: 2FA required:', requires2FA);
        
        if (requires2FA) {
          // Check if user has completed 2FA in this session
          const sessionStorage2FA = sessionStorage.getItem(`2fa_verified_${user.id}`);
          console.log('TwoFactorGuard: Session 2FA status:', sessionStorage2FA);
          
          if (!sessionStorage2FA) {
            // Check if user has 2FA enabled
            const { data: userTwoFA } = await supabase
              .from('user_2fa')
              .select('is_enabled')
              .eq('user_id', user.id)
              .single();

            console.log('TwoFactorGuard: User 2FA data:', userTwoFA);

            // If 2FA is required, user must either have it enabled or needs to set it up
            console.log('TwoFactorGuard: Showing 2FA prompt/setup');
            setNeedsTwoFA(true);
            setLoading(false);
            return;
          }
        }
        
        console.log('TwoFactorGuard: No 2FA needed, showing content');
        setNeedsTwoFA(false);
        setLoading(false);
      } catch (error) {
        console.error('TwoFactorGuard: Error checking 2FA:', error);
        setLoading(false);
      }
    };

    checkTwoFARequirement();
  }, [user, check2FARequirement]);

  const handle2FASuccess = async () => {
    console.log('TwoFactorGuard: 2FA verified successfully');
    if (user) {
      // Mark 2FA as verified for this session
      sessionStorage.setItem(`2fa_verified_${user.id}`, 'true');
    }
    setNeedsTwoFA(false);
  };

  const handle2FACancel = async () => {
    console.log('TwoFactorGuard: 2FA cancelled, signing out');
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Verifying authentication...</div>
      </div>
    );
  }

  if (needsTwoFA) {
    return (
      <TwoFactorPrompt 
        onSuccess={handle2FASuccess}
        onCancel={handle2FACancel}
      />
    );
  }

  return <>{children}</>;
};