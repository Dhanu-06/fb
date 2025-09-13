
'use client';

import type { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMemo } from 'react';

export function PublicExpenseList({ expenses, getBudgetById }: { expenses: Expense[], getBudgetById: (id: string) => any }) {
  
  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [expenses]);

  return (
     <Card>
      <CardHeader>
        <CardTitle>Recent Approved Expenses</CardTitle>
        <CardDescription>
            A look at the latest approved expenses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentExpenses.length > 0 ? recentExpenses.map((expense) => {
               const budget = getBudgetById(expense.budgetId);
               return (
                <TableRow key={expense.id}>
                  <TableCell>
                     <p className="font-medium">{expense.title}</p>
                     <p className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                  </TableCell>
                  <TableCell>{budget?.department || 'N/A'}</TableCell>
                  <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                </TableRow>
               )
            }) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                    No approved expenses found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

