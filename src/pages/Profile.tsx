import React from 'react';
import { UserProfile } from '@/components/UserProfile';
import { Navigation } from '@/components/Navigation';

const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <Navigation />
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">User Profile</h1>
          <p className="text-lg text-muted-foreground">
            Manage your account settings and security preferences
          </p>
        </div>
        
        <UserProfile />
      </div>
    </div>
  );
};

export default Profile;