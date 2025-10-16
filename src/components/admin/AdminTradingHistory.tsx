import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Edit, TrendingUp, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const AdminTradingHistory = () => {
  const { toast } = useToast();
  const { user: adminUser } = useAuth();
  const [trades, setTrades] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [editingTrade, setEditingTrade] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    profit_loss: 0,
    exit_price: 0,
    status: 'open',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchTrades();
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .order('full_name');

    setUsers(data || []);
  };

  const fetchTrades = async () => {
    if (!selectedUserId) return;

    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', selectedUserId)
      .order('created_at', { ascending: false });

    setTrades(data || []);
  };

  const handleEdit = (trade: any) => {
    setEditingTrade(trade);
    setFormData({
      profit_loss: trade.profit_loss || 0,
      exit_price: trade.exit_price || trade.current_price || 0,
      status: trade.status,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const oldValues = {
        profit_loss: editingTrade.profit_loss,
        exit_price: editingTrade.exit_price,
        status: editingTrade.status,
      };

      const { error: tradeError } = await supabase
        .from('trades')
        .update({
          profit_loss: formData.profit_loss,
          exit_price: formData.exit_price,
          status: formData.status,
          closed_at: formData.status === 'closed' ? new Date().toISOString() : null,
        })
        .eq('id', editingTrade.id);

      if (tradeError) throw tradeError;

      // Log audit trail
      await supabase.from('audit_logs').insert({
        admin_id: adminUser?.id,
        action_type: 'update_trade',
        target_user_id: editingTrade.user_id,
        target_table: 'trades',
        target_id: editingTrade.id,
        old_value: oldValues,
        new_value: formData,
        description: `Admin modified trade for user ${editingTrade.user_id}`,
      });

      // Update user balance if trade was closed
      if (formData.status === 'closed' && editingTrade.status !== 'closed') {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('balance')
          .eq('user_id', editingTrade.user_id)
          .single();

        const newBalance = (profileData?.balance || 0) + formData.profit_loss;

        await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('user_id', editingTrade.user_id);

        // Log balance update
        await supabase.from('audit_logs').insert({
          admin_id: adminUser?.id,
          action_type: 'update_user_balance',
          target_user_id: editingTrade.user_id,
          target_table: 'profiles',
          old_value: { balance: profileData?.balance },
          new_value: { balance: newBalance },
          description: `Balance updated due to trade closure: ${formData.profit_loss >= 0 ? '+' : ''}$${formData.profit_loss}`,
        });
      }

      toast({
        title: 'Success',
        description: 'Trade updated successfully',
      });

      fetchTrades();
      setEditingTrade(null);
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Trading History Management
          </CardTitle>
          <CardDescription>View and modify user trading records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label>Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedUserId && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Entry Price</TableHead>
                      <TableHead>Exit Price</TableHead>
                      <TableHead>P&L</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trades.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No trades found for this user
                        </TableCell>
                      </TableRow>
                    ) : (
                      trades.map((trade) => (
                        <TableRow key={trade.id}>
                          <TableCell className="font-medium">{trade.symbol}</TableCell>
                          <TableCell>
                            <Badge variant={trade.trade_type === 'buy' ? 'default' : 'secondary'}>
                              {trade.trade_type}
                            </Badge>
                          </TableCell>
                          <TableCell>${trade.entry_price}</TableCell>
                          <TableCell>
                            ${trade.exit_price || trade.current_price || '-'}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                (trade.profit_loss || 0) >= 0
                                  ? 'text-success font-semibold'
                                  : 'text-destructive font-semibold'
                              }
                            >
                              {(trade.profit_loss || 0) >= 0 ? '+' : ''}$
                              {(trade.profit_loss || 0).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                trade.status === 'closed'
                                  ? 'secondary'
                                  : trade.status === 'open'
                                  ? 'default'
                                  : 'destructive'
                              }
                            >
                              {trade.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(trade.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(trade)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {editingTrade && (
        <Dialog open={!!editingTrade} onOpenChange={() => setEditingTrade(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Trade</DialogTitle>
              <DialogDescription>
                Modify trade details. Changes will be logged and may affect user balance.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol:</span>
                  <span className="font-medium">{editingTrade.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry Price:</span>
                  <span className="font-medium">${editingTrade.entry_price}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exit_price">Exit Price ($)</Label>
                <Input
                  id="exit_price"
                  type="number"
                  step="0.01"
                  value={formData.exit_price}
                  onChange={(e) =>
                    setFormData({ ...formData, exit_price: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profit_loss">Profit/Loss ($)</Label>
                <Input
                  id="profit_loss"
                  type="number"
                  step="0.01"
                  value={formData.profit_loss}
                  onChange={(e) =>
                    setFormData({ ...formData, profit_loss: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm text-warning">
                  ⚠️ Changes will be logged and tracked. Closing a trade will update the user's
                  balance.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingTrade(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
