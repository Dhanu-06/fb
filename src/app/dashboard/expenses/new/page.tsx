'use client';
import { ExpenseForm } from "@/components/dashboard/expenses/expense-form";
import { useCheckRole } from "@/hooks/use-check-role";

export default function NewExpensePage() {
    useCheckRole(['Admin']);
    return <ExpenseForm />;
}
