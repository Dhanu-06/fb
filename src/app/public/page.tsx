
'use client';

import { useClarity } from '@/context/clarity-provider';
import { StatsCards } from '@/components/dashboard/overview/stats-cards';
import { BudgetSummaryChart } from '@/components/dashboard/overview/budget-summary-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { ArrowRight } from 'lucide-react';

export default function PublicDashboardPage() {
  const { publicData, departments } = useClarity();
  const { institutions, budgets, expenses, isLoading, error } = publicData;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
         <div className="text-center">
            <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading Public Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-destructive">Could not load public data. Please try again later.</div>;
  }
  
  const institution = institutions[0];

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <Logo />
            <nav className="flex items-center gap-4">
                <Button asChild>
                <Link href="/login">
                    Admin Login <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                </Button>
                <ThemeToggle />
            </nav>
            </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    Public Transparency Dashboard
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    An open view into the finances of {institution?.name || 'our institution'}.
                </p>
            </div>

            <div className="mb-8">
                <StatsCards budgets={budgets} expenses={expenses} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
                <div className="lg:col-span-3">
                    <BudgetSummaryChart budgets={budgets} expenses={expenses} departments={departments} />
                </div>
                <div className="lg:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle>Recent Approved Expenses</CardTitle>
                            <CardDescription>A look at the most recent public expenditures.</CardDescription>
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
                                    {expenses.slice(0, 5).map(expense => (
                                        <TableRow key={expense.id}>
                                            <TableCell className="font-medium">{expense.title}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle>All Approved Expenses</CardTitle>
                        <CardDescription>A complete list of all publicly approved expenses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Expense</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell className="font-medium">{expense.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{expense.category}</Badge>
                                        </TableCell>
                                        <TableCell>{expense.vendor}</TableCell>
                                        <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
       <footer className="bg-muted py-8 mt-8">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ClarityLedger. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
