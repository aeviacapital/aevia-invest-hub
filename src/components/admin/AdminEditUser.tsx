import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    balance: user?.wallet_balance || 0,
  });

  // 🔹 Reset form when user changes
  useEffect(() => {
    setFormData({
      full_name: user?.full_name || '',
      balance: user?.wallet_balance || 0,
    });
  }, [user]);

  // 🔹 Log admin audit actions
  const logAuditAction = async (action: string, oldValue: any, newValue: any) => {
    if (!adminUser) return;
    try {
      await supabase.from('audit_logs').insert({
        admin_id: adminUser.id,
        action_type: action,
        target_user_id: user.user_id,
        target_table: 'users',
        target_id: user.user_id,
        old_value: oldValue,
        new_value: newValue,
        description: `Admin ${action} for user ${user.email}`,
      });
    } catch (error) {
      console.warn('Audit log failed:', error);
    }
  };

  // 🔹 Update user details
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updates: any = {};
      const oldValues: any = {};
      const newValues: any = {};

      if (formData.full_name !== user.full_name) {
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: formData.full_name })
          .eq('user_id', user.user_id);
        if (error) throw error;
        oldValues.full_name = user.full_name;
        newValues.full_name = formData.full_name;
      }

      if (parseFloat(formData.balance.toString()) !== parseFloat(user.wallet_balance || 0)) {
        const { error } = await supabase.rpc('update_wallet_balance', {
          p_user_id: user.user_id,
          p_new_balance: formData.balance,
        });
        if (error) throw error;
        oldValues.balance = user.wallet_balance;
        newValues.balance = formData.balance;
      }

      if (Object.keys(oldValues).length === 0) {
        toast({ title: 'No Changes', description: 'No changes were made.' });
        setIsLoading(false);
        return;
      }

      await logAuditAction('update_user_wallet', oldValues, newValues);

      toast({ title: 'Success', description: 'User data updated successfully.' });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Handle deletion via Edge Function
  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to delete user');
      }

      await logAuditAction('delete_user', user, null);

      toast({
        title: 'User Deleted',
        description: `User ${user.email} has been permanently removed.`,
      });

      setConfirmDelete(false);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Manage {user?.email}'s profile and wallet balance. All actions are logged.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter full name"
              disabled={isLoading}
            />
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <Label htmlFor="balance">Wallet Balance (€)</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) =>
                setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })
              }
              placeholder="Enter wallet balance"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
              disabled={isLoading}
            >
              Delete User
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* 🔹 Confirmation Dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-2">
              <AlertTriangle className="h-10 w-10 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center space-x-4 mt-6">
            <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

