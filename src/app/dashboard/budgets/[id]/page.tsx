
'use client';
import { useClarity } from "@/context/clarity-provider";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export default function BudgetDetailPage() {
  const { id } = useParams();
  const { getBudgetById, getExpensesForBudget } = useClarity();
  const router = useRouter();

  const budget = getBudgetById(id as string);
  
  if (!budget) {
    return (
        <div className="text-center p-10">
            <p className="text-lg text-muted-foreground">Budget not found.</p>
        </div>
    );
  }

  const expenses = getExpensesForBudget(budget.id);
  const approvedExpenses = expenses.filter(e => e.status === 'Approved');
  const spent = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = budget.allocated - spent;
  const utilization = budget.allocated > 0 ? (spent / budget.allocated) * 100 : 0;
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'secondary';
      case 'Rejected': return 'destructive';
      case 'Submitted': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Budgets
            </Button>
        </div>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{budget.title}</CardTitle>
              <CardDescription>Department: {budget.department}</CardDescription>
            </div>
            <div className="text-right">
                <p className="text-3xl font-bold">{formatCurrency(budget.allocated)}</p>
                <p className="text-sm text-muted-foreground">Allocated</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
                 <div>
                    <p className="text-muted-foreground">Spent</p>
                    <p className="font-semibold text-lg">{formatCurrency(spent)}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Remaining</p>
                    <p className="font-semibold text-lg">{formatCurrency(remaining)}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Utilization</p>
                    <div className="flex items-center gap-2">
                       <Progress value={utilization} className="h-2 w-full" />
                       <span className="text-xs text-muted-foreground w-12 text-right">{utilization.toFixed(0)}%</span>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Associated Expenses</CardTitle>
          <CardDescription>All expenses submitted under this budget.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.length > 0 ? expenses.map(expense => (
                        <TableRow key={expense.id} onClick={() => router.push(`/dashboard/expenses/${expense.id}`)} className="cursor-pointer">
                            <TableCell className="font-medium">{expense.title}</TableCell>
                            <TableCell>{expense.vendor}</TableCell>
                            <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                            <TableCell><Badge variant={getStatusVariant(expense.status)}>{expense.status}</Badge></TableCell>
                            <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">No expenses found for this budget.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
