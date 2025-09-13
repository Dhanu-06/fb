'use client';

import { useClarity } from '@/context/clarity-provider';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Landmark, PiggyBank } from 'lucide-react';
import { useMemo } from 'react';

export function StatsCards() {
  const { budgets, expenses } = useClarity();

  const { totalBudget, totalSpent, remaining } = useMemo(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.allocated, 0);
    const totalSpent = expenses
      .filter((e) => e.status === 'Approved')
      .reduce((sum, e) => sum + e.amount, 0);
    const remaining = totalBudget - totalSpent;
    return { totalBudget, totalSpent, remaining };
  }, [budgets, expenses]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
          <p className="text-xs text-muted-foreground">
            Total funds allocated across all departments.
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
            Total approved expenses.
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
            Total budget minus spent funds.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
