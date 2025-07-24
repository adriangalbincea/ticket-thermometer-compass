import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { LogIn } from 'lucide-react';
import { TwoFactorPrompt } from '@/components/TwoFactorPrompt';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [show2FA, setShow2FA] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [checking2FA, setChecking2FA] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { check2FARequirement } = useAuth();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      // Don't check initial session if we're already in 2FA flow
      if (checking2FA || show2FA) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        navigate('/admin');
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Don't interfere with 2FA flow
      if (checking2FA || show2FA) return;
      
      if (session?.user) {
        setUser(session.user);
        navigate('/admin');
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, checking2FA, show2FA]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setChecking2FA(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setChecking2FA(false);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('Checking 2FA requirement for user:', data.user.email);
      // Check if 2FA is required for this user
      const requires2FA = await check2FARequirement();
      console.log('2FA required:', requires2FA);
      
      if (requires2FA) {
        // Check if user has 2FA enabled
        const { data: userTwoFA } = await supabase
          .from('user_2fa')
          .select('is_enabled')
          .eq('user_id', data.user.id)
          .single();

        console.log('User 2FA data:', userTwoFA);

        if (userTwoFA?.is_enabled) {
          console.log('Showing 2FA prompt for user');
          // Store pending user and show 2FA prompt
          setPendingUser(data.user);
          setShow2FA(true);
          // Sign out immediately to prevent access without 2FA
          await supabase.auth.signOut();
          return;
        } else {
          // Admin user needs to set up 2FA but hasn't yet
          setChecking2FA(false);
          await supabase.auth.signOut();
          toast({
            title: "2FA Setup Required",
            description: "As an admin, you must set up two-factor authentication. Please go to your profile settings to enable 2FA.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // No 2FA required, proceed with normal login
      setChecking2FA(false);

      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
    } catch (error) {
      setChecking2FA(false);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      if (!show2FA) {
        setChecking2FA(false);
      }
    }
  };

  const handle2FASuccess = async () => {
    if (!pendingUser) return;
    
    // Re-authenticate the user after successful 2FA
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive",
      });
      setShow2FA(false);
      setPendingUser(null);
      setChecking2FA(false);
      return;
    }

    setShow2FA(false);
    setPendingUser(null);
    setChecking2FA(false);
    
    toast({
      title: "Welcome back!",
      description: "You've been signed in successfully.",
    });
    
    // Let the auth state listener handle navigation
  };

  const handle2FACancel = async () => {
    setShow2FA(false);
    setPendingUser(null);
    setChecking2FA(false);
    // Sign out the user since they cancelled 2FA
    await supabase.auth.signOut();
  };

  if (show2FA) {
    return (
      <TwoFactorPrompt 
        onSuccess={handle2FASuccess}
        onCancel={handle2FACancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        {/* WiseServe Logo */}
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/00a9f4fc-8ab5-4dd4-85ff-7abd95d3761e.png" 
            alt="WiseServe Logo" 
            className="h-24 mx-auto mb-4"
          />
        </div>

        <Card className="shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
            <p className="text-muted-foreground">Sign in to access the feedback dashboard</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary" 
                disabled={loading}
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;