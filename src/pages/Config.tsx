import React from 'react';
import { WebhookConfig } from '@/components/WebhookConfig';
import { UserManagement } from '@/components/UserManagement';
import { SettingsConfig } from '@/components/SettingsConfig';
import { EmailConfig } from '@/components/EmailConfig';
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
            Manage system settings, webhooks, users, and email configuration
          </p>
        </div>

        <Tabs defaultValue="webhooks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="webhooks" className="space-y-6">
            <WebhookConfig />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsConfig />
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <EmailConfig />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Config;