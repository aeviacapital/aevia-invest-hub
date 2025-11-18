import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Plus, Edit, Trash2, UserPlus } from 'lucide-react';

const AdminTraders = () => {
  const { toast } = useToast();
  const [traders, setTraders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrader, setEditingTrader] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
const [traderForm, setTraderForm] = useState({
  username: '',
  bio: '',
  avatar_url: '',
  total_trades: 0,
  winning_trades: 0,
  roi_percentage: 0,
  min_copy_amount: 100,
  max_copy_amount: 10000,
  followers_count: 0,
  is_active: true
});
  

  useEffect(() => {
    fetchTraders();
  }, []);

  const fetchTraders = async () => {
    const { data } = await supabase
      .from('trader_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    setTraders(data || []);
  };

  const handleSubmit = async () => {
    if (!traderForm.username) {
      toast({
        title: 'Error',
        description: 'Username is required',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      if (editingTrader) {
        const { error } = await supabase
          .from('trader_profiles')
          .update(traderForm)
          .eq('id', editingTrader.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Trader updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('trader_profiles')
          .insert(traderForm);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Trader created successfully',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTraders();

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }

    setIsLoading(false);
  };

  const handleEdit = (trader: any) => {
    setEditingTrader(trader);
setTraderForm({
  name: trader.name,
  profit_loss: trader.profit_loss,
  leverage: trader.leverage,
  total_trades: trader.total_trades,
  win_rate: trader.win_rate,
  followers_count: trader.followers_count || "",
  avatar_url: trader.avatar_url || "",
});
    setIsDialogOpen(true);
  };

  const handleDelete = async (traderId: string) => {
    if (!confirm('Are you sure you want to delete this trader?')) return;

    try {
      const { error } = await supabase
        .from('trader_profiles')
        .delete()
        .eq('id', traderId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Trader deleted successfully',
      });

      fetchTraders();

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
const resetForm = () => {
  setEditingTrader(null);
  setTraderForm({
    username: '',
    bio: '',
    avatar_url: '',
    total_trades: 0,
    winning_trades: 0,
    roi_percentage: 0,
    min_copy_amount: 100,
    max_copy_amount: 10000,
    followers_count: 0,
    is_active: true
  });
};

  
  return (
    <Card className="card-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Manage Traders
            </CardTitle>
            <CardDescription>
              Create and manage copy trading traders
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="btn-hero">
                <Plus className="w-4 h-4 mr-2" />
                Add Trader
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTrader ? 'Edit Trader' : 'Create New Trader'}
                </DialogTitle>
                <DialogDescription>
                  {editingTrader ? 'Update trader details' : 'Add a new trader for users to copy'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Username *</Label>
                    <Input
                      placeholder="Trader username"
                      value={traderForm.username}
                      onChange={(e) => setTraderForm(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
<div className="space-y-2">
  <Label>Avatar</Label>

  <Input
    type="file"
    accept="image/*"
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingImage(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trader-avatars')
        .upload(filePath, file);

      if (uploadError) {
        toast({
          title: "Upload Failed",
          description: uploadError.message,
          variant: "destructive"
        });
        setUploadingImage(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('trader-avatars')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        setTraderForm(prev => ({ ...prev, avatar_url: urlData.publicUrl }));
      }

      toast({
        title: "Uploaded",
        description: "Avatar uploaded successfully!"
      });

      setUploadingImage(false);
    }}
  />

  {uploadingImage && (
    <p className="text-xs text-muted-foreground">Uploading...</p>
  )}

  {traderForm.avatar_url && (
    <img
      src={traderForm.avatar_url}
      alt="avatar preview"
      className="w-20 h-20 rounded-full object-cover mt-2 border"
    />
  )}
</div>
                  
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    placeholder="Trader bio..."
                    value={traderForm.bio}
                    onChange={(e) => setTraderForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Total Trades</Label>
                    <Input
                      type="number"
                      value={traderForm.total_trades}
                      onChange={(e) => setTraderForm(prev => ({ ...prev, total_trades: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Winning Trades</Label>
                    <Input
                      type="number"
                      value={traderForm.winning_trades}
                      onChange={(e) => setTraderForm(prev => ({ ...prev, winning_trades: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ROI %</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={traderForm.roi_percentage}
                      onChange={(e) => setTraderForm(prev => ({ ...prev, roi_percentage: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min Copy Amount</Label>
                    <Input
                      type="number"
                      value={traderForm.min_copy_amount}
                      onChange={(e) => setTraderForm(prev => ({ ...prev, min_copy_amount: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Copy Amount</Label>
                    <Input
                      type="number"
                      value={traderForm.max_copy_amount}
                      onChange={(e) => setTraderForm(prev => ({ ...prev, max_copy_amount: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
<div className="space-y-2">
  <Label>Followers</Label>
  <Input
    type="number"
    value={traderForm.followers_count}
    onChange={(e) => setTraderForm(prev => ({ ...prev, followers_count: parseInt(e.target.value || '0', 10) }))}
  />
</div>
                

                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full btn-hero"
                >
                  {isLoading ? 'Saving...' : (editingTrader ? 'Update Trader' : 'Create Trader')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>ROI</TableHead>
              <TableHead>Copy Range</TableHead>
              <TableHead>Followers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {traders.map((trader) => (
              <TableRow key={trader.id}>
                <TableCell className="font-medium">{trader.username}</TableCell>
                <TableCell>
                  {trader.winning_trades}/{trader.total_trades} wins
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {((trader.winning_trades / trader.total_trades) * 100).toFixed(1)}% win rate
                  </span>
                </TableCell>
                <TableCell className="text-success font-medium">
                  +{trader.roi_percentage}%
                </TableCell>
                <TableCell className="text-sm">
                  ${trader.min_copy_amount} - ${trader.max_copy_amount}
                </TableCell>
                <TableCell>{trader.followers_count}</TableCell>
                <TableCell>
                  <Badge variant={trader.is_active ? 'default' : 'secondary'}>
                    {trader.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(trader)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(trader.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminTraders;
