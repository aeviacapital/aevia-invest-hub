import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Check, Info, AlertTriangle, CheckCircle } from 'lucide-react';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setNotifications(data || []);
    setUnreadCount(data?.filter(n => !n.is_read).length || 0);
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const channel = supabase
      .channel('notification-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    fetchNotifications();
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    fetchNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'info':
        return <Info className="w-5 h-5 text-primary" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-destructive">{unreadCount}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Stay updated with important alerts and messages
              </CardDescription>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <Check className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    !notification.is_read ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
