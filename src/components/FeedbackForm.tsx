import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Frown, Meh, Smile, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type FeedbackType = 'bad' | 'neutral' | 'happy';

interface FeedbackFormProps {
  ticketNumber?: string;
  technician?: string;
  ticketTitle?: string;
  onSubmit?: (feedback: { type: FeedbackType; comment: string; ticketNumber: string; technician: string; ticketTitle: string }) => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  ticketNumber,
  technician,
  ticketTitle,
  onSubmit
}) => {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const { toast } = useToast();

  const handleFeedbackSelect = (type: FeedbackType) => {
    setSelectedFeedback(type);
  };

  const handleSubmit = () => {
    if (!selectedFeedback) return;

    const feedbackData = {
      type: selectedFeedback,
      comment,
      ticketNumber,
      technician,
      ticketTitle
    };

    onSubmit?.(feedbackData);
    setIsSubmitted(true);
  };

  useEffect(() => {
    if (isSubmitted && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isSubmitted && countdown === 0) {
      window.location.href = 'https://wiseserve.net';
    }
  }, [isSubmitted, countdown]);

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-card">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-feedback-happy mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Thank You!</h2>
          <p className="text-muted-foreground mb-4">Your feedback has been successfully submitted.</p>
          <p className="text-muted-foreground text-sm">
            Redirecting to WiseServe in {countdown} second{countdown !== 1 ? 's' : ''}...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-card">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-foreground">
          How was your service experience?
        </CardTitle>
        <p className="text-muted-foreground mt-2">
          Please rate the service you received for this ticket
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Ticket Information */}
        <div className="bg-muted rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-foreground">Ticket:</span>
                <Badge variant="outline" className="ml-2">{ticketNumber}</Badge>
              </div>
              <div>
                <span className="font-medium text-foreground">Technician:</span>
                <span className="ml-2 text-muted-foreground">{technician}</span>
              </div>
            </div>
            <div>
              <span className="font-medium text-foreground">Issue:</span>
              <span className="ml-2 text-muted-foreground">{ticketTitle}</span>
            </div>
          </div>
        </div>

        {/* Feedback Buttons */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <Button
            variant={selectedFeedback === 'bad' ? 'default' : 'outline'}
            className={`h-32 flex-col gap-3 transition-all duration-200 hover:scale-105 ${
              selectedFeedback === 'bad' 
                ? 'bg-feedback-bad text-feedback-bad-foreground hover:bg-feedback-bad/90 shadow-lg' 
                : 'hover:bg-feedback-bad/10 hover:border-feedback-bad bg-feedback-bad/5'
            }`}
            onClick={() => handleFeedbackSelect('bad')}
          >
            <div className="text-4xl">😞</div>
            <span className="font-medium text-lg">Bad</span>
          </Button>

          <Button
            variant={selectedFeedback === 'neutral' ? 'default' : 'outline'}
            className={`h-32 flex-col gap-3 transition-all duration-200 hover:scale-105 ${
              selectedFeedback === 'neutral' 
                ? 'bg-feedback-neutral text-feedback-neutral-foreground hover:bg-feedback-neutral/90 shadow-lg' 
                : 'hover:bg-feedback-neutral/10 hover:border-feedback-neutral bg-feedback-neutral/5'
            }`}
            onClick={() => handleFeedbackSelect('neutral')}
          >
            <div className="text-4xl">😐</div>
            <span className="font-medium text-lg">Neutral</span>
          </Button>

          <Button
            variant={selectedFeedback === 'happy' ? 'default' : 'outline'}
            className={`h-32 flex-col gap-3 transition-all duration-200 hover:scale-105 ${
              selectedFeedback === 'happy' 
                ? 'bg-feedback-happy text-feedback-happy-foreground hover:bg-feedback-happy/90 shadow-lg' 
                : 'hover:bg-feedback-happy/10 hover:border-feedback-happy bg-feedback-happy/5'
            }`}
            onClick={() => handleFeedbackSelect('happy')}
          >
            <div className="text-4xl">😊</div>
            <span className="font-medium text-lg">Happy</span>
          </Button>
        </div>

        {/* Optional Comment */}
        {selectedFeedback && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Additional comments (optional)
              </label>
              <Textarea
                placeholder="Tell us more about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <Button 
              onClick={handleSubmit}
              className="w-full bg-gradient-primary hover:opacity-90"
              size="lg"
            >
              Submit Feedback
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};