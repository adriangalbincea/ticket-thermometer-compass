import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Terminal, Code, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/Navigation';

const ApiTestGuide: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [testLoading, setTestLoading] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Command copied to clipboard",
    });
  };

  const testApiEndpoint = async () => {
    setTestLoading(true);
    try {
      const response = await fetch('https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_TOKEN_HERE',
        },
        body: JSON.stringify({
          ticket_number: 'TEST-' + Date.now(),
          technician: 'Test User',
          ticket_title: 'API Test from Guide',
          customer_email: 'test@example.com',
          customer_name: 'Test Customer',
          expires_hours: 72
        })
      });

      const result = await response.json();
      setTestResult(JSON.stringify(result, null, 2));
      
      if (response.ok) {
        toast({
          title: "Test Successful!",
          description: "API is working correctly",
        });
      } else {
        toast({
          title: "Test Failed",
          description: "API returned an error",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult(JSON.stringify({ error: 'Network error: ' + error }, null, 2));
      toast({
        title: "Test Failed",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setTestLoading(false);
    }
  };

  const curlExample = `curl -X POST https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <your-token>" \\
  -d '{
    "ticket_number": "TK-12345",
    "technician": "John Doe",
    "ticket_title": "Computer won't start",
    "customer_email": "customer@example.com",
    "customer_name": "Jane Smith",
    "expires_hours": 48
  }'`;

  const jsExample = `const generateFeedbackLink = async (ticketData, apiToken) => {
  const response = await fetch('https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${apiToken}\`,
    },
    body: JSON.stringify({
      ticket_number: ticketData.ticketNumber,
      technician: ticketData.technician,
      ticket_title: ticketData.title,
      customer_email: ticketData.customerEmail,
      customer_name: ticketData.customerName,
      expires_hours: ticketData.expiresHours
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Feedback link:', result.data.feedback_url);
    return result.data.feedback_url;
  } else {
    console.error('Error:', result.error);
    throw new Error(result.error);
  }
};`;

  const pythonExample = `import requests
import json

def generate_feedback_link(ticket_data, api_token):
    url = "https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link"
    
    payload = {
        "ticket_number": ticket_data["ticket_number"],
        "technician": ticket_data["technician"], 
        "ticket_title": ticket_data["ticket_title"],
        "customer_email": ticket_data["customer_email"],
        "customer_name": ticket_data["customer_name"],
        "expires_hours": ticket_data["expires_hours"]
    }
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_token}'
    }
    
    response = requests.post(url, json=payload, headers=headers)
    result = response.json()
    
    if result.get("success"):
        return result["data"]["feedback_url"]
    else:
        raise Exception(f"API Error: {result.get('error')}")`;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <Navigation />
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">API Testing Guide</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive guide to test the Wiseserve Feedback API
          </p>
        </div>

        <Tabs defaultValue="curl" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="curl">cURL Examples</TabsTrigger>
            <TabsTrigger value="code">Code Examples</TabsTrigger>
            <TabsTrigger value="reference">API Reference</TabsTrigger>
          </TabsList>


          <TabsContent value="curl" className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  cURL Commands
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-feedback-happy" />
                    Basic API Call
                  </h4>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">{curlExample}</pre>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(curlExample)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-feedback-happy" />
                    Health Check
                  </h4>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                      {`curl https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link \\
  -H "Authorization: Bearer <your-token>"`}
                    </pre>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard('curl https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link \\\n  -H "Authorization: Bearer <your-token>"')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-feedback-bad" />
                    Error Test (Missing Fields)
                  </h4>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`curl -X POST https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <your-token>" \\
  -d '{
    "ticket_number": "TEST-001"
  }'`}
                    </pre>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(`curl -X POST https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <your-token>" \\
  -d '{
    "ticket_number": "TEST-001"
  }'`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    JavaScript/Node.js
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96">{jsExample}</pre>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(jsExample)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Python
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96">{pythonExample}</pre>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(pythonExample)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reference" className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  API Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Endpoint</h4>
                  <Badge variant="outline" className="text-sm">
                    POST https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Authentication:</strong> Bearer token required
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Required Fields</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li><code>ticket_number</code> (string) - Unique ticket identifier</li>
                    <li><code>technician</code> (string) - Name of the technician</li>
                    <li><code>ticket_title</code> (string) - Brief description of the issue</li>
                    <li><code>customer_email</code> (string) - Customer's email address</li>
                    <li><code>customer_name</code> (string) - Customer's name</li>
                    <li><code>expires_hours</code> (number) - Link expiration in hours</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Headers</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li><code>Content-Type: application/json</code></li>
                    <li><code>Authorization: Bearer &lt;your-token&gt;</code></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Success Response (200)</h4>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "success": true,
  "data": {
    "token": "abc123...",
    "feedback_url": "https://feedback.wiseserve.net/feedback/abc123...",
    "ticket_number": "TK-12345",
    "technician": "John Doe", 
    "ticket_title": "Computer won't start",
    "customer_email": "customer@example.com",
    "customer_name": "Jane Smith",
    "expires_in_hours": 48
  }
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Error Responses</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-sm">400 - Missing Required Fields</h5>
                      <pre className="bg-muted p-4 rounded-md text-sm overflow-auto mt-2">
{`{
  "error": "Missing required fields: ticket_number, technician, ticket_title, customer_email, customer_name, expires_hours"
}`}
                      </pre>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">401 - Unauthorized</h5>
                      <pre className="bg-muted p-4 rounded-md text-sm overflow-auto mt-2">
{`{
  "error": "Missing or invalid authorization token"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ApiTestGuide;