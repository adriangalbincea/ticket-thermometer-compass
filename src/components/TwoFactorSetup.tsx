import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Download, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

interface TwoFactorSetupProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateSecret();
  }, []);

  const generateSecret = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Generate a random secret
      const newSecret = new OTPAuth.Secret({ size: 20 });
      const secretBase32 = newSecret.base32;
      
      // Create TOTP URI
      const totp = new OTPAuth.TOTP({
        issuer: 'Wiseserve Feedback',
        label: user.email || 'Admin User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secretBase32,
      });

      // Generate QR code
      const qrUrl = await QRCode.toDataURL(totp.toString());
      
      setSecret(secretBase32);
      setQrCodeUrl(qrUrl);

      // Generate backup codes
      const codes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substr(2, 8).toUpperCase()
      );
      setBackupCodes(codes);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate 2FA setup: " + error.message,
        variant: "destructive",
      });
    }
  };

  const verifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Store the 2FA secret and backup codes
      const { error } = await supabase
        .from('user_2fa')
        .upsert({
          user_id: user.id,
          secret: secret,
          backup_codes: backupCodes,
          is_enabled: true
        });

      if (error) throw error;

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled for your account.",
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to enable 2FA: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wiseserve-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (step === 'setup') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Set up Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication adds an extra layer of security to your account.
              You'll need an authenticator app like Google Authenticator, Authy, or 1Password.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Step 1: Scan QR Code</h3>
              <div className="bg-white p-4 rounded-lg inline-block">
                {qrCodeUrl && <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />}
              </div>
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your authenticator app, or manually enter the secret key:
              </p>
              <code className="block bg-muted p-2 rounded text-sm font-mono break-all">
                {secret}
              </code>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Step 2: Save Backup Codes</h3>
              <p className="text-sm text-muted-foreground">
                Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
              </p>
              <div className="bg-muted p-3 rounded space-y-1">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm">{code}</div>
                ))}
              </div>
              <Button onClick={downloadBackupCodes} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Backup Codes
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => setStep('verify')} className="flex-1">
              Continue to Verification
            </Button>
            {onCancel && (
              <Button onClick={onCancel} variant="outline">
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Verify Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app to complete the setup.
        </p>
        
        <div className="space-y-2">
          <Label htmlFor="verification-code">Verification Code</Label>
          <Input
            id="verification-code"
            type="text"
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="text-center text-lg font-mono tracking-widest"
            maxLength={6}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={verifyAndEnable} disabled={loading || verificationCode.length !== 6} className="flex-1">
            {loading ? "Verifying..." : "Enable 2FA"}
          </Button>
          <Button onClick={() => setStep('setup')} variant="outline">
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};