import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, ShieldCheck, ShieldX, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TwoFactorSetup } from './TwoFactorSetup';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const TwoFactorManagement: React.FC = () => {
  const [twoFAStatus, setTwoFAStatus] = useState<{
    enabled: boolean;
    backupCodesCount: number;
  } | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTwoFAStatus();
  }, []);

  const loadTwoFAStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_2fa')
        .select('is_enabled, backup_codes')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      if (data) {
        setTwoFAStatus({
          enabled: data.is_enabled,
          backupCodesCount: data.backup_codes?.length || 0
        });
      } else {
        setTwoFAStatus({
          enabled: false,
          backupCodesCount: 0
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load 2FA status: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('user_2fa')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setTwoFAStatus({ enabled: false, backupCodesCount: 0 });
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled for your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to disable 2FA: " + error.message,
        variant: "destructive",
      });
    }
  };

  const regenerateBackupCodes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Generate new backup codes
      const newBackupCodes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substr(2, 8).toUpperCase()
      );

      const { error } = await supabase
        .from('user_2fa')
        .update({ backup_codes: newBackupCodes })
        .eq('user_id', user.id);

      if (error) throw error;

      setTwoFAStatus(prev => prev ? { ...prev, backupCodesCount: 8 } : null);

      // Download the new codes
      const codesText = newBackupCodes.join('\n');
      const blob = new Blob([codesText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wiseserve-new-backup-codes.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Codes Regenerated",
        description: "New backup codes have been generated and downloaded.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to regenerate backup codes: " + error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading 2FA settings...</div>
        </CardContent>
      </Card>
    );
  }

  if (showSetup) {
    return (
      <TwoFactorSetup 
        onComplete={() => {
          setShowSetup(false);
          loadTwoFAStatus();
        }}
        onCancel={() => setShowSetup(false)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {twoFAStatus?.enabled ? (
              <ShieldCheck className="h-6 w-6 text-green-600" />
            ) : (
              <ShieldX className="h-6 w-6 text-gray-400" />
            )}
            <div>
              <div className="font-medium">
                {twoFAStatus?.enabled ? 'Enabled' : 'Disabled'}
              </div>
              <div className="text-sm text-muted-foreground">
                {twoFAStatus?.enabled 
                  ? `${twoFAStatus.backupCodesCount} backup codes remaining`
                  : 'Two-factor authentication is not enabled'
                }
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {twoFAStatus?.enabled ? (
              <>
                <Button onClick={regenerateBackupCodes} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Backup Codes
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Disable 2FA
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove two-factor authentication from your account, making it less secure.
                        Are you sure you want to continue?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={disable2FA} className="bg-destructive text-destructive-foreground">
                        Disable 2FA
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <Button onClick={() => setShowSetup(true)}>
                Enable 2FA
              </Button>
            )}
          </div>
        </div>

        {!twoFAStatus?.enabled && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication adds an extra layer of security to your account.
              When enabled, you'll need both your password and a code from your phone to sign in.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};