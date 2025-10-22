import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Loader2, Users } from 'lucide-react';

const AdminReferrals = () => {
  const [referralData, setReferralData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, []);

  useEffect(() => {
    filterData();
  }, [referralData, searchTerm]);

  const fetchReferralData = async () => {
    setLoading(true);
    
    // Fetch all users with their referral stats
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, email, referral_code');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      setLoading(false);
      return;
    }

    // Fetch all referrals
    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select('*');

    if (referralsError) {
      console.error('Error fetching referrals:', referralsError);
      setLoading(false);
      return;
    }

    // Combine data
    const combinedData = profiles?.map(profile => {
      const userReferrals = referrals?.filter(ref => ref.referrer_id === profile.user_id) || [];
      const totalBonus = userReferrals.reduce((sum, ref) => sum + parseFloat(ref.bonus_earned?.toString() || '0'), 0);
      
      return {
        ...profile,
        totalReferrals: userReferrals.length,
        totalBonus,
        referrals: userReferrals
      };
    }) || [];

    // Sort by total referrals (descending)
    combinedData.sort((a, b) => b.totalReferrals - a.totalReferrals);

    setReferralData(combinedData);
    setLoading(false);
  };

  const filterData = () => {
    if (!searchTerm) {
      setFilteredData(referralData);
      return;
    }

    const filtered = referralData.filter(user =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.referral_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredData(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Referral System Overview
        </CardTitle>
        <CardDescription>
          Track all user referrals and bonuses earned
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search by name, email, or referral code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Referral Code</TableHead>
                <TableHead className="text-center">Total Referrals</TableHead>
                <TableHead className="text-right">Total Bonuses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No referral data found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-xs">
                        {user.referral_code || 'N/A'}
                      </code>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                        {user.totalReferrals}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-success">
                      ${user.totalBonus.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminReferrals;