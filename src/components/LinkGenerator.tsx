import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Plus, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GeneratedLink {
  token: string;
  ticketNumber: string;
  technician: string;
  ticketTitle: string;
  customerEmail?: string;
  customerName?: string;
  expiresAt: string;
}

export const LinkGenerator: React.FC = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [technician, setTechnician] = useState('');
  const [ticketTitle, setTicketTitle] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [expiresHours, setExpiresHours] = useState('72');
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call the database function to create the link
      const { data, error } = await supabase.rpc('create_feedback_link', {
        p_ticket_number: ticketNumber,
        p_technician: technician,
        p_ticket_title: ticketTitle,
        p_customer_email: customerEmail || null,
        p_customer_name: customerName || null,
        p_expires_hours: parseInt(expiresHours)
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to generate feedback link: " + error.message,
          variant: "destructive",
        });
        return;
      }

      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + parseInt(expiresHours));

      const newLink: GeneratedLink = {
        token: data,
        ticketNumber,
        technician,
        ticketTitle,
        customerEmail: customerEmail || undefined,
        customerName: customerName || undefined,
        expiresAt: expiryDate.toISOString()
      };

      setGeneratedLinks(prev => [newLink, ...prev]);

      toast({
        title: "Link Generated!",
        description: "Feedback link has been created successfully.",
      });

      // Reset form
      setTicketNumber('');
      setTechnician('');
      setTicketTitle('');
      setCustomerEmail('');
      setCustomerName('');
      
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/feedback/${token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Feedback link copied to clipboard.",
    });
  };

  const openLink = (token: string) => {
    const url = `${window.location.origin}/feedback/${token}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Link Generator Form */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Generate Feedback Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateLink} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-number">Ticket Number*</Label>
                <Input
                  id="ticket-number"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  placeholder="TK-2024-001"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="technician">Technician*</Label>
                <Input
                  id="technician"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  placeholder="John Smith"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-title">Ticket Title*</Label>
              <Input
                id="ticket-title"
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                placeholder="Network connectivity issue resolved"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer-name">Customer Name (Optional)</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Alice Johnson"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customer-email">Customer Email (Optional)</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="alice@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires-hours">Expires After (Hours)</Label>
              <Input
                id="expires-hours"
                type="number"
                value={expiresHours}
                onChange={(e) => setExpiresHours(e.target.value)}
                min="1"
                max="168"
                placeholder="72"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-primary" 
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Feedback Link"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Generated Links */}
      {generatedLinks.length > 0 && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Generated Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedLinks.map((link) => (
                <div key={link.token} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-medium">{link.ticketNumber} - {link.ticketTitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        Technician: {link.technician}
                      </p>
                      {link.customerName && (
                        <p className="text-sm text-muted-foreground">
                          Customer: {link.customerName}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Expires: {new Date(link.expiresAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(link.token)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openLink(link.token)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Test Link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};