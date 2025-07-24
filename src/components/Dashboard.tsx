import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LiveDashboard } from '@/components/LiveDashboard';
import { LinkGenerator } from '@/components/LinkGenerator';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Live Dashboard</TabsTrigger>
          <TabsTrigger value="links">Generate Links</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <LiveDashboard />
        </TabsContent>
        
        <TabsContent value="links" className="mt-6">
          <LinkGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};