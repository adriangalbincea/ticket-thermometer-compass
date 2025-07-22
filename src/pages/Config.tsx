import React from 'react';
import { WebhookConfig } from '@/components/WebhookConfig';
import { Navigation } from '@/components/Navigation';

const Config: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <Navigation />
        <WebhookConfig />
      </div>
    </div>
  );
};

export default Config;