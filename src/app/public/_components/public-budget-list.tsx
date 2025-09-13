'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FeedbackDialog } from "@/components/dashboard/budgets/feedback-dialog";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import type { Budget, Expense, Currency } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PublicBudgetListProps {
    budgets: Budget[];
    expenses: Expense[];
    currency: Currency;
    exchangeRate: number;
}

export function PublicBudgetList({ budgets, expenses, currency, exchangeRate }: PublicBudgetListProps) {

    const getExpensesForBudget = (budgetId: string) => {
        return expenses.filter(e => e.budgetId === budgetId);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
                <CardDescription>An overview of all allocated budgets.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[350px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Budget</TableHead>
                                <TableHead className="text-right">Utilization</TableHead>
                                <TableHead className="text-center w-10">Feedback</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {budgets.map((budget) => {
                            const budgetExpenses = getExpensesForBudget(budget.id).filter(e => e.status === 'Approved');
                            const spent = budgetExpenses.reduce((sum, e) => sum + e.amount, 0);
                            const utilization = budget.allocated > 0 ? (spent / budget.allocated) * 100 : 0;
                            return (
                                <TableRow key={budget.id}>
                                    <TableCell>
                                        <div className="font-medium">{budget.title}</div>
                                        <div className="text-sm text-muted-foreground">{budget.department}</div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="font-medium">{formatCurrency(spent, currency, exchangeRate)} / {formatCurrency(budget.allocated, currency, exchangeRate)}</div>
                                        <div className="flex items-center gap-2 justify-end mt-1">
                                            <Progress value={utilization} className="h-2 w-[60px]" />
                                            <span className="text-xs text-muted-foreground">{utilization.toFixed(0)}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <FeedbackDialog budget={budget} />
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
