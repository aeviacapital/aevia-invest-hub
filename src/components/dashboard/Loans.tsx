import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { CreditCard, Plus } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface Loan {
  id: string;
  user_id: string;
  principal_amount: number;
  interest_rate: number;
  loan_term_days: number;
  repayment_schedule: string;
  loan_type: string;
  status: string;
  approved_at: string | null;
  created_at: string;
  due_date: string | null;
}

export const Loans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loanForm, setLoanForm] = useState({
    principal_amount: '',
    interest_rate: '',
    loan_term_days: '',
    repayment_schedule: '',
    loan_type: '',
    due_date: '',
    acceptedTerms: false
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchLoans();
  }, [user]);

  const fetchLoans = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch loans');
      return;
    }

    setLoans(data || []);
  };

  const handleInputChange = (key: string, value: string | boolean) => {
    setLoanForm({ ...loanForm, [key]: value });
  };

  const submitLoanRequest = async () => {
    if (!user) return;

    if (!loanForm.acceptedTerms) {
      toast.error('You must accept the Terms and Conditions.');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('loans').insert([
      {
        user_id: user.id,
        principal_amount: parseFloat(loanForm.principal_amount),
        interest_rate: parseFloat(loanForm.interest_rate),
        loan_term_days: parseInt(loanForm.loan_term_days),
        repayment_schedule: loanForm.repayment_schedule,
        loan_type: loanForm.loan_type,
        due_date: new Date(loanForm.due_date).toISOString(),
        status: 'pending',
      },
    ]);

    setIsSubmitting(false);
    setIsDialogOpen(false);

    if (error) {
      toast.error('Failed to submit loan request');
      return;
    }

    toast.success('Loan request submitted successfully');

    // 🔔 Notify admin of new loan request
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin'); // assuming you store admin roles

    if (admins && admins.length > 0) {
      for (const admin of admins) {
        await supabase.from('notifications').insert([
          {
            user_id: admin.id,
            title: 'New Loan Request',
            message: `${user.email || 'A user'} has requested a loan.`,
            type: 'loan_request',
            sent_by: user.id,
          },
        ]);
      }
    }

    setLoanForm({
      principal_amount: '',
      interest_rate: '',
      loan_term_days: '',
      repayment_schedule: '',
      loan_type: '',
      due_date: '',
      acceptedTerms: false,
    });

    fetchLoans();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      active: "default",
      completed: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const calculateProgress = (loan: Loan) => {
    if (!loan.approved_at || !loan.due_date) return 0;
    const start = new Date(loan.approved_at);
    const end = new Date(loan.due_date);
    const totalDays = differenceInDays(end, start);
    const elapsed = differenceInDays(new Date(), start);
    return Math.min((elapsed / totalDays) * 100, 100);
  };

  return (
    <div className="space-y-8">
      <Card className="p-4">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">My Loans</h2>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0">
                <Plus className="h-4 w-4 mr-1" />
                Request Loan
              </Button>
            </DialogTrigger>
<DialogContent className="max-h-[85vh] overflow-y-auto">
  <DialogHeader>
    <DialogTitle>Request a Loan</DialogTitle>
    <DialogDescription>
      Fill out the details below to apply for a loan and set your preferred due date.  
      You must agree to the loan Terms and Conditions before submitting.
    </DialogDescription>
  </DialogHeader>

  {/* Scrollable body */}
  <div className="space-y-4 mt-4 pb-6">
    <div>
      <Label>Principal Amount ($)</Label>
      <Input
        type="number"
        value={loanForm.principal_amount}
        onChange={(e) => handleInputChange('principal_amount', e.target.value)}
      />
    </div>

    <div>
      <Label>Interest Rate (%)</Label>
      <Input
        type="number"
        value={loanForm.interest_rate}
        onChange={(e) => handleInputChange('interest_rate', e.target.value)}
      />
    </div>

    <div>
      <Label>Loan Term (Days)</Label>
      <Input
        type="number"
        value={loanForm.loan_term_days}
        onChange={(e) => handleInputChange('loan_term_days', e.target.value)}
      />
    </div>

    <div>
      <Label>Repayment Schedule</Label>
      <Input
        value={loanForm.repayment_schedule}
        onChange={(e) => handleInputChange('repayment_schedule', e.target.value)}
        placeholder="e.g. daily, weekly"
      />
    </div>

    <div>
      <Label>Loan Type</Label>
      <Input
        value={loanForm.loan_type}
        onChange={(e) => handleInputChange('loan_type', e.target.value)}
      />
    </div>

    <div>
      <Label>Due Date</Label>
      <Input
        type="date"
        value={loanForm.due_date}
        onChange={(e) => handleInputChange('due_date', e.target.value)}
      />
    </div>

    <div className="flex items-center gap-2 mt-3">
      <Checkbox
        checked={loanForm.acceptedTerms}
        onCheckedChange={(checked) => handleInputChange('acceptedTerms', checked)}
      />
      <Label>I accept the Terms and Conditions of this loan</Label>
    </div>
  </div>

  <DialogFooter className="border-t pt-4 sticky bottom-0 bg-background">
    <Button onClick={submitLoanRequest} disabled={isSubmitting} className="w-full">
      {isSubmitting ? 'Submitting...' : 'Submit Request'}
    </Button>
  </DialogFooter>
</DialogContent>
            
            </Dialog>
        </CardHeader>

        <CardContent>
          {loans.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No loans found</p>
          ) : (
            loans.map((loan) => (
              <div key={loan.id} className="mb-4">
                <div className="flex justify-between">
                  <span>
                    Due: {loan.due_date ? format(new Date(loan.due_date), 'MMM dd, yyyy') : 'Not set'}
                  </span>
                  <span>{getStatusBadge(loan.status)}</span>
                </div>
                <Progress value={calculateProgress(loan)} className="mt-2" />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Loan History */}
      <Card>
        <CardHeader>
          <CardTitle>Loan History</CardTitle>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No loans found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>{loan.loan_type}</TableCell>
                    <TableCell>${loan.principal_amount.toLocaleString()}</TableCell>
                    <TableCell>{loan.interest_rate}%</TableCell>
                    <TableCell>{loan.loan_term_months} months</TableCell>
                    <TableCell>{loan.repayment_schedule}</TableCell>
                    <TableCell>{getStatusBadge(loan.status)}</TableCell>
                    <TableCell>
                      {new Date(loan.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
};

