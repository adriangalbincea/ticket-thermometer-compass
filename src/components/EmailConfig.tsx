import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Mail, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const EmailConfig: React.FC = () => {
  const { toast } = useToast();

  const handleSaveEmailSettings = () => {
    toast({
      title: "Email Settings Saved",
      description: "Email configuration has been updated successfully.",
    });
  };

  const handleTestEmail = () => {
    toast({
      title: "Test Email Sent",
      description: "A test email has been sent to verify the configuration.",
    });
  };

  return (
    <div className="space-y-6">
      {/* SMTP Configuration */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            SMTP Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input
                id="smtp-host"
                placeholder="smtp.gmail.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input
                id="smtp-port"
                type="number"
                placeholder="587"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-username">Username</Label>
              <Input
                id="smtp-username"
                placeholder="your-email@gmail.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtp-password">Password</Label>
              <Input
                id="smtp-password"
                type="password"
                placeholder="Your app password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Use TLS/SSL</Label>
              <p className="text-sm text-muted-foreground">
                Enable secure connection for email sending
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveEmailSettings} className="bg-gradient-primary">
              Save SMTP Settings
            </Button>
            <Button variant="outline" onClick={handleTestEmail}>
              <Send className="h-4 w-4 mr-2" />
              Test Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notification-subject">Notification Email Subject</Label>
            <Input
              id="notification-subject"
              placeholder="New Feedback Received - Ticket #{ticket_number}"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-template">Notification Email Template</Label>
            <Textarea
              id="notification-template"
              placeholder="A new feedback has been submitted for ticket {ticket_number} by {customer_name}..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-subject">Reminder Email Subject</Label>
            <Input
              id="reminder-subject"
              placeholder="Please provide feedback for ticket #{ticket_number}"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-template">Reminder Email Template</Label>
            <Textarea
              id="reminder-template"
              placeholder="We would appreciate your feedback on the recent service provided..."
              className="min-h-[100px]"
            />
          </div>

          <Button onClick={handleSaveEmailSettings} className="bg-gradient-primary">
            Save Email Templates
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};