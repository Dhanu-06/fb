'use client';
import { useState, useEffect } from 'react';
import { useClarity } from '@/context/clarity-provider';
import type { Budget, Expense, Institution, PublicDepartmentStat } from '@/lib/types';
import { PublicStatsCards } from '@/components/public/public-stats-cards';
import { PublicDepartmentSpending } from '@/components/public/public-department-spending';
import { PublicExpenseList } from '@/components/public/public-expense-list';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function PublicDashboardPage() {
  const { fetchAllPublicData } = useClarity();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    totalAllocated: number;
    totalSpent: number;
    departmentData: PublicDepartmentStat[];
    allExpenses: Expense[];
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { budgets, expenses } = await fetchAllPublicData();
        
        const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
        
        const departmentMap = new Map<string, { allocated: number; spent: number }>();

        budgets.forEach(budget => {
            const entry = departmentMap.get(budget.department) || { allocated: 0, spent: 0 };
            entry.allocated += budget.allocated;
            departmentMap.set(budget.department, entry);
        });

        expenses.forEach(expense => {
            const relatedBudget = budgets.find(b => b.id === expense.budgetId);
            if (relatedBudget) {
                const entry = departmentMap.get(relatedBudget.department) || { allocated: 0, spent: 0 };
                entry.spent += expense.amount;
                departmentMap.set(relatedBudget.department, entry);
            }
        });

        const departmentData: PublicDepartmentStat[] = Array.from(departmentMap.entries()).map(([department, { allocated, spent }]) => ({
            department,
            allocated,
            spent,
            utilization: allocated > 0 ? (spent / allocated) * 100 : 0,
        })).sort((a,b) => b.allocated - a.allocated);

        setData({
          totalAllocated,
          totalSpent,
          departmentData,
          allExpenses: expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        });

      } catch (error) {
        console.error("Failed to fetch public data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchAllPublicData]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading Public Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        <p>Could not load public data at this time.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
               <Logo />
                <Button variant="outline" asChild>
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
            <div className="container mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold">Public Transparency Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        A clear view of financial data for Clarity University.
                    </p>
                </div>

                <div className="flex flex-col gap-8">
                    <PublicStatsCards 
                        totalAllocated={data.totalAllocated}
                        totalSpent={data.totalSpent}
                    />
                    <PublicDepartmentSpending departmentData={data.departmentData} />
                    <PublicExpenseList expenses={data.allExpenses} budgets={[]} />
                </div>
            </div>
        </main>

        <footer className="bg-muted py-8">
            <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ClarityLedger. All rights reserved.</p>
            </div>
        </footer>
    </div>
  );
}
