'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { Expense, Budget } from '@/lib/types';

interface PublicExpenseListProps {
  expenses: Expense[];
  budgets: Budget[];
}

export function PublicExpenseList({ expenses, budgets }: PublicExpenseListProps) {
    
  const getBudgetById = (budgetId: string) => budgets.find(b => b.id === budgetId);

  const approvedExpenses = expenses
    .filter(e => e.status === 'Approved')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvedExpenses.length > 0 ? (
            approvedExpenses.map((expense) => {
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
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {expense.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(expense.date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No approved expenses found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
