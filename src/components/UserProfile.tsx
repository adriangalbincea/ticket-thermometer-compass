import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { User, Lock, Check, X } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Password validation
  const passwordRequirements = {
    lowercase: /[a-z]/.test(newPassword),
    uppercase: /[A-Z]/.test(newPassword),
    digits: /\d/.test(newPassword),
    minLength: newPassword.length >= 8,
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isPasswordValid) {
        toast({
          title: "Invalid Password",
          description: "Please ensure your password meets all requirements.",
          variant: "destructive",
        });
        return;
      }

      if (!passwordsMatch) {
        toast({
          title: "Passwords Don't Match",
          description: "Please ensure both password fields match.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: "Password Update Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Updated",
          description: "Your password has been changed successfully.",
        });
        
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Information */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input value={user?.id || ''} disabled className="font-mono text-sm" />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Change Password */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              
              {/* Password Requirements */}
              {newPassword && (
                <div className="space-y-2 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm font-medium text-muted-foreground">Password requirements:</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      {passwordRequirements.minLength ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span className={passwordRequirements.minLength ? 'text-green-700' : 'text-red-700'}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {passwordRequirements.lowercase ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span className={passwordRequirements.lowercase ? 'text-green-700' : 'text-red-700'}>
                        At least one lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {passwordRequirements.uppercase ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span className={passwordRequirements.uppercase ? 'text-green-700' : 'text-red-700'}>
                        At least one uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {passwordRequirements.digits ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span className={passwordRequirements.digits ? 'text-green-700' : 'text-red-700'}>
                        At least one number
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              
              {confirmPassword && (
                <div className="flex items-center gap-2 text-sm">
                  {passwordsMatch ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-green-700">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-red-700">Passwords don't match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-primary" 
              disabled={loading || !isPasswordValid || !passwordsMatch || !newPassword || !confirmPassword}
            >
              {loading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};