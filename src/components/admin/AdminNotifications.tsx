import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell, Send, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminNotifications = () => {
  const { toast } = useToast();
  const { user: adminUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    recipient: 'single',
    userId: '',
    title: '',
    message: '',
    type: 'info',
    actionLink: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .order('full_name');

    setUsers(data || []);
  };

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const baseNotification = {
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type,
        is_read: false,
        sent_by: adminUser?.id,
        action_link: notificationForm.actionLink || null,
      };

      if (notificationForm.recipient === 'single') {
        if (!notificationForm.userId) {
          throw new Error('Please select a user');
        }

        const { error } = await supabase
          .from('notifications')
          .insert({
            ...baseNotification,
            user_id: notificationForm.userId,
          });

        if (error) throw error;
      } else {
        // Send to all users from profiles table
        const { data: allProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id');

        if (profilesError) throw profilesError;

        const notifications = allProfiles?.map(profile => ({
          ...baseNotification,
          user_id: profile.user_id,
        })) || [];

        const { error } = await supabase
          .from('notifications')
          .insert(notifications);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Notification sent successfully to ${
          notificationForm.recipient === 'single' ? 'user' : 'all users'
        }`,
      });

      setNotificationForm({
        recipient: 'single',
        userId: '',
        title: '',
        message: '',
        type: 'info',
        actionLink: ''
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }

    setIsLoading(false);
  };

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Send Notifications
        </CardTitle>
        <CardDescription>
          Send notifications to users on the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Recipient</Label>
            <Select
              value={notificationForm.recipient}
              onValueChange={(value) => setNotificationForm(prev => ({ ...prev, recipient: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single User</SelectItem>
                <SelectItem value="all">All Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {notificationForm.recipient === 'single' && (
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select
                value={notificationForm.userId}
                onValueChange={(value) => setNotificationForm(prev => ({ ...prev, userId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={notificationForm.type}
              onValueChange={(value) => setNotificationForm(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="Notification title"
              value={notificationForm.title}
              onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              placeholder="Notification message..."
              value={notificationForm.message}
              onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Action Link (Optional)</Label>
            <Input
              placeholder="e.g., /dashboard/investments"
              value={notificationForm.actionLink}
              onChange={(e) => setNotificationForm(prev => ({ ...prev, actionLink: e.target.value }))}
            />
          </div>

          <Button
            onClick={handleSendNotification}
            disabled={isLoading}
            className="w-full btn-hero"
          >
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send Notification'}
          </Button>
        </div>

        {notificationForm.recipient === 'all' && (
          <div className="p-4 border rounded-lg bg-warning/10 border-warning/20">
            <p className="text-sm text-warning flex items-center">
              <Users className="w-4 h-4 mr-2" />
              This will send the notification to all {users.length} users
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminNotifications;
