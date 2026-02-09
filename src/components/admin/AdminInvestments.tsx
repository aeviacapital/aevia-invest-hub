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
import { Search, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export const AdminInvestments = () => {
  const [investments, setInvestments] = useState<any[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [settling, setSettling] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchInvestments();
  }, []);

  useEffect(() => {
    filterInvestments();
  }, [investments, searchTerm, statusFilter]);

  const fetchInvestments = async () => {
    try {
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('user_investments')
        .select('*')
        .eq("status", "active")
        .order('created_at', { ascending: false });

      if (investmentsError) throw investmentsError;

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email');

      const { data: plansData } = await supabase
        .from('investment_plans')
        .select('id, title, investment_type');

      const combined = investmentsData?.map(inv => ({
        ...inv,
        profiles: profilesData?.find(p => p.user_id === inv.user_id),
        investment_plans: plansData?.find(p => p.id === inv.plan_id)
      })) || [];

      setInvestments(combined);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch investments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterInvestments = () => {
    let filtered = investments;

    if (searchTerm) {
      filtered = filtered.filter(inv =>
        inv.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.investment_plans?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    setFilteredInvestments(filtered);
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  // 🔥 ADMIN SETTLEMENT CALL
  const settleInvestments = async () => {
    setSettling("processing");

    try {
      const res = await fetch(
        "https://niwhcvzhvjqrqhyayarv.supabase.co/functions/v1/quick-function",
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Settlement failed");

      toast({
        title: "Settlement Completed",
        description: "All matured investments have been paid.",
      });

      await fetchInvestments();

    } catch (error: any) {
      toast({
        title: "Settlement Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSettling(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center h-64 items-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Investment Management
          </CardTitle>
        </CardHeader>

        <CardContent>

          {/* GLOBAL SETTLE BUTTON */}
          <div className="flex justify-end mb-4">
            <Button onClick={settleInvestments} disabled={!!settling}>
              {settling ? "Processing..." : "Run Settlement"}
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredInvestments.map(inv => {
                  const progress = inv.end_date
                    ? calculateProgress(inv.start_date, inv.end_date)
                    : 0;

                  return (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <div className="font-medium">{inv.profiles?.full_name}</div>
                        <div className="text-sm text-muted-foreground">{inv.profiles?.email}</div>
                      </TableCell>

                      <TableCell>{inv.investment_plans?.title}</TableCell>

                      <TableCell>${Number(inv.amount).toFixed(2)}</TableCell>

                      <TableCell>
                        <Badge>{inv.status}</Badge>
                      </TableCell>

                      <TableCell>
                        {inv.status === "active" && progress >= 100 ? (
                          <Button size="sm" onClick={settleInvestments}>
                            Settle
                          </Button>
                        ) : (
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                      </TableCell>

                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

