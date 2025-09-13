'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetList } from "@/components/dashboard/budgets/budget-list";
import { useCheckRole } from "@/hooks/use-check-role";

export default function BudgetsPage() {
  useCheckRole(['Admin', 'Reviewer', 'Public']);

  return (
     <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Budgets</CardTitle>
                <CardDescription>
                View and manage budgets for all departments.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <BudgetList />
      </CardContent>
    </Card>
  );
}
