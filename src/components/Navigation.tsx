import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, MessageSquare, Settings, Home, LogOut, LogIn, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
        } else {
          setUserRole(data?.role || 'user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, [user]);
  
  const publicNavItems: any[] = [];

  const getNavItemsForRole = () => {
    const baseItems = [
      { path: '/admin', label: 'Dashboard', icon: Home },
      { path: '/profile', label: 'Profile', icon: User }
    ];

    // Don't show any role-specific items until userRole is loaded
    if (!userRole) {
      return baseItems;
    }

    if (userRole === 'monitoring') {
      return [
        ...baseItems,
        { path: '/monitoring', label: 'Monitoring Board', icon: BarChart3 }
      ];
    }

    if (userRole === 'admin') {
      return [
        ...baseItems,
        { path: '/monitoring', label: 'Monitoring Board', icon: BarChart3 },
        { path: '/generate-links', label: 'Generate Links', icon: MessageSquare },
        { path: '/config', label: 'Configuration', icon: Settings }
      ];
    }

    // Default for 'user' role - all except config
    return [
      ...baseItems,
      { path: '/monitoring', label: 'Monitoring Board', icon: BarChart3 },
      { path: '/generate-links', label: 'Generate Links', icon: MessageSquare }
    ];
  };

  const protectedNavItems = getNavItemsForRole();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Card className="mb-6 shadow-elegant">
      <CardContent className="p-4">
        <nav className="flex flex-wrap justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Wiseserve Logo */}
            <img 
              src="/lovable-uploads/a731101c-1c01-4a4d-b918-86bf17193d27.png" 
              alt="Wiseserve" 
              className="h-8 w-8"
            />
            
            <div className="flex flex-wrap gap-2">
            {publicNavItems.map(({ path, label, icon: Icon }) => (
              <Button
                key={path}
                variant={isActive(path) ? "default" : "outline"}
                asChild
                className={isActive(path) ? "bg-gradient-primary" : ""}
              >
                <NavLink to={path} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              </Button>
            ))}
            
            {user && protectedNavItems.map(({ path, label, icon: Icon }) => (
              <Button
                key={path}
                variant={isActive(path) ? "default" : "outline"}
                asChild
                className={isActive(path) ? "bg-gradient-primary" : ""}
              >
                <NavLink to={path} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              </Button>
            ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <NavLink to="/auth" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Admin Login
                </NavLink>
              </Button>
            )}
          </div>
        </nav>
      </CardContent>
    </Card>
  );
};