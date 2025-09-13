'use client';

import { useEffect, useState } from "react";
import type { Budget, Expense, Institution } from "@/lib/types";
import { StatsCards } from "@/components/dashboard/overview/stats-cards";
import { BudgetSummaryChart } from "@/components/dashboard/overview/budget-summary-chart";
import { PublicExpenseList } from "@/components/public/public-expense-list";
import { PublicBudgetList } from "@/components/public/public-budget-list";
import { fetchAllPublicData } from "@/lib/public-data";
import { DEPARTMENTS } from "@/lib/types";

export default function PublicDashboardPage() {
    const [data, setData] = useState<{
        institutions: Institution[],
        budgets: Budget[],
        expenses: Expense[]
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const publicData = await fetchAllPublicData();
                setData(publicData);
                setError(null);
            } catch (err: any) {
                console.error("Failed to load public data:", err);
                setError("Could not download public data. Please ensure Firestore security rules are set correctly for public access.");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground">Loading Public Data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center text-destructive bg-destructive/10 p-8 rounded-lg">
                    <h2 className="text-2xl font-bold">Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }
    
    if (!data || data.budgets.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-lg text-muted-foreground">No public data is available yet.</p>
                </div>
            </div>
        );
    }
    
    const institutionName = data.institutions.length > 0 ? data.institutions[0].name : "All Institutions";


    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
             <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">{institutionName} - Public Dashboard</h2>
            </div>
            <StatsCards budgets={data.budgets} expenses={data.expenses} />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-4">
                    <BudgetSummaryChart budgets={data.budgets} expenses={data.expenses} departments={DEPARTMENTS} />
                </div>
                <div className="lg:col-span-3">
                   <PublicExpenseList expenses={data.expenses} />
                </div>
            </div>
            <PublicBudgetList budgets={data.budgets} expenses={data.expenses} />
        </div>
    );
}
