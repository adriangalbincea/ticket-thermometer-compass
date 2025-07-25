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
  reminderSubject: string;
  reminderTemplate: string;
}

export const EmailConfig: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<EmailSettings>({
    fromEmail: '',
    notificationSubject: '',
    notificationTemplate: '',
    reminderSubject: '',
    reminderTemplate: '',
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
        notificationTemplate: settingsMap.get('template_notification_html') || '<h1>New Feedback</h1><p>A new feedback has been submitted for ticket {ticket_number} by {customer_name}...</p>',
        reminderSubject: settingsMap.get('template_reminder_subject') || 'Please provide feedback for ticket #{ticket_number}',
        reminderTemplate: settingsMap.get('template_reminder_html') || '<h1>Feedback Reminder</h1><p>We would appreciate your feedback on the recent service provided...</p>',
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
          { setting_type: 'template', setting_key: 'notification_html', setting_value: settings.notificationTemplate },
          { setting_type: 'template', setting_key: 'reminder_subject', setting_value: settings.reminderSubject },
          { setting_type: 'template', setting_key: 'reminder_html', setting_value: settings.reminderTemplate }
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
              placeholder="<h1>New Feedback</h1><p>A new feedback has been submitted for ticket {ticket_number} by {customer_name}...</p>"
              className="min-h-[100px]"
              value={settings.notificationTemplate}
              onChange={(e) => setSettings(prev => ({ ...prev, notificationTemplate: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Available variables: {"{ticket_number}"}, {"{customer_name}"}, {"{customer_email}"}, {"{technician}"}, {"{feedback_type}"}, {"{comment}"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-subject">Reminder Email Subject</Label>
            <Input
              id="reminder-subject"
              placeholder="Please provide feedback for ticket #{ticket_number}"
              value={settings.reminderSubject}
              onChange={(e) => setSettings(prev => ({ ...prev, reminderSubject: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-template">Reminder Email Template (HTML)</Label>
            <Textarea
              id="reminder-template"
              placeholder="<h1>Feedback Reminder</h1><p>We would appreciate your feedback on the recent service provided...</p>"
              className="min-h-[100px]"
              value={settings.reminderTemplate}
              onChange={(e) => setSettings(prev => ({ ...prev, reminderTemplate: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Available variables: {"{ticket_number}"}, {"{customer_name}"}, {"{customer_email}"}, {"{technician}"}, {"{link}"}
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

      {/* Notification Recipients */}
      <NotificationRecipientsConfig />
    </div>
  );
};