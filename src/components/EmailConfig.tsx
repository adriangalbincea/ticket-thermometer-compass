import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Mail, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { NotificationRecipientsConfig } from './NotificationRecipientsConfig';

interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  useTLS: boolean;
  notificationSubject: string;
  notificationTemplate: string;
  reminderSubject: string;
  reminderTemplate: string;
}

export const EmailConfig: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<EmailSettings>({
    smtpHost: '',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    useTLS: true,
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
        smtpHost: settingsMap.get('smtp_host') || '',
        smtpPort: settingsMap.get('smtp_port') || '587',
        smtpUsername: settingsMap.get('smtp_username') || '',
        smtpPassword: settingsMap.get('smtp_password') ? atob(settingsMap.get('smtp_password') || '') : '', // Base64 decode password
        useTLS: settingsMap.get('smtp_use_tls') === 'true',
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

  const handleSaveEmailSettings = async (type: 'smtp' | 'templates') => {
    setSaving(true);
    try {
      const settingsToSave = [];

      if (type === 'smtp') {
        settingsToSave.push(
          { setting_type: 'smtp', setting_key: 'host', setting_value: settings.smtpHost },
          { setting_type: 'smtp', setting_key: 'port', setting_value: settings.smtpPort },
          { setting_type: 'smtp', setting_key: 'username', setting_value: settings.smtpUsername },
          { setting_type: 'smtp', setting_key: 'password', setting_value: btoa(settings.smtpPassword) }, // Base64 encode password
          { setting_type: 'smtp', setting_key: 'use_tls', setting_value: settings.useTLS.toString() }
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
        description: `${type === 'smtp' ? 'SMTP' : 'Email template'} settings have been updated successfully.`,
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
          subject: 'Test Email from WiseServe',
          htmlContent: '<h1>Test Email</h1><p>This is a test email to verify your SMTP configuration.</p><p>If you received this email, your email settings are working correctly!</p>',
          fromEmail: settings.smtpUsername ? `WiseServe <${settings.smtpUsername}>` : undefined,
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
        description: "Failed to send test email. Please check your SMTP settings.",
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
                value={settings.smtpHost}
                onChange={(e) => setSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input
                id="smtp-port"
                type="number"
                placeholder="587"
                value={settings.smtpPort}
                onChange={(e) => setSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-username">Username</Label>
              <Input
                id="smtp-username"
                placeholder="your-email@gmail.com"
                value={settings.smtpUsername}
                onChange={(e) => setSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtp-password">Password</Label>
              <Input
                id="smtp-password"
                type="password"
                placeholder="Your app password"
                value={settings.smtpPassword}
                onChange={(e) => setSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
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
            <Switch 
              checked={settings.useTLS} 
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, useTLS: checked }))}
            />
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
                onClick={() => handleSaveEmailSettings('smtp')} 
                className="bg-gradient-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save SMTP Settings'}
              </Button>
              <Button variant="outline" onClick={handleTestEmail} disabled={saving}>
                <Send className="h-4 w-4 mr-2" />
                {saving ? 'Sending...' : 'Test Email'}
              </Button>
            </div>
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