import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TwoFactorSetup } from './TwoFactorSetup';

interface TwoFactorPromptProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const TwoFactorPrompt: React.FC<TwoFactorPromptProps> = ({ onSuccess, onCancel }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkTwoFAStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: userTwoFA } = await supabase
          .from('user_2fa')
          .select('is_enabled')
          .eq('user_id', user.id)
          .maybeSingle();

        setNeedsSetup(!userTwoFA?.is_enabled);
      } catch (error) {
        console.error('Error checking 2FA status:', error);
        setNeedsSetup(true); // Default to setup if there's an error
      }
    };

    checkTwoFAStatus();
  }, []);

  const verifyCode = async () => {
    if (!code || code.length < 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid authentication code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      if (useBackupCode) {
        // Handle backup code verification using edge function
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No session found');

        const { data, error } = await supabase.functions.invoke('verify-totp', {
          body: { backup_code: code },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error || !data?.success) {
          throw new Error(data?.error || 'Invalid backup code');
        }

        toast({
          title: "Success",
          description: "Backup code verified successfully. Please set up a new authenticator device.",
        });
        
        onSuccess();
      } else {
        // Handle TOTP verification using edge function
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No session found');

        const { data, error } = await supabase.functions.invoke('verify-totp', {
          body: { token: code },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error || !data?.success) {
          throw new Error(data?.error || 'Invalid authentication code');
        }

        toast({
          title: "Success",
          description: "Two-factor authentication verified successfully.",
        });
        
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && code) {
      verifyCode();
    }
  };

  // Show loading while checking setup status
  if (needsSetup === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Checking 2FA status...</div>
      </div>
    );
  }

  // Show setup component if 2FA is not configured
  if (needsSetup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
        <TwoFactorSetup 
          onComplete={() => {
            setNeedsSetup(false);
            onSuccess();
          }}
          onCancel={onCancel}
        />
      </div>
    );
  }

  // Show verification component if 2FA is already configured
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Admin accounts require two-factor authentication. Please enter your authentication code to continue.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="auth-code">
              {useBackupCode ? 'Backup Code' : 'Authentication Code'}
            </Label>
            <Input
              id="auth-code"
              type="text"
              placeholder={useBackupCode ? "Enter backup code" : "000000"}
              value={code}
              onChange={(e) => {
                const value = useBackupCode 
                  ? e.target.value.toUpperCase()
                  : e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
              }}
              onKeyDown={handleKeyDown}
              className="text-center text-lg font-mono tracking-widest"
              maxLength={useBackupCode ? 8 : 6}
              autoFocus
            />
          </div>

          <Button onClick={verifyCode} disabled={loading || !code} className="w-full">
            {loading ? "Verifying..." : "Verify Code"}
          </Button>

          <div className="text-center space-y-2">
            <Button 
              variant="link" 
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setCode('');
              }}
              className="text-sm"
            >
              {useBackupCode ? 'Use authenticator code instead' : 'Use backup code instead'}
            </Button>
            
            <div>
              <Button variant="link" onClick={onCancel} className="text-sm">
                Sign out and try again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};