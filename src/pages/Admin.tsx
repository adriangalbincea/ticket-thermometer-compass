import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dashboard } from '@/components/Dashboard';
import { LinkGenerator } from '@/components/LinkGenerator';
import { LiveDashboard } from '@/components/LiveDashboard';
import { Home } from '@/components/Home';

const Admin: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <Navigation />
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage feedback links, monitor responses, and view analytics
          </p>
        </div>

        <Tabs defaultValue="home" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg mx-auto">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="dashboard">Overview</TabsTrigger>
            <TabsTrigger value="generate">Generate Links</TabsTrigger>
            <TabsTrigger value="live">Live Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <Home />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <LinkGenerator />
          </TabsContent>

          <TabsContent value="live" className="space-y-6">
            <LiveDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;