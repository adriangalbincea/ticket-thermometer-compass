import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { NotificationRecipientsConfig } from './NotificationRecipientsConfig';

interface EmailSettings {
  fromEmail: string;
  notificationSubject: string;
  notificationTemplate: string;
}

const getDefaultNotificationTemplate = () => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Feedback Received</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 30px; }
    .feedback-badge { display: inline-block; padding: 12px 20px; border-radius: 25px; font-weight: 600; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; margin-bottom: 25px; }
    .feedback-happy { background: #d4edda; color: #155724; }
    .feedback-happy:before { content: "😊 "; font-size: 18px; }
    .feedback-neutral { background: #fff3cd; color: #856404; }
    .feedback-neutral:before { content: "😐 "; font-size: 18px; }
    .feedback-sad { background: #f8d7da; color: #721c24; }
    .feedback-sad:before { content: "😞 "; font-size: 18px; }
    .details-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 15px; margin: 25px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
    .detail-label { font-weight: 600; color: #666; }
    .detail-value { color: #333; font-weight: 500; }
    .comment-section { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-left: 4px solid #667eea; padding: 25px; margin: 25px 0; border-radius: 0 8px 8px 0; }
    .comment-section h3 { margin-top: 0; color: #667eea; font-size: 18px; }
    .footer { background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef; }
    .logo { font-weight: 700; color: #667eea; font-size: 18px; margin-bottom: 8px; }
    .tagline { color: #666; font-size: 14px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Feedback Received</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">A customer has submitted feedback for your attention</p>
    </div>
    <div class="content">
      <div class="feedback-badge feedback-{feedback_type}">
        {feedback_type} Feedback
      </div>
      
      <div class="details-grid">
        <div class="detail-label">Ticket Number:</div>
        <div class="detail-value"><strong>#{ticket_number}</strong></div>
        
        <div class="detail-label">Ticket Title:</div>
        <div class="detail-value">{ticket_title}</div>
        
        <div class="detail-label">Technician:</div>
        <div class="detail-value">{technician}</div>
        
        <div class="detail-label">Customer Name:</div>
        <div class="detail-value">{customer_name}</div>
        
        <div class="detail-label">Customer Email:</div>
        <div class="detail-value">{customer_email}</div>
      </div>
      
      <div class="comment-section">
        <h3>Customer Comment:</h3>
        <p style="margin-bottom: 0; font-size: 16px; line-height: 1.6;">{comment}</p>
      </div>
    </div>
    <div class="footer">
      <div class="logo">Wiseserve</div>
      <p class="tagline">Professional IT Services & Support</p>
    </div>
  </div>
</body>
</html>`;

export const EmailConfig: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<EmailSettings>({
    fromEmail: 'feedback@wiseserve.net',
    notificationSubject: 'New Feedback Received - Ticket #{ticket_number}',
    notificationTemplate: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    loadEmailSettings();
  }, []);

  const loadEmailSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('setting_type, setting_key, setting_value');

      if (error) {
        console.error('Error loading email settings:', error);
        toast({
          title: "Error",
          description: "Failed to load email settings",
          variant: "destructive",
        });
        return;
      }

      const settingsMap = new Map<string, string>();
      data?.forEach(setting => {
        const key = `${setting.setting_type}_${setting.setting_key}`;
        settingsMap.set(key, setting.setting_value || '');
      });

      setSettings({
        fromEmail: settingsMap.get('api_from_email') || 'feedback@wiseserve.net',
        notificationSubject: settingsMap.get('template_notification_subject') || 'New Feedback Received - Ticket #{ticket_number}',
        notificationTemplate: settingsMap.get('template_notification_html') || getDefaultNotificationTemplate()
      });
    } catch (error) {
      console.error('Error loading email settings:', error);
      toast({
        title: "Error",
        description: "Failed to load email settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmailSettings = async (type: 'api' | 'templates') => {
    setSaving(true);
    try {
      const settingsToSave = [];

      if (type === 'api') {
        settingsToSave.push(
          { setting_type: 'api', setting_key: 'from_email', setting_value: settings.fromEmail }
        );
      } else {
        settingsToSave.push(
          { setting_type: 'template', setting_key: 'notification_subject', setting_value: settings.notificationSubject },
          { setting_type: 'template', setting_key: 'notification_html', setting_value: settings.notificationTemplate }
        );
      }

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('email_settings')
          .upsert(setting, { 
            onConflict: 'setting_type,setting_key',
            ignoreDuplicates: false 
          });

        if (error) {
          throw error;
        }
      }

      toast({
        title: "Settings Saved",
        description: `${type === 'api' ? 'Email' : 'Email template'} settings have been updated successfully.`,
      });
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast({
        title: "Error",
        description: "Failed to save email settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address for testing",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          to: testEmail,
          subject: 'Test Email from Wiseserve',
          htmlContent: '<h1>Test Email</h1><p>This is a test email to verify your Mailchimp configuration.</p><p>If you received this email, your email settings are working correctly!</p>',
          fromEmail: settings.fromEmail,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Test Email Sent",
        description: `A test email has been sent to ${testEmail}`,
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: "Failed to send test email. Please check your Mailchimp API configuration.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email API Configuration */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from-email">From Email Address</Label>
            <Input
              id="from-email"
              type="email"
              placeholder="feedback@wiseserve.net"
              value={settings.fromEmail}
              onChange={(e) => setSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
            />
            <p className="text-sm text-muted-foreground">
              The email address that will appear as the sender
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Test Email Address</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => handleSaveEmailSettings('api')} 
                className="bg-gradient-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Email Settings'}
              </Button>
              <Button variant="outline" onClick={handleTestEmail} disabled={saving}>
                <Send className="h-4 w-4 mr-2" />
                {saving ? 'Sending...' : 'Test Email'}
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This system uses Mailchimp API for sending emails. 
              Make sure your MAILCHIMP_API_KEY is configured in the project secrets.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Recipients */}
      <NotificationRecipientsConfig />

      {/* Email Templates */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notification-subject">Notification Email Subject</Label>
            <Input
              id="notification-subject"
              placeholder="New Feedback Received - Ticket #{ticket_number}"
              value={settings.notificationSubject}
              onChange={(e) => setSettings(prev => ({ ...prev, notificationSubject: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-template">Notification Email Template (HTML)</Label>
            <Textarea
              id="notification-template"
              placeholder="Enter your HTML template here..."
              className="min-h-[200px] font-mono text-sm"
              value={settings.notificationTemplate}
              onChange={(e) => setSettings(prev => ({ ...prev, notificationTemplate: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Available variables: {"{ticket_number}"}, {"{ticket_title}"}, {"{customer_name}"}, {"{customer_email}"}, {"{technician}"}, {"{feedback_type}"}, {"{comment}"}
            </p>
            <p className="text-xs text-muted-foreground">
              Feedback types include smiley faces: 😊 (happy), 😐 (neutral), 😞 (sad)
            </p>
          </div>

          <Button 
            onClick={() => handleSaveEmailSettings('templates')} 
            className="bg-gradient-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Email Templates'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};