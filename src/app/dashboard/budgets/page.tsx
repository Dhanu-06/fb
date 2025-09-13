'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetList } from "@/components/dashboard/budgets/budget-list";
import { CreateBudgetDialog } from "@/components/dashboard/budgets/create-budget-dialog";
import { useCheckRole } from "@/hooks/use-check-role";

export default function BudgetsPage() {
  useCheckRole(['Admin']);

  return (
     <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Budgets</CardTitle>
                <CardDescription>
                Create and manage budgets for all departments.
                </CardDescription>
            </div>
            <CreateBudgetDialog />
        </div>
      </CardHeader>
      <CardContent>
        <BudgetList />
      </CardContent>
    </Card>
  );
}
