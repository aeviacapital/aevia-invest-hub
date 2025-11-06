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
    // 1️⃣ Insert deposit record into Supabase
    const { data, error } = await supabase
      .from("deposits")
      .insert({
        user_id: user.id,
        currency: depositForm.currency,
        amount: depositForm.amount,
        wallet_address:
          walletAddresses[depositForm.currency as keyof typeof walletAddresses],
        transaction_hash: depositForm.transactionHash || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    // Build the payload (ONLY plain serializable values)
    const payload = {
      type: "deposit",
      email: user.email,
      name: (user.user_metadata && user.user_metadata.full_name) || user.email,
      amount: Number(depositForm.amount),
      user_id: user.id,
      sent_by: "system", 
      action_link: "/dashboard",
    };

    // Log payload (open browser console and inspect)
    console.log("send-notification payload:", payload);

    // 2️⃣ Call Edge Function
    const res = await fetch(
      "https://niwhcvzhvjqrqhyayarv.supabase.co/functions/v1/send-notification",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      }
    );

    // Dump response for debug
    const text = await res.text();
    console.log("send-notification response status:", res.status);
    console.log("send-notification response body:", text);

    if (!res.ok) {
      // show a helpful error to user and also to console
      throw new Error(`Notification function failed (${res.status}): ${text}`);
    }

    // 3️⃣ Show success toast
    toast({
      title: "Deposit Submitted",
      description: `Your ${depositForm.currency} deposit of ${depositForm.amount} has been submitted for processing.`,
    });

    // 4️⃣ Refresh deposits + reset form
    fetchDeposits();
    setDepositForm({
      currency: "BTC",
      amount: 0,
      transactionHash: "",
    });
  } catch (error: any) {
    console.error("handleDeposit error:", error);
    toast({
      title: "Error",
      description: error?.message || "Something went wrong",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
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
<Card className="card-glass w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
  <CardHeader className="space-y-1 text-center sm:text-left">
    <CardTitle className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-start justify-center gap-2">
      <div className="flex items-center gap-2">
        <Wallet className="w-5 h-5 text-primary" />
        <span>Deposit History</span>
      </div>
    </CardTitle>
    <CardDescription className="text-sm text-muted-foreground">
      Track your deposit transactions
    </CardDescription>
  </CardHeader>

  <CardContent>
    {deposits.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
        <Wallet className="h-8 w-8 mb-3 opacity-60" />
        <p>No deposits yet. Make your first deposit above.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {deposits.map((deposit) => (
          <div
            key={deposit.id}
            className="border rounded-xl p-4 sm:p-6 bg-card/50 hover:bg-accent/10 transition-colors shadow-sm flex flex-col justify-between"
          >
            {/* Header: Currency, Status, Amount */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(deposit.status)}
                  <span className="font-semibold">{deposit.currency}</span>
                </div>
                <Badge
                  className={`${getStatusColor(deposit.status)} text-white text-xs sm:text-sm`}
                >
                  {deposit.status}
                </Badge>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg sm:text-xl">
                  {parseFloat(deposit.amount).toFixed(8)} {deposit.currency}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {new Date(deposit.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Wallet Address</p>
                <p className="font-mono break-all text-xs sm:text-sm">
                  {deposit.wallet_address}
                </p>
              </div>
              {deposit.transaction_hash && (
                <div>
                  <p className="text-muted-foreground mb-1">Transaction Hash</p>
                  <p className="font-mono break-all text-xs sm:text-sm">
                    {deposit.transaction_hash}
                  </p>
                </div>
              )}
            </div>

            {/* Confirmation Timestamp */}
            {deposit.confirmed_at && (
              <div className="mt-4 pt-3 border-t border-muted">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Confirmed on:{' '}
                  <span className="font-medium">
                    {new Date(deposit.confirmed_at).toLocaleString()}
                  </span>
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
