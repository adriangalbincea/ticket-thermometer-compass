import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, UserPlus, Edit, Trash2, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ email: '', full_name: '', role: 'user' });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load users: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      if (!newUser.email || !newUser.full_name) {
        toast({
          title: "Error",
          description: "Email and full name are required.",
          variant: "destructive",
        });
        return;
      }

      // Generate a temporary password
      const generatedPassword = Math.random().toString(36).slice(-8) + 'A1!';
      
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: newUser.email,
          password: generatedPassword,
          full_name: newUser.full_name,
          role: newUser.role
        }
      });

      if (error) {
        throw error;
      }

      // Check if user already exists (success with warning)
      if (data?.warning) {
        setShowPasswordDialog(true);
        setTempPassword('USER_EXISTS');
        setNewUser({ email: '', full_name: '', role: 'user' });
        setIsDialogOpen(false);
        return;
      }

      // Show password dialog for new user
      setTempPassword(generatedPassword);
      setShowPasswordDialog(true);
      
      toast({
        title: "Success",
        description: "User created successfully!",
      });
      
      // Reset form and reload users
      setNewUser({ email: '', full_name: '', role: 'user' });
      setIsDialogOpen(false);
      loadUsers(); // Refresh the user list
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create user: " + error.message,
        variant: "destructive",
      });
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    toast({
      title: "Copied!",
      description: "Temporary password copied to clipboard.",
    });
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully.",
      });
      
      loadUsers();
      setEditingUser(null);
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update user: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will permanently remove the user from the system.')) return;

    try {
      // Call the edge function to delete user from auth and database
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "User deleted successfully from the system.",
      });
      
      loadUsers();
    } catch (error: any) {
      console.error("Delete user error:", error);
      toast({
        title: "Error",
        description: "Failed to delete user: " + error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'bg-red-100 text-red-800',
      user: 'bg-blue-100 text-blue-800',
      monitoring: 'bg-green-100 text-green-800'
    };
    return variants[role as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage user accounts and roles</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingUser ? editingUser.email : newUser.email}
                  onChange={(e) => editingUser 
                    ? setEditingUser({ ...editingUser, email: e.target.value })
                    : setNewUser({ ...newUser, email: e.target.value })
                  }
                  disabled={!!editingUser}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={editingUser ? editingUser.full_name : newUser.full_name}
                  onChange={(e) => editingUser
                    ? setEditingUser({ ...editingUser, full_name: e.target.value })
                    : setNewUser({ ...newUser, full_name: e.target.value })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={editingUser ? editingUser.role : newUser.role}
                  onValueChange={(value) => editingUser
                    ? setEditingUser({ ...editingUser, role: value })
                    : setNewUser({ ...newUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => editingUser 
                    ? handleUpdateUser(editingUser.id, { full_name: editingUser.full_name, role: editingUser.role })
                    : handleCreateUser()
                  }
                  className="bg-gradient-primary"
                >
                  {editingUser ? 'Update' : 'Create'} User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingUser(null);
                    setNewUser({ email: '', full_name: '', role: 'user' });
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadge(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Password/Warning Dialog */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent className="max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tempPassword === 'USER_EXISTS' ? 'User Already Exists' : 'User Created Successfully'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tempPassword === 'USER_EXISTS' 
                ? 'A user with this email address already exists in the system. No new user was created.'
                : 'The user has been created with a temporary password. Please share this password securely with the user.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          {tempPassword !== 'USER_EXISTS' && (
            <div className="p-4 bg-muted rounded-lg font-mono text-sm">
              {tempPassword}
            </div>
          )}
          <AlertDialogFooter>
            {tempPassword !== 'USER_EXISTS' && (
              <Button variant="outline" onClick={copyPassword}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Password
              </Button>
            )}
            <AlertDialogAction onClick={() => setShowPasswordDialog(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};