
'use client';

import { ExpenseForm } from "@/components/dashboard/expenses/expense-form";
import { useClarity } from "@/context/clarity-provider";
import { useCheckRole } from "@/hooks/use-check-role";
import { useParams } from "next/navigation";

export default function EditExpensePage() {
    useCheckRole(['Admin']);
    const { id } = useParams();
    const { getExpenseById } = useClarity();
    const expense = getExpenseById(id as string);

    if (!expense) {
        return (
            <div className="text-center p-10">
                <p className="text-lg text-muted-foreground">Expense not found or you do not have permission to edit it.</p>
            </div>
        );
    }
    
    return <ExpenseForm expense={expense} />;
}
