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
import { Search, TrendingUp, Plus } from 'lucide-react';
import { format } from 'date-fns';

export const AdminInvestments = () => {
  const [investments, setInvestments] = useState<any[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvestments();
  }, []);

  useEffect(() => {
    filterInvestments();
  }, [investments, searchTerm, statusFilter]);

  const fetchInvestments = async () => {
    try {
      // Fetch investments
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('user_investments')
        .select('*')
        .order('created_at', { ascending: false });

      if (investmentsError) throw investmentsError;

      // Fetch profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email');

      if (profilesError) throw profilesError;

      // Fetch investment plans separately
      const { data: plansData, error: plansError } = await supabase
        .from('investment_plans')
        .select('id, title, investment_type');

      if (plansError) throw plansError;

      // Combine the data
      const investmentsWithDetails = investmentsData?.map(investment => ({
        ...investment,
        profiles: profilesData?.find(profile => profile.user_id === investment.user_id),
        investment_plans: plansData?.find(plan => plan.id === investment.plan_id)
      })) || [];

      setInvestments(investmentsWithDetails);
    } catch (error) {
      console.error('Error fetching investments:', error);
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
      filtered = filtered.filter(
        (investment) =>
          investment.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          investment.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          investment.investment_plans?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((investment) => investment.status === statusFilter);
    }

    setFilteredInvestments(filtered);
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search investments..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Investments Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Returns Earned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvestments.map((investment) => (
                  <TableRow key={investment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{investment.profiles?.full_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {investment.profiles?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{investment.investment_plans?.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {investment.investment_plans?.investment_type}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${investment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-medium text-success">
                      ${investment.returns_earned.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          investment.status === 'active'
                            ? 'default'
                            : investment.status === 'completed'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {investment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(investment.start_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {investment.end_date 
                        ? format(new Date(investment.end_date), 'MMM dd, yyyy')
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      {investment.end_date && investment.status === 'active' ? (
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{
                              width: `${calculateProgress(investment.start_date, investment.end_date)}%`
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {investment.status}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredInvestments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No investments found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};