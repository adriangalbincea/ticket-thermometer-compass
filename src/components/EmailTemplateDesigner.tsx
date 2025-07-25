import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Code, Palette, Type, Layout, RotateCcw } from 'lucide-react';

interface EmailTemplateDesignerProps {
  template: string;
  onChange: (template: string) => void;
}

interface DesignSettings {
  headerBg: string;
  headerText: string;
  accentColor: string;
  bodyBg: string;
  contentBg: string;
  textColor: string;
  fontSize: string;
  fontFamily: string;
  borderRadius: string;
  showEmojis: boolean;
}

const getDefaultDesignSettings = (): DesignSettings => ({
  headerBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  headerText: 'New Feedback Received',
  accentColor: '#667eea',
  bodyBg: '#f8f9fa',
  contentBg: '#ffffff',
  textColor: '#333333',
  fontSize: '16px',
  fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  borderRadius: '12px',
  showEmojis: true
});

const generateTemplate = (settings: DesignSettings): string => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Feedback Received</title>
  <style>
    body { 
      font-family: '${settings.fontFamily}'; 
      line-height: 1.6; 
      color: ${settings.textColor}; 
      background-color: ${settings.bodyBg}; 
      margin: 0; 
      padding: 20px; 
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: ${settings.contentBg}; 
      border-radius: ${settings.borderRadius}; 
      overflow: hidden; 
      box-shadow: 0 8px 32px rgba(0,0,0,0.12); 
    }
    .header { 
      background: ${settings.headerBg}; 
      color: white; 
      padding: 40px 30px; 
      text-align: center; 
    }
    .header h1 { 
      margin: 0; 
      font-size: 32px; 
      font-weight: 700; 
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header p { 
      margin: 15px 0 0 0; 
      opacity: 0.95; 
      font-size: 18px; 
    }
    .content { padding: 40px 30px; }
    .feedback-badge { 
      display: inline-block; 
      padding: 15px 25px; 
      border-radius: 30px; 
      font-weight: 700; 
      text-transform: uppercase; 
      font-size: 14px; 
      letter-spacing: 1.5px; 
      margin-bottom: 30px; 
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .feedback-happy { 
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); 
      color: #155724; 
      border: 2px solid #b8dacc;
    }
    .feedback-happy:before { content: "${settings.showEmojis ? '😊 ' : ''}"; font-size: 20px; }
    .feedback-neutral { 
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); 
      color: #856404; 
      border: 2px solid #f4d03f;
    }
    .feedback-neutral:before { content: "${settings.showEmojis ? '😐 ' : ''}"; font-size: 20px; }
    .feedback-sad { 
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); 
      color: #721c24; 
      border: 2px solid #f1b0b7;
    }
    .feedback-sad:before { content: "${settings.showEmojis ? '😞 ' : ''}"; font-size: 20px; }
    .details-card { 
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
      border-radius: 15px; 
      padding: 30px; 
      margin: 30px 0; 
      border: 1px solid #dee2e6;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    .details-grid { 
      display: grid; 
      grid-template-columns: 1fr 2fr; 
      gap: 20px; 
    }
    .detail-label { 
      font-weight: 700; 
      color: ${settings.accentColor}; 
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detail-value { 
      color: ${settings.textColor}; 
      font-weight: 600; 
      font-size: ${settings.fontSize};
    }
    .comment-section { 
      background: linear-gradient(135deg, ${settings.contentBg} 0%, #f8f9fa 100%); 
      border-left: 5px solid ${settings.accentColor}; 
      padding: 30px; 
      margin: 30px 0; 
      border-radius: 0 15px 15px 0; 
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    .comment-section h3 { 
      margin-top: 0; 
      color: ${settings.accentColor}; 
      font-size: 22px; 
      font-weight: 700;
    }
    .comment-text {
      font-size: 18px;
      line-height: 1.7;
      margin-bottom: 0;
      padding: 20px;
      background: white;
      border-radius: 10px;
      border: 1px solid #e9ecef;
      font-style: italic;
    }
    .footer { 
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
      padding: 30px; 
      text-align: center; 
      border-top: 1px solid #dee2e6; 
    }
    .logo { 
      font-weight: 800; 
      color: ${settings.accentColor}; 
      font-size: 24px; 
      margin-bottom: 10px; 
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .tagline { 
      color: #666; 
      font-size: 16px; 
      margin: 0; 
      font-style: italic;
    }
    .divider {
      height: 3px;
      background: ${settings.accentColor};
      margin: 30px 0;
      border-radius: 2px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${settings.headerText}</h1>
      <p>A customer has submitted feedback for your attention</p>
    </div>
    <div class="content">
      <div class="feedback-badge feedback-{feedback_type}">
        {feedback_type} Feedback
      </div>
      
      <div class="details-card">
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
      </div>

      <div class="divider"></div>
      
      <div class="comment-section">
        <h3>${settings.showEmojis ? '💬 ' : ''}Customer Comment:</h3>
        <div class="comment-text">{comment}</div>
      </div>
    </div>
    <div class="footer">
      <div class="logo">Wiseserve</div>
      <p class="tagline">Professional IT Services & Support</p>
    </div>
  </div>
</body>
</html>`;
};

export const EmailTemplateDesigner: React.FC<EmailTemplateDesignerProps> = ({
  template,
  onChange
}) => {
  const [mode, setMode] = useState<'design' | 'html'>('design');
  const [settings, setSettings] = useState<DesignSettings>(getDefaultDesignSettings());
  const [htmlContent, setHtmlContent] = useState(template);

  useEffect(() => {
    if (mode === 'design') {
      const newTemplate = generateTemplate(settings);
      setHtmlContent(newTemplate);
      onChange(newTemplate);
    }
  }, [settings, mode, onChange]);

  useEffect(() => {
    setHtmlContent(template);
  }, [template]);

  const handleSettingChange = (key: keyof DesignSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleHtmlChange = (value: string) => {
    setHtmlContent(value);
    onChange(value);
  };

  const resetToDefault = () => {
    const defaultSettings = getDefaultDesignSettings();
    setSettings(defaultSettings);
    const defaultTemplate = generateTemplate(defaultSettings);
    setHtmlContent(defaultTemplate);
    onChange(defaultTemplate);
  };

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(value) => setMode(value as 'design' | 'html')}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-48 grid-cols-2">
            <TabsTrigger value="design" className="flex items-center gap-1 text-sm">
              <Palette className="h-3 w-3" />
              Design
            </TabsTrigger>
            <TabsTrigger value="html" className="flex items-center gap-1 text-sm">
              <Code className="h-3 w-3" />
              HTML
            </TabsTrigger>
          </TabsList>
          
          {mode === 'design' && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              className="flex items-center gap-1 text-sm"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>

        <TabsContent value="design" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Compact Design Controls */}
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Layout className="h-3 w-3" />
                  Layout
                </h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="header-text" className="text-xs">Header Text</Label>
                    <Input
                      id="header-text"
                      className="h-8 text-sm"
                      value={settings.headerText}
                      onChange={(e) => handleSettingChange('headerText', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="border-radius" className="text-xs">Radius</Label>
                    <Select value={settings.borderRadius} onValueChange={(value) => handleSettingChange('borderRadius', value)}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0px">None</SelectItem>
                        <SelectItem value="8px">Small</SelectItem>
                        <SelectItem value="12px">Medium</SelectItem>
                        <SelectItem value="20px">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-emojis"
                      checked={settings.showEmojis}
                      onCheckedChange={(checked) => handleSettingChange('showEmojis', checked)}
                    />
                    <Label htmlFor="show-emojis" className="text-xs">Emojis</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Palette className="h-3 w-3" />
                  Colors
                </h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="accent-color" className="text-xs">Accent</Label>
                    <Input
                      id="accent-color"
                      type="color"
                      className="h-8"
                      value={settings.accentColor}
                      onChange={(e) => handleSettingChange('accentColor', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="text-color" className="text-xs">Text</Label>
                    <Input
                      id="text-color"
                      type="color"
                      className="h-8"
                      value={settings.textColor}
                      onChange={(e) => handleSettingChange('textColor', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Type className="h-3 w-3" />
                  Typography
                </h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="font-family" className="text-xs">Font</Label>
                    <Select value={settings.fontFamily} onValueChange={(value) => handleSettingChange('fontFamily', value)}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Segoe UI, Tahoma, Geneva, Verdana, sans-serif">Segoe UI</SelectItem>
                        <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                        <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                        <SelectItem value="Georgia, serif">Georgia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="font-size" className="text-xs">Size</Label>
                    <Select value={settings.fontSize} onValueChange={(value) => handleSettingChange('fontSize', value)}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="14px">Small</SelectItem>
                        <SelectItem value="16px">Medium</SelectItem>
                        <SelectItem value="18px">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-3">
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Live Preview
                </h4>
                <div className="border rounded-lg bg-gray-50 h-80 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="html" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="html-content" className="text-sm font-medium">HTML Template</Label>
              <Textarea
                id="html-content"
                placeholder="Enter your HTML template here..."
                className="h-80 font-mono text-xs"
                value={htmlContent}
                onChange={(e) => handleHtmlChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Preview
              </h4>
              <div className="border rounded-lg bg-gray-50 h-80 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};