import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Check, X, Edit2, Save, X as Cancel } from 'lucide-react';
import { TwoFactorManagement } from './TwoFactorManagement';

export const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<{ full_name: string; role?: string } | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
        } else {
          setUserProfile(data);
          // Set initial name for editing (excluding email addresses)
          setNewName(data?.full_name && data.full_name !== user?.email ? data.full_name : '');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Password validation
  const passwordRequirements = {
    lowercase: /[a-z]/.test(newPassword),
    uppercase: /[A-Z]/.test(newPassword),
    digits: /\d/.test(newPassword),
    minLength: newPassword.length >= 8,
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword;

  // Helper function to determine if full_name is actually a name or just email
  const getDisplayName = () => {
    if (!userProfile?.full_name || userProfile.full_name === user?.email) {
      return 'Not set';
    }
    return userProfile.full_name;
  };

  const handleNameUpdate = async () => {
    if (!newName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid name.",
        variant: "destructive",
      });
      return;
    }

    setNameLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: newName.trim() })
        .eq('id', user?.id);

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setUserProfile({ full_name: newName.trim() });
        setEditingName(false);
        toast({
          title: "Name Updated",
          description: "Your name has been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setNameLoading(false);
    }
  };

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
          description: "Your password has been changed successfully. Please sign in again.",
        });
        
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Sign out user and redirect to login
        setTimeout(async () => {
          await signOut();
          navigate('/auth');
        }, 2000);
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
    <div className="max-w-3xl mx-auto space-y-6">{/* Reduced from 2xl to 3xl for slightly larger but still compact */}
      {/* Profile Information */}
      <Card className="shadow-elegant">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <div className="flex items-center gap-2">
                {editingName ? (
                  <>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter your name"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleNameUpdate}
                      disabled={nameLoading || !newName.trim()}
                      className="px-3"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingName(false);
                        setNewName(userProfile?.full_name && userProfile.full_name !== user?.email ? userProfile.full_name : '');
                      }}
                      className="px-3"
                    >
                      <Cancel className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Input value={getDisplayName()} disabled className="flex-1" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingName(true)}
                      className="px-3"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Change Password */}
      <Card className="shadow-elegant">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
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

      {/* Show 2FA Management for all users, but especially important for admins */}
      <Separator />
      <TwoFactorManagement />
    </div>
  );
};