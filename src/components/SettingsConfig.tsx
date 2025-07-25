import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Mail, Server, Shield, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SettingsConfig: React.FC = () => {
  const [settings, setSettings] = useState({
    company_name: '',
    support_email: '',
    session_timeout: '1',
    two_factor_auth: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      if (data) {
        const settingsMap = data.reduce((acc, item) => {
          acc[item.setting_key] = item.setting_value;
          return acc;
        }, {} as Record<string, string>);

        setSettings({
          company_name: settingsMap.company_name || '',
          support_email: settingsMap.support_email || '',
          session_timeout: settingsMap.session_timeout || '1',
          two_factor_auth: settingsMap.two_factor_auth === 'true'
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load settings: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const settingsToSave = [
        { setting_key: 'company_name', setting_value: settings.company_name },
        { setting_key: 'support_email', setting_value: settings.support_email },
        { setting_key: 'session_timeout', setting_value: settings.session_timeout },
        { setting_key: 'two_factor_auth', setting_value: settings.two_factor_auth.toString() }
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('app_settings')
          .upsert(setting, { onConflict: 'setting_key' });

        if (error) throw error;
      }

      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save settings: " + error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={settings.company_name}
                onChange={(e) => setSettings(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Your Company Ltd"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input
                id="support-email"
                type="email"
                value={settings.support_email}
                onChange={(e) => setSettings(prev => ({ ...prev, support_email: e.target.value }))}
                placeholder="support@company.com"
              />
            </div>
          </div>

          <Button onClick={handleSaveSettings} className="bg-gradient-primary" disabled={saving}>
            {saving ? "Saving..." : "Save General Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
            <Select value={settings.session_timeout} onValueChange={(value) => setSettings(prev => ({ ...prev, session_timeout: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeout" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="0.5">30 minutes</SelectItem>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="8">8 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-factor authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for admin accounts
                </p>
              </div>
              <Switch 
                checked={settings.two_factor_auth}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, two_factor_auth: checked }))}
              />
            </div>
          </div>

          <Button onClick={handleSaveSettings} className="bg-gradient-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Security Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};