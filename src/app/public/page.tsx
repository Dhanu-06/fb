'use client';
import { useClarity } from '@/context/clarity-provider';
import { PublicLayout } from './layout';
import { StatsCards } from '@/components/dashboard/overview/stats-cards';
import { BudgetSummaryChart } from '@/components/dashboard/overview/budget-summary-chart';
import { PublicBudgetList } from './_components/public-budget-list';
import { PublicExpenseList } from './_components/public-expense-list';
import { DEPARTMENTS } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PublicPage() {
  const { publicData } = useClarity();
  const { institutions, budgets, expenses, isLoading, error } = publicData;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading Public Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-destructive">
          <p className="text-lg font-semibold">Could not download public data.</p>
          <p className="text-sm">Please ensure Firestore rules are set up correctly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className='text-center'>
        <h1 className="text-3xl font-bold">Public Transparency Dashboard</h1>
        <p className="text-muted-foreground">
          A clear view into our institution&apos;s financial activities.
        </p>
      </div>

      <StatsCards budgets={budgets} expenses={expenses} />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <BudgetSummaryChart budgets={budgets} expenses={expenses} departments={DEPARTMENTS} />
        
        <Card>
            <CardHeader>
                <CardTitle>About This Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    This dashboard provides a real-time, transparent view of fund allocation and expenditures for {institutions[0]?.name || 'our institution'}. All data is sourced directly from our financial records and is updated as expenses are approved. We believe in open accountability and welcome feedback from our community.
                </p>
            </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Budget Overview</h2>
        <PublicBudgetList budgets={budgets} expenses={expenses} />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Approved Expenses</h2>
        <PublicExpenseList budgets={budgets} expenses={expenses} />
      </div>

    </div>
  );
}
