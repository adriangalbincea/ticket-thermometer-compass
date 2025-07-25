import React from 'react';
import { Navigation } from '@/components/Navigation';
import { LiveDashboard } from '@/components/LiveDashboard';

const Admin: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <Navigation />
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Monitor feedback responses and view analytics
          </p>
        </div>

        <LiveDashboard />
      </div>
    </div>
  );
};

export default Admin;