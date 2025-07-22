import React from 'react';
import { Dashboard } from '@/components/Dashboard';
import { Navigation } from '@/components/Navigation';

const Admin: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <Navigation />
        <Dashboard />
      </div>
    </div>
  );
};

export default Admin;