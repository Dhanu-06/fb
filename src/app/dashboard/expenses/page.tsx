import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseTable } from "@/components/dashboard/expenses/expense-table";

export default function ExpensesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses</CardTitle>
        <CardDescription>
          View, manage, and approve expenses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ExpenseTable />
      </CardContent>
    </Card>
  );
}
