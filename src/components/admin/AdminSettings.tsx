import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Settings, Users, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export const AdminSettings = () => {
  const [invitationCodes, setInvitationCodes] = useState<any[]>([]);
  const [newCodeCount, setNewCodeCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvitationCodes();
  }, []);

  const fetchInvitationCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('invitation_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitationCodes(data || []);
    } catch (error) {
      console.error('Error fetching invitation codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch invitation codes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateInvitationCodes = async () => {
    try {
      const codes = [];
      for (let i = 0; i < newCodeCount; i++) {
        const code = `AEVIA${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        codes.push({
          code,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        });
      }

      const { error } = await supabase
        .from('invitation_codes')
        .insert(codes);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Generated ${newCodeCount} invitation code(s)`,
      });

      fetchInvitationCodes();
      setNewCodeCount(1);
    } catch (error) {
      console.error('Error generating invitation codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate invitation codes',
        variant: 'destructive',
      });
    }
  };

  const deleteInvitationCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from('invitation_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Invitation code deleted',
      });

      fetchInvitationCodes();
    } catch (error) {
      console.error('Error deleting invitation code:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete invitation code',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invitation Codes Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invitation Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Generate New Codes */}
            <div className="flex items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="codeCount">Number of codes to generate</Label>
                <Input
                  id="codeCount"
                  type="number"
                  min="1"
                  max="100"
                  value={newCodeCount}
                  onChange={(e) => setNewCodeCount(parseInt(e.target.value) || 1)}
                  className="w-32"
                />
              </div>
              <Button onClick={generateInvitationCodes}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Codes
              </Button>
            </div>

            {/* Codes Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Used By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitationCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono">{code.code}</TableCell>
                      <TableCell>
                        <Badge variant={code.is_used ? 'destructive' : 'default'}>
                          {code.is_used ? 'Used' : 'Available'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(code.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {code.expires_at 
                          ? format(new Date(code.expires_at), 'MMM dd, yyyy')
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        {code.used_by ? (
                          <span className="text-sm text-muted-foreground">
                            {code.used_by.slice(0, 8)}...
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {!code.is_used && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteInvitationCode(code.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {invitationCodes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No invitation codes found. Generate some codes to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Platform Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input
                  id="platformName"
                  defaultValue="AeviaCapital"
                  placeholder="Enter platform name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  placeholder="support@aeviacapital.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Welcome Message</Label>
              <Textarea
                id="welcomeMessage"
                placeholder="Enter welcome message for new users"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="maintenanceMode" />
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="registrationEnabled" defaultChecked />
              <Label htmlFor="registrationEnabled">Registration Enabled</Label>
            </div>

            <Button>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};