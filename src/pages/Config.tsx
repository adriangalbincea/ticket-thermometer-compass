import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ApiConfig } from '@/components/ApiConfig';
import { UserManagement } from '@/components/UserManagement';
import { SettingsConfig } from '@/components/SettingsConfig';
import { EmailConfig } from '@/components/EmailConfig';
import { Navigation } from '@/components/Navigation';
import { RoleBasedAccess } from '@/components/RoleBasedAccess';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Config: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'api');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['api', 'users', 'settings', 'email'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <Navigation />
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Configuration</h1>
          <p className="text-lg text-muted-foreground">
            Manage system settings, API configuration, users, and email setup
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-6">
            <ApiConfig />
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