import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Check, X, Eye, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  useEffect(() => {
    filterWithdrawals();
  }, [withdrawals, searchTerm, statusFilter]);

  const fetchWithdrawals = async () => {
    try {
      // Fetch withdrawals
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      // Fetch profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email');

      if (profilesError) throw profilesError;

      // Combine the data
      const withdrawalsWithProfiles = withdrawalsData?.map(withdrawal => ({
        ...withdrawal,
        profiles: profilesData?.find(profile => profile.user_id === withdrawal.user_id)
      })) || [];

      setWithdrawals(withdrawalsWithProfiles);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch withdrawals',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterWithdrawals = () => {
    let filtered = withdrawals;

    if (searchTerm) {
      filtered = filtered.filter(
        (withdrawal) =>
          withdrawal.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          withdrawal.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          withdrawal.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((withdrawal) => withdrawal.status === statusFilter);
    }

    setFilteredWithdrawals(filtered);
  };

  const updateWithdrawalStatus = async (withdrawalId: string, status: string, notes?: string) => {
    try {
      const updateData: any = { 
        status,
        admin_notes: notes || null
      };
      
      if (status === 'completed') {
        updateData.processed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('withdrawals')
        .update(updateData)
        .eq('id', withdrawalId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Withdrawal ${status} successfully`,
      });

      fetchWithdrawals();
      setSelectedWithdrawal(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update withdrawal status',
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Withdrawal Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search withdrawals..."
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
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Withdrawals Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWithdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{withdrawal.profiles?.full_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {withdrawal.profiles?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${withdrawal.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{withdrawal.currency}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">
                        {withdrawal.wallet_address.slice(0, 12)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          withdrawal.status === 'completed'
                            ? 'default'
                            : withdrawal.status === 'pending'
                            ? 'secondary'
                            : withdrawal.status === 'processing'
                            ? 'outline'
                            : 'destructive'
                        }
                      >
                        {withdrawal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(withdrawal.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {withdrawal.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateWithdrawalStatus(withdrawal.id, 'processing')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setSelectedWithdrawal(withdrawal)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Withdrawal</DialogTitle>
                                  <DialogDescription>
                                    Please provide a reason for rejecting this withdrawal request.
                                  </DialogDescription>
                                </DialogHeader>
                                <Textarea
                                  placeholder="Enter rejection reason..."
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                />
                                <DialogFooter>
                                  <Button
                                    variant="destructive"
                                    onClick={() => 
                                      updateWithdrawalStatus(selectedWithdrawal?.id, 'cancelled', adminNotes)
                                    }
                                  >
                                    Reject Withdrawal
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                        {withdrawal.status === 'processing' && (
                          <Button
                            size="sm"
                            onClick={() => updateWithdrawalStatus(withdrawal.id, 'completed')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        {withdrawal.admin_notes && (
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredWithdrawals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No withdrawals found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};