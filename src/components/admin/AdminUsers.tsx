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
import { Search, UserCheck, UserX, Eye } from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                  <TableRow key={user.id}>
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
                    <TableCell>${user.balance?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
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
    </div>
  );
};