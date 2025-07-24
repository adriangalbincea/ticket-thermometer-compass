import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Webhook, Globe, Key, Copy, Send, CheckCircle, XCircle, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WebhookConfig {
  id?: string;
  webhook_url: string;
  secret_key: string;
  enabled: boolean;
  events: string[];
}

export const WebhookConfig: React.FC = () => {
  const [config, setConfig] = useState<WebhookConfig>({
    webhook_url: '',
    secret_key: '',
    enabled: false,
    events: ['feedback_submitted']
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadWebhookConfig();
  }, []);

  const loadWebhookConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_config')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig({
          id: data.id,
          webhook_url: data.webhook_url || '',
          secret_key: data.secret_key || '',
          enabled: data.enabled || false,
          events: data.events || ['feedback_submitted']
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load webhook configuration: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const configData = {
        webhook_url: config.webhook_url,
        secret_key: config.secret_key,
        enabled: config.enabled,
        events: config.events
      };

      let result;
      if (config.id) {
        // Update existing config
        result = await supabase
          .from('webhook_config')
          .update(configData)
          .eq('id', config.id);
      } else {
        // Insert new config
        result = await supabase
          .from('webhook_config')
          .insert(configData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      if (!config.id && result.data) {
        setConfig(prev => ({ ...prev, id: result.data.id }));
      }

      toast({
        title: "Configuration Saved",
        description: "Webhook configuration has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save webhook configuration: " + error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const generateSecretKey = () => {
    const newKey = crypto.randomUUID().replace(/-/g, '');
    setConfig(prev => ({ ...prev, secret_key: newKey }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    });
  };

  const testWebhook = async () => {
    if (!config.webhook_url) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Test the configured webhook URL by sending a POST request
      const testPayload = {
        ticket_number: 'TEST-001',
        technician: 'Test User',
        ticket_title: 'Webhook test',
        customer_email: 'test@example.com',
        customer_name: 'Test Customer',
        expires_hours: 72
      };

      const response = await fetch(config.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.secret_key && { 'X-Secret-Key': config.secret_key })
        },
        body: JSON.stringify(testPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: "Webhook Test Successful",
        description: result.data?.feedback_url ? 
          `Feedback link created: ${result.data.feedback_url}` : 
          "Test payload sent successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: "Failed to send test webhook: " + error.message,
        variant: "destructive",
      });
    }
  };

  const samplePayload = `{
  "event": "feedback_submitted",
  "data": {
    "ticket_number": "TK-2024-001",
    "technician": "John Smith",
    "feedback_type": "happy",
    "comment": "Great service!",
    "submitted_at": "2024-01-15T10:30:00Z"
  }
}`;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Webhook Configuration</h1>
          <p className="text-muted-foreground mt-1">Configure webhooks to receive real-time notifications</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={config.enabled ? "default" : "secondary"} className="flex items-center gap-1">
            {config.enabled ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {config.enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      </div>

      {/* Main Configuration */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Webhook Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL*</Label>
              <Input
                id="webhook-url"
                type="url"
                value={config.webhook_url}
                onChange={(e) => setConfig(prev => ({ ...prev, webhook_url: e.target.value }))}
                placeholder="https://your-app.com/webhooks/feedback"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secret-key">Secret Key</Label>
              <div className="flex gap-2">
                <Input
                  id="secret-key"
                  value={config.secret_key}
                  onChange={(e) => setConfig(prev => ({ ...prev, secret_key: e.target.value }))}
                  placeholder="Enter or generate a secret key"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateSecretKey}
                >
                  <Key className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => copyToClipboard(config.secret_key)}
                  disabled={!config.secret_key}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Webhooks</Label>
                <p className="text-sm text-muted-foreground">
                  Turn on to start receiving webhook notifications
                </p>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
              />
            </div>

            <Button onClick={handleSaveConfig} className="bg-gradient-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Testing & Documentation */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Testing & Documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Sample Payload</Label>
            <Textarea
              value={samplePayload}
              readOnly
              className="font-mono text-sm"
              rows={12}
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => copyToClipboard(samplePayload)} variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Copy Sample Payload
            </Button>
            
            <Button onClick={testWebhook} variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Test Webhook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};