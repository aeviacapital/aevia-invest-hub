import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Copy, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';

const Deposits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [depositForm, setDepositForm] = useState({
    currency: 'BTC',
    amount: 0,
    transactionHash: ''
  });

  // Production wallet addresses
  const walletAddresses = {
    BTC: 'bc1qpg3mrcr4l5dussa0pjfw2prcrhyq9znfqwd9la',
    USDT: 'TYtHKd8YPfAYXssEsC2Ztn5yXdta57paJq',
    SOL: 'FtPMsBLFF1Z2zorehNuvoV9pL7HdQ2qPRbWNUnxCQ5qT'
  };

  useEffect(() => {
    fetchDeposits();
  }, [user]);

  const fetchDeposits = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setDeposits(data || []);
  };

  const handleInputChange = (field: string, value: any) => {
    setDepositForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeposit = async () => {
    if (!user || depositForm.amount <= 0) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          currency: depositForm.currency,
          amount: depositForm.amount,
          wallet_address: walletAddresses[depositForm.currency as keyof typeof walletAddresses],
          transaction_hash: depositForm.transactionHash || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Deposit Submitted',
        description: `Your ${depositForm.currency} deposit of ${depositForm.amount} has been submitted for processing.`,
      });

      fetchDeposits();
      setDepositForm({
        currency: 'BTC',
        amount: 0,
        transactionHash: ''
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Wallet address copied to clipboard',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'confirmed':
        return 'bg-success';
      case 'failed':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Deposit Form */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Make a Deposit
          </CardTitle>
          <CardDescription>
            Fund your account with cryptocurrency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={depositForm.currency} onValueChange={(value) => handleInputChange('currency', value)}>
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
                  placeholder="Enter amount"
                  value={depositForm.amount || ''}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Transaction Hash (Optional)</Label>
                <Input
                  type="text"
                  placeholder="Enter transaction hash after sending"
                  value={depositForm.transactionHash}
                  onChange={(e) => handleInputChange('transactionHash', e.target.value)}
                />
              </div>

              <Button 
                onClick={handleDeposit}
                disabled={isLoading || depositForm.amount <= 0}
                className="w-full btn-hero"
              >
                {isLoading ? 'Processing...' : 'Submit Deposit'}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/20">
                <h3 className="font-medium mb-2">Deposit Instructions</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>1. Copy the wallet address below</p>
                  <p>2. Send {depositForm.currency} to this address</p>
                  <p>3. Enter the transaction hash (optional)</p>
                  <p>4. Submit your deposit request</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium">{depositForm.currency} Wallet Address</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(walletAddresses[depositForm.currency as keyof typeof walletAddresses])}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="p-3 bg-muted rounded font-mono text-sm break-all">
                  {walletAddresses[depositForm.currency as keyof typeof walletAddresses]}
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-warning/10 border-warning/20">
                <h4 className="font-medium text-warning mb-1">Important Notice</h4>
                <p className="text-sm text-muted-foreground">
                  Only send {depositForm.currency} to this address. Sending other cryptocurrencies may result in permanent loss.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposit History */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            Deposit History
          </CardTitle>
          <CardDescription>
            Track your deposit transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deposits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No deposits yet. Make your first deposit above.
            </div>
          ) : (
            <div className="space-y-4">
              {deposits.map((deposit) => (
                <div key={deposit.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(deposit.status)}
                        <span className="font-medium">{deposit.currency}</span>
                      </div>
                      <Badge className={`${getStatusColor(deposit.status)} text-white`}>
                        {deposit.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {parseFloat(deposit.amount).toFixed(8)} {deposit.currency}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(deposit.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Wallet Address</p>
                      <p className="font-mono break-all">
                        {deposit.wallet_address}
                      </p>
                    </div>
                    {deposit.transaction_hash && (
                      <div>
                        <p className="text-muted-foreground">Transaction Hash</p>
                        <p className="font-mono break-all">
                          {deposit.transaction_hash}
                        </p>
                      </div>
                    )}
                  </div>

                  {deposit.confirmed_at && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        Confirmed on: {new Date(deposit.confirmed_at).toLocaleString()}
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

export default Deposits;
