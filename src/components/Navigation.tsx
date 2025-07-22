import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, MessageSquare, Settings, Home } from 'lucide-react';

export const Navigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/feedback', label: 'Feedback Form', icon: MessageSquare },
    { path: '/admin', label: 'Dashboard', icon: BarChart3 },
    { path: '/config', label: 'Configuration', icon: Settings },
  ];

  return (
    <Card className="mb-6 shadow-elegant">
      <CardContent className="p-4">
        <nav className="flex flex-wrap gap-2">
          {navItems.map(({ path, label, icon: Icon }) => (
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
        </nav>
      </CardContent>
    </Card>
  );
};