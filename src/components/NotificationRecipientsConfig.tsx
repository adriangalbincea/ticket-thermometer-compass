import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationRecipient {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
}

export const NotificationRecipientsConfig: React.FC = () => {
  const { toast } = useToast();
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_recipients')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setRecipients(data || []);
    } catch (error) {
      console.error('Error loading notification recipients:', error);
      toast({
        title: "Error",
        description: "Failed to load notification recipients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both name and email",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase
        .from('notification_recipients')
        .insert({
          name: newName.trim(),
          email: newEmail.trim(),
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Notification recipient added successfully",
      });

      setNewName('');
      setNewEmail('');
      loadRecipients();
    } catch (error) {
      console.error('Error adding notification recipient:', error);
      toast({
        title: "Error",
        description: "Failed to add notification recipient",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('notification_recipients')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Recipient ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });

      loadRecipients();
    } catch (error) {
      console.error('Error updating recipient:', error);
      toast({
        title: "Error",
        description: "Failed to update recipient",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecipient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipient?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('notification_recipients')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Recipient deleted successfully",
      });

      loadRecipients();
    } catch (error) {
      console.error('Error deleting recipient:', error);
      toast({
        title: "Error",
        description: "Failed to delete recipient",
        variant: "destructive",
      });
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
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Feedback Notification Recipients
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new recipient form */}
        <form onSubmit={handleAddRecipient} className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-medium">Add New Recipient</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipient-name">Name</Label>
              <Input
                id="recipient-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient-email">Email</Label>
              <Input
                id="recipient-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="john@company.com"
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={adding} className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            {adding ? 'Adding...' : 'Add Recipient'}
          </Button>
        </form>

        {/* Recipients list */}
        <div className="space-y-4">
          <h3 className="font-medium">Current Recipients</h3>
          {recipients.length === 0 ? (
            <p className="text-muted-foreground">No notification recipients configured yet.</p>
          ) : (
            <div className="space-y-2">
              {recipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{recipient.name}</div>
                    <div className="text-sm text-muted-foreground">{recipient.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={recipient.is_active ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => handleToggleActive(recipient.id, recipient.is_active)}
                    >
                      {recipient.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRecipient(recipient.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            These recipients will receive email notifications whenever feedback is submitted. 
            Only active recipients will receive notifications. The emails will be sent using 
            the SMTP settings configured above.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};