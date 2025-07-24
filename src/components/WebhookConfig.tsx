import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Webhook, Globe, Mail, Database, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const WebhookConfig: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('https://feedback.yourcompany.com/webhook/receive');
  const [isEnabled, setIsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sampleCopied, setSampleCopied] = useState(false);
  const [settings, setSettings] = useState({
    webhookUrl,
    isEnabled,
    emailNotifications
  });
  const { toast } = useToast();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "The webhook URL has been copied.",
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleSampleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSampleCopied(true);
      setTimeout(() => setSampleCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Sample payload has been copied.",
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const testWebhook = async () => {
    try {
      const response = await fetch('/functions/v1/generate-feedback-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket_number: 'TEST-001',
          technician: 'Test Technician',
          ticket_title: 'Test webhook functionality',
          customer_email: 'test@example.com'
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Webhook Test Successful",
          description: `Test link created: ${data.feedback_url}`,
        });
      } else {
        throw new Error('Webhook test failed');
      }
    } catch (error) {
      toast({
        title: "Webhook Test Failed",
        description: "Could not connect to webhook endpoint.",
        variant: "destructive",
      });
    }
  };

  const saveSettings = () => {
    setSettings({
      webhookUrl,
      isEnabled,
      emailNotifications
    });
    toast({
      title: "Settings Saved",
      description: "Your webhook configuration has been updated.",
    });
  };

  const samplePayload = {
    "ticket_number": "TK-2024-001",
    "technician": "John Smith",
    "ticket_title": "Network connectivity issue resolved",
    "customer_email": "customer@example.com",
    "feedback_type": "happy",
    "comment": "Great service, issue resolved quickly!",
    "timestamp": "2024-01-15T14:30:00Z",
    "satisfaction_score": 5
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Webhook Configuration</h1>
        <p className="text-muted-foreground mt-1">Configure webhook endpoints and integration settings</p>
      </div>

      <Tabs defaultValue="webhook" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="webhook" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhook
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="webhook" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-server.com/webhook"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleCopy(webhookUrl)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="webhook-enabled"
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                />
                <Label htmlFor="webhook-enabled">Enable webhook</Label>
                <Badge variant={isEnabled ? "default" : "secondary"}>
                  {isEnabled ? "Active" : "Inactive"}
                </Badge>
              </div>

              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Your webhook will receive POST requests with feedback data. Make sure your endpoint can handle JSON payloads.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button onClick={testWebhook} variant="outline">
                  Test Webhook
                </Button>
                <Button onClick={saveSettings} className="bg-gradient-primary">
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Sample Webhook Payload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm text-foreground overflow-x-auto">
                  {JSON.stringify(samplePayload, null, 2)}
                </pre>
              </div>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => handleSampleCopy(JSON.stringify(samplePayload, null, 2))}
              >
                {sampleCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                Copy Sample Payload
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
                <Label htmlFor="email-notifications">Send email notifications</Label>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input id="smtp-host" placeholder="smtp.gmail.com" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input id="smtp-port" placeholder="587" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-encryption">Encryption</Label>
                    <Input id="smtp-encryption" placeholder="TLS" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-email">From Email</Label>
                  <Input id="from-email" placeholder="noreply@yourcompany.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notification-recipients">Notification Recipients</Label>
                  <Textarea 
                    id="notification-recipients" 
                    placeholder="admin@yourcompany.com, manager@yourcompany.com"
                    rows={3}
                  />
                </div>
              </div>

              <Button className="bg-gradient-primary">Save Email Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="settings" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="app-name">Application Name</Label>
                  <Input id="app-name" defaultValue="Customer Thermometer" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" placeholder="Your Company" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback-url">Public Feedback URL</Label>
                  <Input id="feedback-url" defaultValue="https://feedback.yourcompany.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retention-days">Data Retention (days)</Label>
                  <Input id="retention-days" type="number" defaultValue="365" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Security Settings</h3>
                
                <div className="flex items-center space-x-2">
                  <Switch id="require-https" defaultChecked />
                  <Label htmlFor="require-https">Require HTTPS</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="api-auth" defaultChecked />
                  <Label htmlFor="api-auth">Enable API Authentication</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input id="api-key" value="ct_live_sk_12345...abcdef" readOnly />
                    <Button variant="outline" size="sm">Regenerate</Button>
                  </div>
                </div>
              </div>

              <Button className="bg-gradient-primary">Save General Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};