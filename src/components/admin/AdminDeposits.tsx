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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Check, X, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';

export const AdminDeposits = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [filteredDeposits, setFilteredDeposits] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({
    user_id: '',
    currency: 'BTC',
    amount: 0,
    wallet_address: '',
    transaction_hash: '',
    status: 'pending',
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchDeposits();
  }, []);

  useEffect(() => {
    filterDeposits();
  }, [deposits, searchTerm, statusFilter]);

  const fetchDeposits = async () => {
    try {
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });
      if (depositsError) throw depositsError;

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email');
      if (profilesError) throw profilesError;

      const depositsWithProfiles = depositsData?.map((deposit) => ({
        ...deposit,
        profiles: profilesData?.find((p) => p.user_id === deposit.user_id),
      })) || [];

      setProfiles(profilesData || []);
      setDeposits(depositsWithProfiles);
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

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const openAddDialog = () => {
    setEditingDeposit(null);
    setFormData({
      user_id: '',
      currency: 'BTC',
      amount: 0,
      wallet_address: '',
      transaction_hash: '',
      status: 'pending',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (deposit: any) => {
    setEditingDeposit(deposit);
    setFormData(deposit);
    setIsDialogOpen(true);
  };

  const handleSaveDeposit = async () => {
    try {
      if (!formData.user_id || !formData.amount || !formData.wallet_address) {
        toast({
          title: 'Error',
          description: 'Please fill all required fields',
          variant: 'destructive',
        });
        return;
      }

      if (editingDeposit) {
        // Update deposit
        const { error } = await supabase
          .from('deposits')
          .update({
            user_id: formData.user_id,
            currency: formData.currency,
            amount: formData.amount,
            wallet_address: formData.wallet_address,
            transaction_hash: formData.transaction_hash,
            status: formData.status,
          })
          .eq('id', editingDeposit.id);
        if (error) throw error;
        toast({ title: 'Deposit Updated', description: 'Deposit updated successfully.' });
      } else {
        // Add new deposit
        const { error } = await supabase
          .from('deposits')
          .insert({
            user_id: formData.user_id,
            currency: formData.currency,
            amount: formData.amount,
            wallet_address: formData.wallet_address,
            transaction_hash: formData.transaction_hash || null,
            status: formData.status,
          });
        if (error) throw error;
        toast({ title: 'Deposit Added', description: 'New deposit added successfully.' });
      }

      setIsDialogOpen(false);
      fetchDeposits();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDeposit = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deposit?')) return;

    try {
      const { error } = await supabase.from('deposits').delete().eq('id', id);
      if (error) throw error;

      toast({ title: 'Deleted', description: 'Deposit removed successfully.' });
      fetchDeposits();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Deposit Management
          </CardTitle>
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" /> Add Deposit
          </Button>
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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
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
                    <TableCell>${deposit.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{deposit.currency}</Badge>
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
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(deposit)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteDeposit(deposit.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDeposits.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No deposits found.</div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDeposit ? 'Edit Deposit' : 'Add Deposit'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">User</label>
              <Select
                value={formData.user_id}
                onValueChange={(v) => handleFormChange('user_id', v)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.user_id} value={p.user_id}>
                      {p.full_name} ({p.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => handleFormChange('amount', parseFloat(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Currency</label>
              <Select
                value={formData.currency}
                onValueChange={(v) => handleFormChange('currency', v)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="SOL">SOL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Wallet Address</label>
              <Input
                value={formData.wallet_address}
                onChange={(e) => handleFormChange('wallet_address', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Transaction Hash</label>
              <Input
                value={formData.transaction_hash || ''}
                onChange={(e) => handleFormChange('transaction_hash', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(v) => handleFormChange('status', v)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSaveDeposit}>
              {editingDeposit ? 'Update Deposit' : 'Add Deposit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

