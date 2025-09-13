'use client';
import { useClarity } from "@/context/clarity-provider";
import { ExpenseDetails } from "@/components/dashboard/expenses/expense-details";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Expense } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExpenseDetailPage({ params }: { params: { id: string } }) {
  const { getExpenseById } = useClarity();
  const router = useRouter();

  // Use state to manage the expense data, allowing for updates
  const [expense, setExpense] = useState<Expense | undefined>(() => getExpenseById(params.id));
  
  useEffect(() => {
    // This effect ensures that if the context updates, the component re-evaluates the expense
    const currentExpense = getExpenseById(params.id);
    setExpense(currentExpense);
  }, [params.id, getExpenseById]);

  const handleUpdate = () => {
    // Re-fetch the expense from context to get the latest state
    const updatedExpense = getExpenseById(params.id);
    setExpense(updatedExpense);
  };

  if (!expense) {
    return (
        <div className="text-center p-10">
            <p className="text-lg text-muted-foreground">Expense not found.</p>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
        <div className="mb-4">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Expenses
            </Button>
        </div>
      <ExpenseDetails expense={expense} onUpdate={handleUpdate} />
    </div>
  );
}
