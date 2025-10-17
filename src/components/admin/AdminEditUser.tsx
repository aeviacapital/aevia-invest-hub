import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AdminEditUserProps {
  user: any;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminEditUser = ({ user, open, onClose, onSuccess }: AdminEditUserProps) => {
  const { toast } = useToast();
  const { user: adminUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    balance: user?.balance || 0,
  });

  const logAuditAction = async (action: string, oldValue: any, newValue: any) => {
    if (!adminUser) return;

    await supabase.from('audit_logs').insert({
      admin_id: adminUser.id,
      action_type: action,
      target_user_id: user.user_id,
      target_table: 'profiles',
      target_id: user.id,
      old_value: oldValue,
      new_value: newValue,
      description: `Admin ${action} for user ${user.email}`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updates: any = {};
      const oldValues: any = {};
      const newValues: any = {};

      if (formData.full_name !== user.full_name) {
        updates.full_name = formData.full_name;
        oldValues.full_name = user.full_name;
        newValues.full_name = formData.full_name;
      }

      if (parseFloat(formData.balance.toString()) !== parseFloat(user.balance)) {
        updates.balance = formData.balance;
        oldValues.balance = user.balance;
        newValues.balance = formData.balance;
      }

      if (Object.keys(updates).length === 0) {
        toast({
          title: 'No Changes',
          description: 'No changes were made to the user profile.',
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.user_id);

      if (error) throw error;

      // Log audit trail
      await logAuditAction('update_user_profile', oldValues, newValues);

      // Trigger a profiles update event for real-time sync
      const channel = supabase.channel('profile-updates');
      channel.send({
        type: 'broadcast',
        event: 'profile_updated',
        payload: { user_id: user.user_id, updates }
      });

      toast({
        title: 'Success',
        description: 'User profile updated successfully',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Make changes to {user?.email}'s profile. All changes are logged.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Account Balance ($)</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
              placeholder="Enter balance"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
