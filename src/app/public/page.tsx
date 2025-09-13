'use client';

import { useClarity } from "@/context/clarity-provider";
import { StatsCards } from "@/components/dashboard/overview/stats-cards";
import { BudgetSummaryChart } from "@/components/dashboard/overview/budget-summary-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function PublicDashboardPage() {
  const { publicData, currency, exchangeRate } = useClarity();

  if (publicData.isLoading) {
    return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="text-center">
                <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Loading Public Data...</p>
            </div>
        </div>
    );
  }

  if (publicData.error) {
     return (
        <div className="text-center p-10">
            <h2 className="text-2xl font-semibold text-destructive">Failed to Load Data</h2>
            <p className="text-muted-foreground mt-2">There was an error fetching the public financial data. Please try again later.</p>
        </div>
    );
  }

  const { institutions, budgets, expenses } = publicData;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'secondary';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
       <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Public Transparency Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          An open view into the financial operations of {institutions[0]?.name || 'our institution'}.
        </p>
      </div>

      <StatsCards budgets={budgets} expenses={expenses} />
      
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
             <BudgetSummaryChart budgets={budgets} expenses={expenses} departments={DEPARTMENTS} />
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Approved Expenses</CardTitle>
                    <CardDescription>A list of the most recently approved expenses.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.slice(0,5).map(expense => (
                                <TableRow key={expense.id}>
                                    <TableCell>
                                        <div className="font-medium">{expense.title}</div>
                                        <div className="text-sm text-muted-foreground">{budgets.find(b => b.id === expense.budgetId)?.department}</div>
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(expense.amount, currency, exchangeRate)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </CardContent>
            </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>All Approved Expenses</CardTitle>
            <CardDescription>A complete log of all expenses that have been approved.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.map(expense => {
                        const budget = budgets.find(b => b.id === expense.budgetId);
                        return (
                             <TableRow key={expense.id}>
                                <TableCell className="font-medium">{expense.title}</TableCell>
                                <TableCell>{budget?.department}</TableCell>
                                <TableCell>{expense.vendor}</TableCell>
                                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                <TableCell><Badge variant={getStatusVariant(expense.status)}>{expense.status}</Badge></TableCell>
                                <TableCell className="text-right">{formatCurrency(expense.amount, currency, exchangeRate)}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
             </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Add DEPARTMENTS constant for use in the chart
const DEPARTMENTS = ["Library", "Sports", "Food", "Maintenance", "Lab", "Events", "Transport", "IT Services", "Student Welfare", "Administration", "Hostel", "Academics", "Research & Development", "Infrastructure & Construction"];
