import React from 'react';
import { RoleBasedAccess } from './RoleBasedAccess';
import { Card, CardContent } from '@/components/ui/card';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  return (
    <RoleBasedAccess 
      allowedRoles={allowedRoles}
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <div className="text-2xl font-semibold text-muted-foreground">
                Access Denied
              </div>
              <p className="text-muted-foreground">
                You don't have permission to access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      }
    >
      {children}
    </RoleBasedAccess>
  );
};