'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { Budget, Expense, Currency } from "@/lib/types";

interface PublicExpenseListProps {
    expenses: Expense[];
    budgets: Budget[];
    currency: Currency;
    exchangeRate: number;
}


export function PublicExpenseList({ expenses, budgets, currency, exchangeRate }: PublicExpenseListProps) {

    const getBudgetById = (id: string) => budgets.find(b => b.id === id);

    const approvedExpenses = expenses
        .filter(e => e.status === 'Approved')
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <Card>
            <CardHeader>
                <CardTitle>Approved Expenses</CardTitle>
                <CardDescription>A list of all publicly visible expenses.</CardDescription>
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
                            {approvedExpenses.length > 0 ? (
                            approvedExpenses.map((expense) => {
                                const budget = getBudgetById(expense.budgetId);
                                return (
                                <TableRow key={expense.id} >
                                    <TableCell className="font-medium">{expense.title}</TableCell>
                                    <TableCell>{budget?.department || 'N/A'}</TableCell>
                                    <TableCell>{expense.vendor}</TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(expense.amount, currency, exchangeRate)}
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
    )
}
