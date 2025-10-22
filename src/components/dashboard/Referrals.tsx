import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Copy, Users, DollarSign, TrendingUp } from 'lucide-react';

const Referrals = () => {
  const { user, profile } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalBonus: 0
  });
  const [referralsList, setReferralsList] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.referral_code) {
      setReferralCode(profile.referral_code);
    }
    fetchReferralStats();
  }, [profile]);

  const fetchReferralStats = async () => {
    if (!user) return;

    const { data: referrals, error } = await supabase
      .from('referrals')
      .select('*, referred:referred_id(full_name, email)')
      .eq('referrer_id', user.id);

    if (error) {
      console.error('Error fetching referrals:', error);
      return;
    }

    if (referrals) {
      setReferralsList(referrals);
      const totalBonus = referrals.reduce((sum, ref) => sum + parseFloat(ref.bonus_earned?.toString() || '0'), 0);
      setReferralStats({
        totalReferrals: referrals.length,
        totalBonus
      });
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Referral Code</CardTitle>
            <Copy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{referralCode || 'Loading...'}</div>
            <p className="text-xs text-muted-foreground">Share with friends</p>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{referralStats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">Successful referrals</p>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bonuses</CardTitle>
            <DollarSign className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">${referralStats.totalBonus.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Earned from referrals</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link Section */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Share Your Referral Link</CardTitle>
          <CardDescription>
            Invite friends and earn 10% bonus on their first investment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={`${window.location.origin}/auth?ref=${referralCode}`}
              readOnly
              className="flex-1"
            />
            <Button onClick={copyReferralLink}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              value={referralCode}
              readOnly
              className="flex-1"
            />
            <Button onClick={copyReferralCode} variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              Copy Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
          <CardDescription>
            People who joined using your referral code
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referralsList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No referrals yet. Start sharing your link!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referralsList.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{referral.referred?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{referral.referred?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-success">+${parseFloat(referral.bonus_earned?.toString() || '0').toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {referral.first_investment_made ? 'Bonus earned' : 'Pending investment'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Referrals;