import React from 'react';
import { Navigation } from '@/components/Navigation';
import { MonitoringDashboard } from '@/components/MonitoringDashboard';

const MonitoringBoard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <Navigation />
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Monitoring Board</h1>
          <p className="text-lg text-muted-foreground">
            Technician performance analytics for the last 30 days
          </p>
        </div>

        <MonitoringDashboard />
      </div>
    </div>
  );
};

export default MonitoringBoard;