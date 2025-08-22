import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowUpCircle, Clock, CheckCircle, XCircle, AlertTriangle, Wallet } from 'lucide-react';

const Withdrawals = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    currency: 'BTC',
    amount: 0,
    walletAddress: '',
    walletKeyphrase: ''
  });

  useEffect(() => {
    fetchWithdrawals();
  }, [user]);

  const fetchWithdrawals = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setWithdrawals(data || []);
  };

  const handleInputChange = (field: string, value: any) => {
    setWithdrawalForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWithdrawal = async () => {
    if (!user || withdrawalForm.amount <= 0 || !withdrawalForm.walletAddress) return;

    if (!profile?.is_verified) {
      toast({
        title: 'Verification Required',
        description: 'You must complete KYC verification before making withdrawals.',
        variant: 'destructive'
      });
      return;
    }

    if (withdrawalForm.amount > (profile?.balance || 0)) {
      toast({
        title: 'Insufficient Balance',
        description: 'Withdrawal amount exceeds your available balance.',
        variant: 'destructive'
      });
      return;
    }

    if (!withdrawalForm.walletKeyphrase) {
      toast({
        title: 'Wallet Keyphrase Required',
        description: 'Please enter your wallet keyphrase for security verification.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          currency: withdrawalForm.currency,
          amount: withdrawalForm.amount,
          wallet_address: withdrawalForm.walletAddress,
          wallet_keyphrase: withdrawalForm.walletKeyphrase,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Withdrawal Submitted',
        description: `Your withdrawal request for ${withdrawalForm.amount} ${withdrawalForm.currency} has been submitted for review.`,
      });

      fetchWithdrawals();
      setWithdrawalForm({
        currency: 'BTC',
        amount: 0,
        walletAddress: '',
        walletKeyphrase: ''
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }

    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'approved':
        return 'bg-primary';
      case 'completed':
        return 'bg-success';
      case 'rejected':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  const canWithdraw = profile?.is_verified && profile?.kyc_status === 'approved';

  return (
    <div className="space-y-6">
      {/* Withdrawal Form */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowUpCircle className="w-5 h-5 mr-2" />
            Request Withdrawal
          </CardTitle>
          <CardDescription>
            Withdraw funds from your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!canWithdraw && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {!profile?.is_verified 
                  ? 'You must complete KYC verification before making withdrawals. Please visit the KYC section.'
                  : 'Your KYC verification is pending approval. Withdrawals will be enabled once approved.'
                }
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select 
                  value={withdrawalForm.currency} 
                  onValueChange={(value) => handleInputChange('currency', value)}
                  disabled={!canWithdraw}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="USDT">Tether (USDT)</SelectItem>
                    <SelectItem value="SOL">Solana (SOL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  min="0"
                  max={profile?.balance || 0}
                  placeholder="Enter amount"
                  value={withdrawalForm.amount || ''}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                  disabled={!canWithdraw}
                />
                <p className="text-xs text-muted-foreground">
                  Available Balance: ${(profile?.balance || 0).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Wallet Address</Label>
                <Input
                  type="text"
                  placeholder="Enter your wallet address"
                  value={withdrawalForm.walletAddress}
                  onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                  disabled={!canWithdraw}
                />
              </div>

              <div className="space-y-2">
                <Label>Wallet Keyphrase</Label>
                <Input
                  type="password"
                  placeholder="Enter your wallet keyphrase for verification"
                  value={withdrawalForm.walletKeyphrase}
                  onChange={(e) => handleInputChange('walletKeyphrase', e.target.value)}
                  disabled={!canWithdraw}
                />
                <p className="text-xs text-muted-foreground">
                  Required for security verification
                </p>
              </div>

              <Button 
                onClick={handleWithdrawal}
                disabled={!canWithdraw || isLoading || withdrawalForm.amount <= 0 || !withdrawalForm.walletAddress || !withdrawalForm.walletKeyphrase}
                className="w-full btn-hero"
              >
                {isLoading ? 'Processing...' : 'Submit Withdrawal Request'}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/20">
                <h3 className="font-medium mb-2">Withdrawal Process</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>1. Submit withdrawal request</p>
                  <p>2. Admin reviews and approves</p>
                  <p>3. Funds are processed and sent</p>
                  <p>4. Transaction completed</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-warning/10 border-warning/20">
                <h4 className="font-medium text-warning mb-1">Security Notice</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• All withdrawals require admin approval</p>
                  <p>• Processing time: 24-48 hours</p>
                  <p>• Minimum withdrawal: $100</p>
                  <p>• Network fees may apply</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Account Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Real Balance:</span>
                    <span className="font-medium">${(profile?.balance || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Demo Balance:</span>
                    <span className="font-medium">${(profile?.demo_balance || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">KYC Status:</span>
                    <Badge variant={profile?.kyc_status === 'approved' ? 'default' : 'destructive'}>
                      {profile?.kyc_status || 'pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            Withdrawal History
          </CardTitle>
          <CardDescription>
            Track your withdrawal requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No withdrawal requests yet.
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(withdrawal.status)}
                        <span className="font-medium">{withdrawal.currency}</span>
                      </div>
                      <Badge className={`${getStatusColor(withdrawal.status)} text-white`}>
                        {withdrawal.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {parseFloat(withdrawal.amount).toFixed(8)} {withdrawal.currency}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Wallet Address</p>
                      <p className="font-mono break-all">
                        {withdrawal.wallet_address}
                      </p>
                    </div>
                    
                    {withdrawal.admin_notes && (
                      <div>
                        <p className="text-muted-foreground">Admin Notes</p>
                        <p className="text-destructive">{withdrawal.admin_notes}</p>
                      </div>
                    )}
                  </div>

                  {withdrawal.processed_at && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        Processed on: {new Date(withdrawal.processed_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Withdrawals;