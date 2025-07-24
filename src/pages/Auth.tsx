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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        navigate('/admin');
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
        return;
      }

      // Check if 2FA is required for this user
      const requires2FA = await check2FARequirement();
      
      if (requires2FA) {
        // Check if user has 2FA enabled
        const { data: userTwoFA } = await supabase
          .from('user_2fa')
          .select('is_enabled')
          .eq('user_id', data.user.id)
          .single();

        if (userTwoFA?.is_enabled) {
          // Store pending user and show 2FA prompt
          setPendingUser(data.user);
          setShow2FA(true);
          
          // Sign out temporarily until 2FA is verified
          await supabase.auth.signOut();
          return;
        } else {
          // Admin user needs to set up 2FA but hasn't yet
          toast({
            title: "2FA Setup Required",
            description: "As an admin, you must set up two-factor authentication. Please go to your profile settings to enable 2FA.",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
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
      return;
    }

    setShow2FA(false);
    setPendingUser(null);
    
    toast({
      title: "Welcome back!",
      description: "You've been signed in successfully.",
    });
    
    navigate('/admin');
  };

  const handle2FACancel = async () => {
    setShow2FA(false);
    setPendingUser(null);
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