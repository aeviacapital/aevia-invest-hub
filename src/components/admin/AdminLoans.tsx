import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, CheckCircle, XCircle } from 'lucide-react';

interface Loan {
  id: string;
  user_id: string;
  principal_amount: number;
  interest_rate: number;
  loan_term_months: number;
  repayment_schedule: string;
  collateral: string | null;
  credit_requirements: string | null;
  fees_charges: number;
  loan_agreement: string | null;
  loan_type: string;
  disbursement_details: string | null;
  default_terms: string | null;
  status: string;
  approved_at: string | null;
  created_at: string;
  profiles?: { email: string; full_name: string | null };
}

export const AdminLoans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [formData, setFormData] = useState({
    user_id: '',
    principal_amount: '',
    interest_rate: '',
    loan_term_months: '',
    repayment_schedule: '',
    collateral: '',
    credit_requirements: '',
    fees_charges: '',
    loan_agreement: '',
    loan_type: '',
    disbursement_details: '',
    default_terms: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchLoans();
    fetchUsers();
  }, []);

  const fetchLoans = async () => {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch loans');
      return;
    }

    // Fetch user profiles separately
    if (data && data.length > 0) {
      const userIds = data.map(loan => loan.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);

      const profileMap = new Map(profilesData?.map(p => [p.user_id, p]));
      const loansWithProfiles = data.map(loan => ({
        ...loan,
        profiles: profileMap.get(loan.user_id)
      }));
      setLoans(loansWithProfiles as Loan[]);
    } else {
      setLoans([]);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, email, full_name');

    if (error) {
      toast.error('Failed to fetch users');
      return;
    }
    setUsers(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loanData = {
      ...formData,
      principal_amount: parseFloat(formData.principal_amount),
      interest_rate: parseFloat(formData.interest_rate),
      loan_term_months: parseInt(formData.loan_term_months),
      fees_charges: parseFloat(formData.fees_charges) || 0,
    };

    if (editingLoan) {
      const { error } = await supabase
        .from('loans')
        .update(loanData)
        .eq('id', editingLoan.id);

      if (error) {
        toast.error('Failed to update loan');
        return;
      }
      toast.success('Loan updated successfully');
    } else {
      const { error } = await supabase.from('loans').insert([loanData]);

      if (error) {
        toast.error('Failed to create loan');
        return;
      }
      toast.success('Loan created successfully');
    }

    setIsDialogOpen(false);
    resetForm();
    fetchLoans();
  };

  const handleApprove = async (loanId: string) => {
    const { error } = await supabase
      .from('loans')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', loanId);

    if (error) {
      toast.error('Failed to approve loan');
      return;
    }
    toast.success('Loan approved');
    fetchLoans();
  };

  const handleReject = async (loanId: string) => {
    const { error } = await supabase
      .from('loans')
      .update({ status: 'rejected' })
      .eq('id', loanId);

    if (error) {
      toast.error('Failed to reject loan');
      return;
    }
    toast.success('Loan rejected');
    fetchLoans();
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      principal_amount: '',
      interest_rate: '',
      loan_term_months: '',
      repayment_schedule: '',
      collateral: '',
      credit_requirements: '',
      fees_charges: '',
      loan_agreement: '',
      loan_type: '',
      disbursement_details: '',
      default_terms: '',
      status: 'pending'
    });
    setEditingLoan(null);
  };

  const openEditDialog = (loan: Loan) => {
    setEditingLoan(loan);
    setFormData({
      user_id: loan.user_id,
      principal_amount: loan.principal_amount.toString(),
      interest_rate: loan.interest_rate.toString(),
      loan_term_months: loan.loan_term_months.toString(),
      repayment_schedule: loan.repayment_schedule,
      collateral: loan.collateral || '',
      credit_requirements: loan.credit_requirements || '',
      fees_charges: loan.fees_charges.toString(),
      loan_agreement: loan.loan_agreement || '',
      loan_type: loan.loan_type,
      disbursement_details: loan.disbursement_details || '',
      default_terms: loan.default_terms || '',
      status: loan.status
    });
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      active: "default"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Loan Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLoan ? 'Edit Loan' : 'Create New Loan'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>User</Label>
                  <Select value={formData.user_id} onValueChange={(value) => setFormData({ ...formData, user_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.email} ({user.full_name || 'No name'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Loan Type</Label>
                  <Input
                    required
                    value={formData.loan_type}
                    onChange={(e) => setFormData({ ...formData, loan_type: e.target.value })}
                    placeholder="e.g., Personal, Business, Mortgage"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Principal Amount ($)</Label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={formData.principal_amount}
                    onChange={(e) => setFormData({ ...formData, principal_amount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Interest Rate (%)</Label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Loan Term (Months)</Label>
                  <Input
                    required
                    type="number"
                    value={formData.loan_term_months}
                    onChange={(e) => setFormData({ ...formData, loan_term_months: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fees & Charges ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.fees_charges}
                    onChange={(e) => setFormData({ ...formData, fees_charges: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Repayment Schedule</Label>
                  <Input
                    required
                    value={formData.repayment_schedule}
                    onChange={(e) => setFormData({ ...formData, repayment_schedule: e.target.value })}
                    placeholder="e.g., Monthly, Weekly"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Collateral</Label>
                <Textarea
                  value={formData.collateral}
                  onChange={(e) => setFormData({ ...formData, collateral: e.target.value })}
                  placeholder="Describe collateral details"
                />
              </div>

              <div className="space-y-2">
                <Label>Credit Requirements</Label>
                <Textarea
                  value={formData.credit_requirements}
                  onChange={(e) => setFormData({ ...formData, credit_requirements: e.target.value })}
                  placeholder="Credit score, history requirements"
                />
              </div>

              <div className="space-y-2">
                <Label>Loan Agreement</Label>
                <Textarea
                  value={formData.loan_agreement}
                  onChange={(e) => setFormData({ ...formData, loan_agreement: e.target.value })}
                  placeholder="Agreement terms and conditions"
                />
              </div>

              <div className="space-y-2">
                <Label>Disbursement Details</Label>
                <Textarea
                  value={formData.disbursement_details}
                  onChange={(e) => setFormData({ ...formData, disbursement_details: e.target.value })}
                  placeholder="How and when funds will be disbursed"
                />
              </div>

              <div className="space-y-2">
                <Label>Default Terms</Label>
                <Textarea
                  value={formData.default_terms}
                  onChange={(e) => setFormData({ ...formData, default_terms: e.target.value })}
                  placeholder="Terms in case of default"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingLoan ? 'Update' : 'Create'} Loan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Interest Rate</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>
                    {loan.profiles?.email}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {loan.profiles?.full_name || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>{loan.loan_type}</TableCell>
                  <TableCell>${loan.principal_amount.toLocaleString()}</TableCell>
                  <TableCell>{loan.interest_rate}%</TableCell>
                  <TableCell>{loan.loan_term_months} months</TableCell>
                  <TableCell>{getStatusBadge(loan.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(loan)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {loan.status === 'pending' && (
                        <>
                          <Button size="sm" variant="default" onClick={() => handleApprove(loan.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(loan.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
