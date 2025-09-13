'use client';

import { useClarity } from '@/context/clarity-provider';
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
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function RecentExpenses() {
  const { expenses, getBudgetById, currency, exchangeRate } = useClarity();

  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [expenses]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'secondary';
      case 'Rejected':
        return 'destructive';
      case 'Submitted':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
     <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>
            A quick look at the latest submitted expenses.
          </CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/dashboard/expenses">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentExpenses.map((expense) => {
               const budget = getBudgetById(expense.budgetId);
               return (
                <TableRow key={expense.id}>
                  <TableCell>
                     <Link href={`/dashboard/expenses/${expense.id}`} className="font-medium hover:underline">
                      {expense.title}
                     </Link>
                  </TableCell>
                  <TableCell>{budget?.department || 'N/A'}</TableCell>
                  <TableCell className="text-right">{formatCurrency(expense.amount, currency, exchangeRate)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusVariant(expense.status)}>{expense.status}</Badge>
                  </TableCell>
                </TableRow>
               )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
