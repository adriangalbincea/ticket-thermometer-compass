import React from 'react';
import { Dashboard } from '@/components/Dashboard';
import { Navigation } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const Admin: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto">
          <Navigation />
          <Dashboard />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Admin;