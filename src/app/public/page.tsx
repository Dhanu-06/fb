'use client';

import { useClarity } from '@/context/clarity-provider';
import { Loader2 } from 'lucide-react';
import { StatsCards } from '@/components/dashboard/overview/stats-cards';
import { BudgetSummaryChart } from '@/components/dashboard/overview/budget-summary-chart';
import { PublicBudgetList } from './_components/public-budget-list';
import { PublicExpenseList } from './_components/public-expense-list';
import { DEPARTMENTS } from '@/lib/types';

export default function PublicDashboardPage() {
  const { publicData, currency, exchangeRate } = useClarity();
  const { institutions, budgets, expenses, isLoading, error } = publicData;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading Public Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-center">
        <div>
            <h2 className="text-2xl font-semibold text-destructive">Could not download public data</h2>
            <p className="text-muted-foreground mt-2">There was an issue connecting to the database. Please try again later.</p>
        </div>
      </div>
    );
  }

   if (budgets.length === 0 && expenses.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-semibold">No Public Data Available</h2>
          <p className="text-muted-foreground mt-2">This institution has not published any financial data yet.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Public Financial Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Financial transparency for {institutions[0]?.name || 'our institution'}.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <StatsCards budgets={budgets} expenses={expenses} currency={currency} exchangeRate={exchangeRate} />
        
        <div className="grid gap-6 md:grid-cols-5">
            <div className="md:col-span-3">
                <BudgetSummaryChart budgets={budgets} expenses={expenses} departments={DEPARTMENTS} currency={currency} exchangeRate={exchangeRate} />
            </div>
            <div className="md:col-span-2">
                 <PublicBudgetList budgets={budgets} expenses={expenses} currency={currency} exchangeRate={exchangeRate} />
            </div>
        </div>

        <div>
            <PublicExpenseList expenses={expenses} budgets={budgets} currency={currency} exchangeRate={exchangeRate} />
        </div>

      </div>
    </div>
  );
}
