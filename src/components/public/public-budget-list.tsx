
'use client';
import type { Budget, Expense } from "@/lib/types";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { FeedbackDialog } from "../dashboard/budgets/feedback-dialog";

export function PublicBudgetList({ budgets, expenses }: { budgets: Budget[], expenses: Expense[] }) {
    
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Allocation Details</CardTitle>
        <CardDescription>
          A detailed breakdown of all departmental budgets. Use the feedback button to share your thoughts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Spent / Allocated</TableHead>
              <TableHead className="w-[15%] text-center">Utilization</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead className="w-[10%] text-center">Feedback</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgets.map((budget) => {
              const budgetExpenses = expenses.filter(e => e.budgetId === budget.id && e.status === 'Approved');
              const spent = budgetExpenses.reduce((sum, e) => sum + e.amount, 0);
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
                  <TableCell className="text-center">
                    <FeedbackDialog budget={budget} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
