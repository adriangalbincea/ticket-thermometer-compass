import React from 'react';
import { FeedbackForm, FeedbackType } from '@/components/FeedbackForm';
import { Navigation } from '@/components/Navigation';
import { useSearchParams } from 'react-router-dom';

const Feedback: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Extract parameters from URL (these would come from your webhook)
  const ticketNumber = searchParams.get('ticket') || undefined;
  const technician = searchParams.get('tech') || undefined;
  const ticketTitle = searchParams.get('title') || undefined;

  const handleFeedbackSubmit = (feedback: { 
    type: FeedbackType; 
    comment: string; 
    ticketNumber: string; 
    technician: string; 
    ticketTitle: string;
  }) => {
    console.log('Feedback submitted:', feedback);
    
    // Here you would send the feedback to your backend
    // Example webhook call back to your system:
    // fetch('/api/feedback', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(feedback)
    // });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <Navigation />
        <div className="py-8">
          <FeedbackForm
          ticketNumber={ticketNumber}
          technician={technician}
          ticketTitle={ticketTitle}
          onSubmit={handleFeedbackSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default Feedback;