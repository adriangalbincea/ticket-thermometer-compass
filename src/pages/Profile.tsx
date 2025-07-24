import React from 'react';
import { UserProfile } from '@/components/UserProfile';
import { Navigation } from '@/components/Navigation';

const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Navigation />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">User Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and security preferences</p>
        </div>
        
        <UserProfile />
      </div>
    </div>
  );
};

export default Profile;