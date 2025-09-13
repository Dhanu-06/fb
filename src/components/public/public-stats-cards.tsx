'use client';

import { useMemo } from 'react';
import type { Budget, Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Landmark, PiggyBank, FileCheck } from 'lucide-react';

interface PublicStatsCardsProps {
    budgets: Budget[];
    expenses: Expense[];
}

export function PublicStatsCards({ budgets, expenses }: PublicStatsCardsProps) {

  const { totalBudget, totalSpent, remaining, expenseCount } = useMemo(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.allocated, 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = totalBudget - totalSpent;
    return { totalBudget, totalSpent, remaining, expenseCount: expenses.length };
  }, [budgets, expenses]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Allocated Budget</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
          <p className="text-xs text-muted-foreground">
            Total funds allocated across all budgets.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          <p className="text-xs text-muted-foreground">
            Total of all approved expenses.
          </p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved Expenses</CardTitle>
          <FileCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{expenseCount}</div>
           <p className="text-xs text-muted-foreground">
            Number of transactions recorded.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Remaining Funds</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(remaining)}</div>
           <p className="text-xs text-muted-foreground">
            Available funds across all budgets.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
