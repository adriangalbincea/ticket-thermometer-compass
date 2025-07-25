import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, TestTube, Zap } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface ApiTestRequest {
  ticket_number: string;
  technician: string;
  ticket_title: string;
  customer_email?: string;
  customer_name?: string;
  expires_hours?: number;
}

export const ApiConfig: React.FC = () => {
  const [testPayload, setTestPayload] = useState<ApiTestRequest>({
    ticket_number: 'TEST-001',
    technician: 'John Doe',
    ticket_title: 'Test ticket',
    customer_email: 'test@example.com',
    customer_name: 'Test Customer',
    expires_hours: 72
  });
  const [bearerToken, setBearerToken] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const API_ENDPOINT = 'https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link';

  const { toast } = useToast();

  const testApi = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken.trim()}`,
      };
      
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(testPayload),
      });
      
      const result = await response.json();
      setApiResponse(JSON.stringify(result, null, 2));
      
      toast({
        title: "Success",
        description: "API test completed successfully!",
      });
    } catch (error: any) {
      setApiResponse(error.message);
      toast({
        title: "Error",
        description: "API test failed: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyApiEndpoint = () => {
    navigator.clipboard.writeText(API_ENDPOINT);
    toast({
      title: "Copied!",
      description: "API endpoint copied to clipboard",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">API Endpoint</h3>
          <div className="flex items-center gap-2">
            <code className="bg-background px-2 py-1 rounded text-sm flex-1 font-mono">
              {API_ENDPOINT}
            </code>
            <Button onClick={copyApiEndpoint} size="sm" variant="outline">
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => window.open('API_DOCUMENTATION.md', '_blank')} 
              size="sm" 
              variant="outline"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This API generates secure feedback links for customer tickets. No authentication required.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Test API</h3>
            <Badge variant="outline">POST Request</Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ticket_number">Ticket Number</Label>
              <Input
                id="ticket_number"
                value={testPayload.ticket_number}
                onChange={(e) => setTestPayload({ ...testPayload, ticket_number: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="technician">Technician</Label>
              <Input
                id="technician"
                value={testPayload.technician}
                onChange={(e) => setTestPayload({ ...testPayload, technician: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="ticket_title">Ticket Title</Label>
            <Input
              id="ticket_title"
              value={testPayload.ticket_title}
              onChange={(e) => setTestPayload({ ...testPayload, ticket_title: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_email">Customer Email</Label>
              <Input
                id="customer_email"
                value={testPayload.customer_email || ''}
                onChange={(e) => setTestPayload({ ...testPayload, customer_email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                value={testPayload.customer_name || ''}
                onChange={(e) => setTestPayload({ ...testPayload, customer_name: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="expires_hours">Expires in Hours</Label>
            <Input
              id="expires_hours"
              type="number"
              value={testPayload.expires_hours || 72}
              onChange={(e) => setTestPayload({ ...testPayload, expires_hours: parseInt(e.target.value) })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="bearer_token">Bearer Token</Label>
            <Input
              id="bearer_token"
              type="password"
              placeholder="Enter Bearer token for authentication"
              value={bearerToken}
              onChange={(e) => setBearerToken(e.target.value)}
              required
            />
          </div>

          <Button onClick={testApi} disabled={loading} className="w-full">
            <TestTube className="h-4 w-4 mr-2" />
            {loading ? 'Testing...' : 'Test API'}
          </Button>
        </div>

        {apiResponse && (
          <div>
            <Label>API Response</Label>
            <Textarea
              value={apiResponse}
              readOnly
              className="font-mono text-sm h-32"
            />
          </div>
        )}

        <div className="bg-muted rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">Integration Examples</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>cURL:</strong> See API_DOCUMENTATION.md for complete examples</p>
            <p>• <strong>JavaScript:</strong> Use fetch() with POST method</p>
            <p>• <strong>Python:</strong> Use requests.post() with JSON payload</p>
            <p>• <strong>PHP:</strong> Use cURL with json_encode() for payload</p>
          </div>
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <a href="/api-test-guide">
                <ExternalLink className="h-4 w-4 mr-2" />
                API Test Guide
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};