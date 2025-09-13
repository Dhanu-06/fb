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
import { CreateBudgetDialog } from "./create-budget-dialog";
import { FeedbackDialog } from "./feedback-dialog";

export function BudgetList() {
  const { budgets, getExpensesForBudget, currentUser, currency, exchangeRate } = useClarity();

  return (
    <div>
        <div className="flex justify-end mb-4">
            {currentUser?.role === 'Admin' && <CreateBudgetDialog />}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Spent / Allocated</TableHead>
              <TableHead className="w-[15%] text-center">Utilization</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead className="w-[10%] text-center">Actions</TableHead>
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
                    <span className="font-medium">{formatCurrency(spent, currency, exchangeRate)}</span>
                    <span className="text-muted-foreground"> / {formatCurrency(budget.allocated, currency, exchangeRate)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Progress value={utilization} className="h-2" />
                       <span className="text-xs text-muted-foreground w-12 text-right">{utilization.toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(remaining, currency, exchangeRate)}</TableCell>
                   <TableCell className="text-center">
                    <FeedbackDialog budget={budget} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
    </div>
  );
}
