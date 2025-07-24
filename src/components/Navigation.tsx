import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, MessageSquare, Settings, Home, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  const publicNavItems: any[] = [];

  const protectedNavItems = [
    { path: '/admin', label: 'Home', icon: Home },
    { path: '/config', label: 'Configuration', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Card className="mb-6 shadow-elegant">
      <CardContent className="p-4">
        <nav className="flex flex-wrap justify-between items-center">
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