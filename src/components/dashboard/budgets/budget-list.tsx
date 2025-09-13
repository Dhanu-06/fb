'use client';

import { useClarity } from "@/context/clarity-provider";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export function BudgetList() {
  const { budgets, getExpensesForBudget } = useClarity();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%]">Title</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Spent / Allocated</TableHead>
          <TableHead className="w-[20%] text-center">Utilization</TableHead>
          <TableHead className="text-right">Remaining</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {budgets.map((budget) => {
          const expenses = getExpensesForBudget(budget.id).filter(e => e.status === 'Approved');
          const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
          const remaining = budget.allocated - spent;
          const utilization = budget.allocated > 0 ? (spent / budget.allocated) * 100 : 0;

          return (
            <TableRow key={budget.id}>
              <TableCell className="font-medium">{budget.title}</TableCell>
              <TableCell>{budget.department}</TableCell>
              <TableCell>
                <span className="font-medium">{formatCurrency(spent)}</span>
                <span className="text-muted-foreground"> / {formatCurrency(budget.allocated)}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                   <Progress value={utilization} className="h-2" />
                   <span className="text-xs text-muted-foreground w-12 text-right">{utilization.toFixed(0)}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(remaining)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
