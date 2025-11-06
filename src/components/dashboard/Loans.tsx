import React, { useState, useEffect, useCallback } from 'react';
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
// Removed Select imports
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { CreditCard, Plus, FileText, User, Briefcase } from 'lucide-react'; // Added User and Briefcase icons
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils'; // Assuming you have a utility for combining classes

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

// ⚙️ Configuration for different loan types
const LOAN_CONFIG = {
  PERSONAL: {
    key: 'PERSONAL',
    label: 'Personal Loan',
    icon: User,
    interestRate: 3.0, // 3.0% annual interest example
    termsUrl: '/documents/personal_loan_terms.pdf', // Placeholder URL
  },
  BUSINESS: {
    key: 'BUSINESS',
    label: 'Business Loan',
    icon: Briefcase,
    interestRate: 5.0, // 5.0% annual interest example
    termsUrl: '/documents/business_loan_terms.pdf', // Placeholder URL
  },
};

export const Loans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loanForm, setLoanForm] = useState({
    principal_amount: '',
    loan_term_days: '',
    repayment_schedule: '',
    loan_type: 'PERSONAL', // Default to PERSONAL
    due_date: '',
    acceptedTerms: false,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  
  const currentInterestRate = LOAN_CONFIG[loanForm.loan_type as keyof typeof LOAN_CONFIG]?.interestRate || 0;

  useEffect(() => {
    if (user) fetchLoans();
  }, [user]);

  const fetchLoans = useCallback(async () => {
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
  }, [user]);

  const handleInputChange = (key: string, value: string | boolean) => {
    setLoanForm((prevForm) => ({ ...prevForm, [key]: value }));
  };

  const handleLoanTypeChange = (value: string) => {
    // Reset terms acceptance when changing loan type, since terms might change
    setLoanForm((prevForm) => ({
      ...prevForm,
      loan_type: value,
      acceptedTerms: false, 
    }));
  };
const submitLoanRequest = async () => {
  if (!user) return;

  // 🔒 Validation Check
  if (
    !loanForm.principal_amount ||
    !loanForm.loan_term_days ||
    !loanForm.due_date ||
    !loanForm.loan_type
  ) {
    toast.error("Please fill in all required fields.");
    return;
  }

  if (!loanForm.acceptedTerms) {
    toast.error("You must accept the Terms and Conditions.");
    return;
  }

  setIsSubmitting(true);

  try {
    // 1️⃣ Insert loan request
    const { data, error } = await supabase
      .from("loans")
      .insert([
        {
          user_id: user.id,
          principal_amount: parseFloat(loanForm.principal_amount),
          interest_rate: currentInterestRate,
          loan_term_days: parseInt(loanForm.loan_term_days),
          repayment_schedule: loanForm.repayment_schedule,
          loan_type: loanForm.loan_type,
          due_date: new Date(loanForm.due_date).toISOString(),
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // 2️⃣ Send email + in-app notification through Edge Function
    await fetch(
      "https://niwhcvzhvjqrqhyayarv.supabase.co/functions/v1/send-notification",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "loan_pending",                // ✅ new type
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          amount: loanForm.principal_amount,
          user_id: user.id,
        }),
      }
    );

    // 3️⃣ Toast Success
    toast.success("Loan request submitted successfully");

    // 4️⃣ Reset form
    setLoanForm({
      principal_amount: "",
      loan_term_days: "",
      repayment_schedule: "",
      loan_type: "PERSONAL",
      due_date: "",
      acceptedTerms: false,
    });

    fetchLoans();
    setIsDialogOpen(false);
  } catch (err: any) {
    console.error("Submission error:", err);
    toast.error("Failed to submit loan request");
  } finally {
    setIsSubmitting(false);
  }
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

  // 📝 Component for viewing the Terms & Conditions
  const TermsAndConditionsDialog = ({ loanType }: { loanType: string }) => {
    const config = LOAN_CONFIG[loanType as keyof typeof LOAN_CONFIG];
    
    // Safety check
    if (!config) return null;

    return (
      <Dialog open={isTermsDialogOpen} onOpenChange={setIsTermsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{config.label} Terms and Conditions</DialogTitle>
            <DialogDescription>
              Please review the binding terms for your selected loan type.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto p-4 border rounded-md">
            {/* ⚠️ IMPORTANT: In a real app, you would fetch and render the actual content here. */}
            <p className="font-semibold text-lg">{config.label} Summary</p>
            <p>
              **Interest Rate:** {config.interestRate}% Annual Percentage Rate (APR).
            </p>
            <p>
              **Repayment:** All principal and accrued interest must be repaid by the stipulated due date. Late payments will incur a 1% daily penalty on the outstanding balance.
            </p>
            <p>
              **Collateral:** [Specifics for this loan type, e.g., Unsecured Personal Loan or Business Asset Collateral].
            </p>
            <p className="font-semibold mt-4">Full Document Access</p>
            <Button asChild variant="outline">
              <a href={config.termsUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-2" /> View Full PDF Document
              </a>
            </Button>
            
            <p className="mt-4 text-xs text-muted-foreground">
              By accepting, you agree to these terms. Failure to comply may result in legal action or default reporting.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsTermsDialogOpen(false)}>Close and Return</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
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
                  Select your loan type and fill out the details below to apply.
                </DialogDescription>
              </DialogHeader>

              {/* Scrollable body */}
              <div className="space-y-4 mt-4 pb-6">
                
                {/* 1. Loan Type Selection Grid (NEW STRUCTURE) */}
                <div>
                  <Label className="mb-2 block">Select Loan Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.values(LOAN_CONFIG).map((loan) => {
                      const Icon = loan.icon;
                      const isSelected = loanForm.loan_type === loan.key;
                      return (
                        <div
                          key={loan.key}
                          className={cn(
                            "flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all",
                            "hover:bg-accent hover:text-accent-foreground",
                            isSelected 
                              ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]"
                              : "border-gray-200 dark:border-gray-700 bg-muted/20"
                          )}
                          onClick={() => handleLoanTypeChange(loan.key)}
                        >
                          <Icon className="h-6 w-6 mb-2" />
                          <span className="font-semibold text-sm text-center">{loan.label}</span>
                          <span className="text-xs opacity-70 mt-1">
                            {loan.interestRate}% APR
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* 2. Dynamic Interest Rate Display (Retained) */}
                <div className="flex justify-between items-center p-3 border rounded-md bg-secondary/20">
                    <Label>Applicable Interest Rate (APR)</Label>
                    <Badge className="text-base font-semibold py-1">
                        {currentInterestRate}%
                    </Badge>
                </div>

                <div>
                  <Label>Principal Amount ($)</Label>
                  <Input
                    type="number"
                    value={loanForm.principal_amount}
                    onChange={(e) => handleInputChange('principal_amount', e.target.value)}
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
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={loanForm.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                  />
                </div>

                {/* 3. Terms & Conditions Checkbox and View Button (Retained) */}
                <div className="flex flex-col gap-2 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="accept-terms"
                      checked={loanForm.acceptedTerms}
                      onCheckedChange={(checked) => handleInputChange('acceptedTerms', checked)}
                    />
                    <Label htmlFor="accept-terms">
                      I have read and accept the Terms and Conditions
                    </Label>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="w-fit p-0 text-left"
                    onClick={() => setIsTermsDialogOpen(true)}
                  >
                    <FileText className="h-4 w-4 mr-1" /> View Terms and Conditions
                  </Button>
                </div>
              </div>

              <DialogFooter className="border-t pt-4 sticky bottom-0 bg-background">
                <Button onClick={submitLoanRequest} disabled={isSubmitting || !loanForm.acceptedTerms} className="w-full">
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogFooter>
            </DialogContent>
            {/* Render the T&C dialog */}
            <TermsAndConditionsDialog loanType={loanForm.loan_type} /> 
          </Dialog>
        </CardHeader>

        <CardContent>
          {/* Loan progress display (unchanged) */}
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

      {/* Loan History (unchanged) */}
      <Card>
        <CardHeader>
          <CardTitle>Loan History</CardTitle>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No loans found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Interest Rate</TableHead>
                    <TableHead>Term (Days)</TableHead>
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
                      <TableCell>{loan.loan_term_days} days</TableCell>
                      <TableCell>{loan.repayment_schedule}</TableCell>
                      <TableCell>{getStatusBadge(loan.status)}</TableCell>
                      <TableCell>
                        {new Date(loan.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
