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
import { Search, Check, X, Eye } from 'lucide-react';
import { format } from 'date-fns';

export const AdminDeposits = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [filteredDeposits, setFilteredDeposits] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeposits();
  }, []);

  useEffect(() => {
    filterDeposits();
  }, [deposits, searchTerm, statusFilter]);

  const fetchDeposits = async () => {
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeposits(data || []);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch deposits',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterDeposits = () => {
    let filtered = deposits;

    if (searchTerm) {
      filtered = filtered.filter(
        (deposit) =>
          deposit.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          deposit.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          deposit.transaction_hash?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((deposit) => deposit.status === statusFilter);
    }

    setFilteredDeposits(filtered);
  };

  const updateDepositStatus = async (depositId: string, status: string) => {
    try {
      const updateData: any = { status };
      
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
        
        // Also update user balance
        const deposit = deposits.find(d => d.id === depositId);
        if (deposit) {
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('balance')
            .eq('user_id', deposit.user_id)
            .single();

          if (currentProfile) {
            const newBalance = (currentProfile.balance || 0) + deposit.amount;
            const { error: balanceError } = await supabase
              .from('profiles')
              .update({ balance: newBalance })
              .eq('user_id', deposit.user_id);

            if (balanceError) throw balanceError;
          }
        }
      }

      const { error } = await supabase
        .from('deposits')
        .update(updateData)
        .eq('id', depositId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Deposit ${status} successfully`,
      });

      fetchDeposits();
    } catch (error) {
      console.error('Error updating deposit status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update deposit status',
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
            Deposit Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deposits..."
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
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Deposits Table */}
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
                {filteredDeposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{deposit.profiles?.full_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {deposit.profiles?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${deposit.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{deposit.currency}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">
                        {deposit.wallet_address.slice(0, 12)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          deposit.status === 'confirmed'
                            ? 'default'
                            : deposit.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {deposit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(deposit.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {deposit.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateDepositStatus(deposit.id, 'confirmed')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateDepositStatus(deposit.id, 'rejected')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDeposits.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No deposits found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};