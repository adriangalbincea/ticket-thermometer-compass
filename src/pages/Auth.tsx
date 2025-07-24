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
  const [checking2FA, setChecking2FA] = useState(false);
  const [user, setUser] = useState(null);
  const [show2FA, setShow2FA] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { check2FARequirement } = useAuth();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        navigate('/admin');
      }
    };

    checkUser();

    // Listen for auth changes - but don't navigate automatically
    // Let the component handle navigation based on 2FA requirements
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, 'checking2FA:', checking2FA);
      if (session?.user) {
        setUser(session.user);
        // Only navigate if we're not checking 2FA
        if (!checking2FA && !show2FA) {
          navigate('/admin');
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if 2FA is required for this user
      console.log('Checking 2FA requirement...');
      const requires2FA = await check2FARequirement();
      console.log('2FA required result:', requires2FA);
      
      if (requires2FA) {
        console.log('2FA is required, checking if user has it enabled...');
        // Check if user has 2FA enabled
        const { data: userTwoFA } = await supabase
          .from('user_2fa')
          .select('is_enabled')
          .eq('user_id', data.user.id)
          .single();

        console.log('User 2FA status:', userTwoFA);

        if (userTwoFA?.is_enabled) {
          console.log('User has 2FA enabled, showing prompt...');
          console.log('Current show2FA state before setting:', show2FA);
          // Show 2FA prompt - keep user logged in
          setPendingUser(data.user);
          setShow2FA(true);
          console.log('Called setShow2FA(true)');
          setLoading(false);
          setChecking2FA(false);
          return;
        } else {
          // Admin user needs to set up 2FA but hasn't yet
          await supabase.auth.signOut();
          toast({
            title: "2FA Setup Required",
            description: "As an admin, you must set up two-factor authentication. Please go to your profile settings to enable 2FA.",
            variant: "destructive",
          });
          setLoading(false);
          setChecking2FA(false);
          return;
        }
      } else {
        console.log('2FA is not required for this user');
        setChecking2FA(false);
      }

      // No 2FA required, proceed with normal login
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
      
      // Navigate to admin since no 2FA required
      navigate('/admin');
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setChecking2FA(false);
    }
  };

  const handle2FASuccess = async () => {
    setShow2FA(false);
    setPendingUser(null);
    
    toast({
      title: "Welcome back!",
      description: "Two-factor authentication verified successfully.",
    });
    
    // Navigate to admin after successful 2FA
    navigate('/admin');
  };

  const handle2FACancel = async () => {
    setShow2FA(false);
    setPendingUser(null);
    await supabase.auth.signOut();
  };

  console.log('Auth render - show2FA:', show2FA, 'pendingUser:', !!pendingUser);

  if (show2FA) {
    console.log('Rendering 2FA prompt component');
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