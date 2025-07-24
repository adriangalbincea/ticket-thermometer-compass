import React, { useState, useEffect } from 'react';
import { FeedbackForm, FeedbackType } from '@/components/FeedbackForm';
import { Navigation } from '@/components/Navigation';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const Feedback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [feedbackLink, setFeedbackLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Extract token from URL
  const token = searchParams.get('token');

  useEffect(() => {
    const loadFeedbackLink = async () => {
      if (!token) {
        setError('Invalid feedback link - missing token');
        setLoading(false);
        return;
      }

      try {
        // Check if the link exists and is valid
        const { data, error } = await supabase
          .from('feedback_links')
          .select('*')
          .eq('token', token)
          .eq('is_used', false)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (error || !data) {
          setError('This feedback link has expired or has already been used');
        } else {
          setFeedbackLink(data);
        }
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
          <Navigation />
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
          <Navigation />
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
        <Navigation />
        <div className="py-8">
          <FeedbackForm
            ticketNumber={feedbackLink?.ticket_number}
            technician={feedbackLink?.technician}
            ticketTitle={feedbackLink?.ticket_title}
            onSubmit={handleFeedbackSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default Feedback;