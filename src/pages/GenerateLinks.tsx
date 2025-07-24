import React from 'react';
import { Navigation } from '@/components/Navigation';
import { LinkGenerator } from '@/components/LinkGenerator';

const GenerateLinks: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <Navigation />
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Generate Feedback Links</h1>
          <p className="text-lg text-muted-foreground">
            Create secure feedback links for your customers
          </p>
        </div>

        <LinkGenerator />
      </div>
    </div>
  );
};

export default GenerateLinks;