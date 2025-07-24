import React from 'react';
import { WebhookConfig } from '@/components/WebhookConfig';
import { UserManagement } from '@/components/UserManagement';
import { Navigation } from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Config: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <Navigation />
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Configuration</h1>
          <p className="text-lg text-muted-foreground">
            Manage system settings, webhooks, and user accounts
          </p>
        </div>

        <Tabs defaultValue="webhooks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="webhooks" className="space-y-6">
            <WebhookConfig />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Config;