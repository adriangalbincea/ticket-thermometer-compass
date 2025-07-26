import React, { useState, useEffect } from 'react';
import { FeedbackForm, FeedbackType } from '@/components/FeedbackForm';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const Feedback: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const [feedbackLink, setFeedbackLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get feedback type from URL parameter
  const urlFeedbackType = searchParams.get('type') as FeedbackType | null;
  const isValidFeedbackType = urlFeedbackType && ['bad', 'neutral', 'happy'].includes(urlFeedbackType);

  useEffect(() => {
    const loadFeedbackLink = async () => {
      if (!token) {
        setError('Invalid feedback link - missing token');
        setLoading(false);
        return;
      }

      try {
        // First check if the link exists at all
        const { data: linkData, error: linkError } = await supabase
          .from('feedback_links')
          .select('*')
          .eq('token', token)
          .maybeSingle();

        if (linkError) {
          setError('Failed to validate feedback link');
          return;
        }

        if (!linkData) {
          setError('Invalid feedback link - link not found');
          return;
        }

        // Check if already used
        if (linkData.is_used) {
          setError('This feedback link has already been used');
          return;
        }

        // Check if expired
        if (new Date(linkData.expires_at) <= new Date()) {
          setError('This feedback link has expired');
          return;
        }

        // Link is valid
        setFeedbackLink(linkData);
      } catch (err) {
        setError('Failed to load feedback link');
      } finally {
        setLoading(false);
      }
    };

    loadFeedbackLink();
  }, [token]);

  const handleFeedbackSubmit = async (feedback: { 
    type: FeedbackType; 
    comment: string; 
    ticketNumber: string; 
    technician: string; 
    ticketTitle: string;
  }) => {
    if (!feedbackLink) return;

    try {
      // Submit feedback to database
      const { error: submitError } = await supabase
        .from('feedback_submissions')
        .insert({
          feedback_link_id: feedbackLink.id,
          feedback_type: feedback.type,
          comment: feedback.comment || null,
          customer_ip: null // Could add IP tracking if needed
        });

      if (submitError) {
        toast({
          title: "Error",
          description: "Failed to submit feedback. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Mark the link as used
      await supabase
        .from('feedback_links')
        .update({ 
          is_used: true, 
          used_at: new Date().toISOString() 
        })
        .eq('id', feedbackLink.id);

      // Send notification emails
      try {
        await supabase.functions.invoke('send-feedback-notification', {
          body: {
            feedbackLinkId: feedbackLink.id,
            feedbackType: feedback.type,
            comment: feedback.comment
          }
        });
      } catch (notificationError) {
        console.error('Failed to send notification emails:', notificationError);
        // Don't show error to user as feedback was submitted successfully
      }

      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });
      
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto">
          <div className="py-8 flex justify-center">
            <Card className="shadow-elegant">
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading feedback form...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto">
          <div className="py-8 flex justify-center">
            <Card className="shadow-elegant">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-bold text-foreground mb-4">Link Error</h2>
                <p className="text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        {/* Wiseserve Logo */}
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/00a9f4fc-8ab5-4dd4-85ff-7abd95d3761e.png" 
            alt="Wiseserve Logo" 
            className="h-20 mx-auto mb-4"
          />
        </div>
        
        <div className="py-4">
          <FeedbackForm
            ticketNumber={feedbackLink?.ticket_number}
            technician={feedbackLink?.technician}
            ticketTitle={feedbackLink?.ticket_title}
            defaultFeedbackType={isValidFeedbackType ? urlFeedbackType : undefined}
            onSubmit={handleFeedbackSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default Feedback;