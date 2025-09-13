'use client';
import { formatCurrency } from "@/lib/utils";
import type { Expense } from "@/lib/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function PublicExpenseList({ expenses }: { expenses: Expense[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Approved Expenses</CardTitle>
                <CardDescription>
                    A list of recently approved expenses.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.length > 0 ? expenses.slice(0, 5).map(expense => (
                            <TableRow key={expense.id}>
                                <TableCell className="font-medium">{expense.title}</TableCell>
                                <TableCell>{expense.vendor}</TableCell>
                                <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No approved expenses yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
