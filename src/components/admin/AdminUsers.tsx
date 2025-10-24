import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, UserCheck, UserX, Eye, Edit } from 'lucide-react';
import { AdminEditUser } from './AdminEditUser';

// Helper for formatting Euro currency properly
const formatEuro = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);

export const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  // Fetch all users with their wallets + roles
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, kyc_status, is_verified, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rolesError) throw rolesError;

      // Fetch wallets
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select('user_id, balance');
      if (walletsError) throw walletsError;

      // Merge everything
      const combined = profilesData.map((profile) => {
        const userRoles = rolesData.filter((r) => r.user_id === profile.user_id);
        const wallet = walletsData.find((w) => w.user_id === profile.user_id);
        return {
          ...profile,
          balance: wallet?.balance || 0,
          user_roles: userRoles,
        };
      });

      setUsers(combined);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users and wallets',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users by search and status
  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => user.kyc_status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  // Update KYC verification status
  const updateUserStatus = async (userId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: isVerified })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `User ${isVerified ? 'verified' : 'unverified'} successfully`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  // Adjust balance via RPC
  const adjustUserBalance = async (userId: string, newBalance: number, currentBalance: number) => {
    const delta = newBalance - currentBalance;
    if (delta === 0) return;

    try {
      const { data, error } = await supabase.rpc('admin_adjust_balance', {
        p_user_id: userId,
        p_amount: delta,
        p_reason: 'Admin manual balance adjustment',
      });

      if (error) throw error;

      toast({
        title: 'Balance Updated',
        description: `User balance adjusted successfully`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error adjusting balance:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user balance',
        variant: 'destructive',
      });
    }
  };

  const getUserRoleBadge = (userRoles: any[]) => {
    if (!userRoles || userRoles.length === 0) {
      return <Badge variant="secondary">User</Badge>;
    }

    return userRoles.map((role, index) => (
      <Badge key={index} variant={role.role === 'admin' ? 'default' : 'secondary'}>
        {role.role}
      </Badge>
    ));
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {user.user_id.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {getUserRoleBadge(user.user_roles)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.kyc_status === 'approved'
                            ? 'default'
                            : user.kyc_status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {user.kyc_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_verified ? 'default' : 'secondary'}>
                        {user.is_verified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatEuro(user.balance)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        {!user.is_verified ? (
                          <Button
                            size="sm"
                            onClick={() => updateUserStatus(user.user_id, true)}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserStatus(user.user_id, false)}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Unverify
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {editingUser && (
        <AdminEditUser
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
};

