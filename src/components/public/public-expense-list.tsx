'use client';

import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import type { Budget, Expense } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";

interface PublicExpenseListProps {
    expenses: Expense[];
    budgets: Budget[];
}

export function PublicExpenseList({ expenses, budgets }: PublicExpenseListProps) {

  const getBudgetById = (id: string) => budgets.find(b => b.id === id);

  const sortedExpenses = useMemo(() => {
    return [...expenses]
      .filter(e => e.status === 'Approved')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);


  return (
    <Card>
        <CardHeader>
            <CardTitle>Approved Expenses</CardTitle>
            <CardDescription>All publicly visible expenses that have been approved.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-hidden rounded-md border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedExpenses.length > 0 ? (
                    sortedExpenses.map((expense) => {
                        const budget = getBudgetById(expense.budgetId);
                        return (
                        <TableRow
                            key={expense.id}
                        >
                            <TableCell className="font-medium">{expense.title}</TableCell>
                            <TableCell>{budget?.department || 'N/A'}</TableCell>
                            <TableCell>{expense.vendor}</TableCell>
                            <TableCell className="text-right">
                            {formatCurrency(expense.amount)}
                            </TableCell>
                            <TableCell>
                            {new Date(expense.date).toLocaleDateString()}
                            </TableCell>
                        </TableRow>
                        );
                    })
                    ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                        No approved expenses to display.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
