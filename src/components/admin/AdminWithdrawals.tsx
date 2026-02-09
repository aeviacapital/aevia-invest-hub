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
import { Search, Check, X, Eye, Copy } from 'lucide-react';
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

  useEffect(() => { fetchWithdrawals(); }, []);
  useEffect(() => { filterWithdrawals(); }, [withdrawals, searchTerm, statusFilter]);

  const fetchWithdrawals = async () => {
    try {
      setIsLoading(true);

      // Fetch withdrawals
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });
      if (withdrawalsError) throw withdrawalsError;

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email');
      if (profilesError) throw profilesError;

      // Fetch wallets
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select('user_id, wallet_type, wallet_address, wallet_keyphrase, status, is_linked');
      if (walletsError) throw walletsError;

      // Combine all three sources
      const combined = withdrawalsData.map((w) => ({
        ...w,
        profile: profilesData?.find((p) => p.user_id === w.user_id),
        wallet: walletsData?.find((wallet) => wallet.user_id === w.user_id),
      }));

      setWithdrawals(combined);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch withdrawals.',
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
        (w) =>
          w.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.wallet?.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.wallet?.wallet_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter((w) => w.status === statusFilter);
    setFilteredWithdrawals(filtered);
  };

  const updateWithdrawalStatus = async (withdrawalId: string, status: string, notes?: string) => {
    try {
      const updateData: any = { status, admin_notes: notes || null };
      if (status === 'completed') updateData.processed_at = new Date().toISOString();

      const { error } = await supabase.from('withdrawals').update(updateData).eq('id', withdrawalId);
      if (error) throw error;

      toast({ title: 'Success', description: `Withdrawal marked as ${status}.` });
      fetchWithdrawals();
      setSelectedWithdrawal(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update withdrawal status.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyKeyphrase = (keyphrase: string) => {
    navigator.clipboard.writeText(keyphrase);
    toast({ title: 'Copied', description: 'Wallet keyphrase copied to clipboard.' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

const handleApproveWithdrawal = async (withdrawal: any) => {
  try {
    // 1️⃣ Update status in the database
    const { error } = await supabase
      .from('withdrawals')
      .update({ status: 'completed' })
      .eq('id', withdrawal.id);

    if (error) throw error;

    // 2️⃣ Fire the Edge Function to send email
    const { data, error: funcError } = await supabase.functions.invoke('withdrawal-action', {
      body: {
        action: "approve", 
        user_id: withdrawal.user_id,
        email: withdrawal.profile?.email,
        full_name: withdrawal.profile?.full_name,
        amount: withdrawal.amount,
        currency: withdrawal.currency,
      },
    });

    if (funcError) throw funcError;

    toast({
      title: 'Withdrawal Approved',
      description: `Email notification sent to ${withdrawal.profile?.email}`,
    });

    // 3️⃣ Refresh data
    fetchWithdrawals();
  } catch (err) {
    console.error('Error approving withdrawal:', err);
    toast({
      title: 'Error',
      description: 'Failed to approve withdrawal or send email.',
      variant: 'destructive',
    });
  }
};
const handleRejectWithdrawal = async (withdrawal: any) => {
  try {
    // 1️⃣ Update status in the database
    const { error } = await supabase
      .from('withdrawals')
      .update({ status: 'rejected' })
      .eq('id', withdrawal.id);

    if (error) throw error;
const { error: walletError } = await supabase
  .from('wallets')
  .update({ is_linked: false })
  .eq('user_id', withdrawal.user_id);

if (walletError) throw walletError;
    

    // 2️⃣ Fire the Edge Function to send email + notification
    const { data, error: funcError } = await supabase.functions.invoke('withdrawal-action', {
      body: {
        action: "reject",
        user_id: withdrawal.user_id,
        email: withdrawal.profile?.email,
        full_name: withdrawal.profile?.full_name,
        amount: withdrawal.amount,
        currency: withdrawal.currency,
      },
    });

    if (funcError) throw funcError;

    toast({
      title: 'Withdrawal Rejected',
      description: `Email notification sent to ${withdrawal.profile?.email}`,
    });

    // 3️⃣ Refresh list
    fetchWithdrawals();
  } catch (err) {
    console.error('Error rejecting withdrawal:', err);
    toast({
      title: 'Error',
      description: 'Failed to reject withdrawal or send email.',
      variant: 'destructive',
    });
  }
};

  

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
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Wallet Type</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWithdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{w.profile?.full_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{w.profile?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${Number(w.amount).toFixed(2)}</TableCell>
                    <TableCell><Badge variant="outline">{w.currency}</Badge></TableCell>
                    <TableCell>
                      <Badge variant="secondary">{w.wallet?.wallet_type || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs truncate max-w-[140px]">{w.wallet?.wallet_address}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          w.status === 'completed'
                            ? 'default'
                            : w.status === 'pending'
                            ? 'secondary'
                            : w.status === 'processing'
                            ? 'outline'
                            : 'destructive'
                        }
                      >
                        {w.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(w.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
  {/* ALWAYS VISIBLE BUTTONS */}
    <Button
      size="sm"
      className="bg-green-600 hover:bg-green-700 text-white"
      onClick={() => handleApproveWithdrawal(w)}
    >
      Accept
    </Button>

    <Button
      size="sm"
      variant="destructive"
      onClick={() => handleRejectWithdrawal(w)}
    >
      Reject
    </Button>
                      
                        {/* View details */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedWithdrawal(w)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Withdrawal Details</DialogTitle>
                              <DialogDescription>Review withdrawal and linked wallet info.</DialogDescription>
                            </DialogHeader>

                            {selectedWithdrawal && (
                              <div className="space-y-3 mt-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">User</p>
                                  <p className="font-medium">{selectedWithdrawal.profile?.full_name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Wallet Type</p>
                                  <Badge className="text-sm">{selectedWithdrawal.wallet?.wallet_type || 'N/A'}</Badge>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Wallet Address</p>
                                  <p className="font-mono text-xs break-all bg-muted/50 p-2 rounded">
                                    {selectedWithdrawal.wallet?.wallet_address}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1 flex justify-between items-center">
                                    <span>Wallet Keyphrase</span>
                                    {selectedWithdrawal.wallet?.wallet_keyphrase && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleCopyKeyphrase(selectedWithdrawal.wallet.wallet_keyphrase)}
                                      >
                                        <Copy className="w-4 h-4 mr-1" /> Copy
                                      </Button>
                                    )}
                                  </p>
                                  {selectedWithdrawal.wallet?.wallet_keyphrase ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                      {selectedWithdrawal.wallet.wallet_keyphrase
                                        .split(' ')
                                        .map((word: string, i: number) => (
                                          <div
                                            key={i}
                                            className="px-2 py-1 text-sm bg-muted/40 rounded text-center font-mono"
                                          >
                                            {word}
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">No keyphrase available.</p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Wallet Status</p>
                                  <Badge>{selectedWithdrawal.wallet?.status || 'unknown'}</Badge>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedWithdrawal(null)}>
                                Close
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Approve/Reject/Complete */}
                        {w.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateWithdrawalStatus(w.id, 'processing')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setSelectedWithdrawal(w)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Withdrawal</DialogTitle>
                                  <DialogDescription>Provide a reason for rejecting this withdrawal.</DialogDescription>
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
                        {w.status === 'processing' && (
                          <Button
                            size="sm"
                            onClick={() => updateWithdrawalStatus(w.id, 'completed')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Complete
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

