'use client';
import { useState } from 'react';
import { useClarity } from '@/context/clarity-provider';
import type { Expense } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AuditTrail } from './audit-trail';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from 'lucide-react';


export function ExpenseDetails({ expense, onUpdate }: { expense: Expense; onUpdate: () => void }) {
  const { getBudgetById, getUserById, currentUser, updateExpenseStatus, getExpensesForBudget, currency, exchangeRate } = useClarity();
  const { toast } = useToast();
  
  const [comments, setComments] = useState('');
  const [showOverrunAlert, setShowOverrunAlert] = useState(false);
  
  const budget = getBudgetById(expense.budgetId);
  const submitter = getUserById(expense.submittedBy);

  const proceedWithApproval = () => {
     try {
      updateExpenseStatus(expense.id, 'Approved', comments || 'Approved');
      toast({
        title: `Expense Approved`,
        description: `The expense "${expense.title}" has been approved.`
      });
      setComments('');
      onUpdate();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  }

  const handleStatusUpdate = (status: 'Approved' | 'Rejected') => {
    if (status === 'Rejected') {
      if (!comments) {
        toast({
          title: 'Comment Required',
          description: 'Please provide a comment before rejecting an expense.',
          variant: 'destructive',
        });
        return;
      }
      try {
        updateExpenseStatus(expense.id, 'Rejected', comments);
        toast({
          title: `Expense Rejected`,
          description: `The expense "${expense.title}" has been rejected.`
        });
        setComments('');
        onUpdate();
      } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
      return;
    }

    // Anomaly Detection for Approval
    if (status === 'Approved' && budget) {
        const approvedExpenses = getExpensesForBudget(budget.id).filter(e => e.status === 'Approved');
        const spentAmount = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
        const remainingBudget = budget.allocated - spentAmount;

        if (expense.amount > remainingBudget) {
            setShowOverrunAlert(true);
            return;
        }
    }

    proceedWithApproval();
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'secondary';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };
  
  const canReview = (currentUser?.role === 'Reviewer' || currentUser?.role === 'Admin') && expense.status === 'Submitted';

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle className="text-2xl">{expense.title}</CardTitle>
                    <CardDescription>Submitted by {submitter?.name} on {new Date(expense.date).toLocaleDateString()}</CardDescription>
                </div>
                <Badge variant={getStatusVariant(expense.status)} className="text-base px-3 py-1">{expense.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-semibold text-lg">{formatCurrency(expense.amount, currency, exchangeRate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Vendor</p>
                <p className="font-semibold">{expense.vendor}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-semibold">{expense.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Payment Mode</p>
                <p className="font-semibold">{expense.paymentMode}</p>
              </div>
               {expense.transactionReference && <div>
                <p className="text-muted-foreground">Transaction Ref.</p>
                <p className="font-semibold">{expense.transactionReference}</p>
              </div>}
              <div className="col-span-full">
                <p className="text-muted-foreground">Budget</p>
                <p className="font-semibold">{budget?.title} ({budget?.department})</p>
              </div>
            </div>
          </CardContent>
          {canReview && (
            <CardFooter className="flex flex-col items-start gap-4 border-t pt-6">
               <Label htmlFor="comments">Comments (Required for Rejection)</Label>
               <Textarea 
                id="comments"
                placeholder="Add comments for approval or rejection..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300" onClick={() => handleStatusUpdate('Approved')}>Approve</Button>
                <Button variant="destructive" onClick={() => handleStatusUpdate('Rejected')}>Reject</Button>
              </div>
            </CardFooter>
          )}
        </Card>
         <AuditTrail auditTrail={expense.auditTrail} />
      </div>

      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            {expense.receiptUrl ? (
                <Image 
                    src={expense.receiptUrl} 
                    alt={`Receipt for ${expense.title}`} 
                    width={400} 
                    height={600} 
                    className="rounded-md object-contain w-full"
                    data-ai-hint="receipt document"
                />
            ) : (
                <p className="text-muted-foreground">No receipt uploaded.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showOverrunAlert} onOpenChange={setShowOverrunAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive" />
                Budget Overrun Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              Approving this expense of <span className="font-bold">{formatCurrency(expense.amount, currency, exchangeRate)}</span> will exceed the remaining funds in the <span className="font-bold">&quot;{budget?.title}&quot;</span> budget. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={proceedWithApproval}>
                Confirm & Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
