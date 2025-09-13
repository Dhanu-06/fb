
'use client';
import { useEffect, useState } from 'react';
import { useClarity } from '@/context/clarity-provider';
import type { Budget, Expense, Institution } from '@/lib/types';
import { StatsCards } from '@/components/dashboard/overview/stats-cards';
import { BudgetSummaryChart } from '@/components/dashboard/overview/budget-summary-chart';
import { PublicBudgetList } from '@/components/public/public-budget-list';
import { PublicExpenseList } from '@/components/public/public-expense-list';

export default function PublicPage() {
  const { fetchAllPublicData, departments } = useClarity();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    institutions: Institution[];
    budgets: Budget[];
    expenses: Expense[];
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const publicData = await fetchAllPublicData();
        setData(publicData);
        setError(null);
      } catch (e: any) {
        console.error("Failed to fetch public data:", e);
        setError('Could not download public data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [fetchAllPublicData]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading Public Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center text-destructive">
          <h2 className="text-2xl font-semibold">An Error Occurred</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  if (!data || data.budgets.length === 0) {
    return (
       <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">No Public Data Available</h2>
          <p className="text-muted-foreground">Financial data has not been made public yet. Please check back later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col gap-8">
        <div className='text-center'>
            <h1 className='text-3xl font-bold'>Public Transparency Dashboard</h1>
            <p className='text-muted-foreground'>Financial overview for {data.institutions[0]?.name || 'the institution'}</p>
        </div>
        <StatsCards budgets={data.budgets} expenses={data.expenses} />
        <BudgetSummaryChart budgets={data.budgets} expenses={data.expenses} departments={departments} />
        <PublicBudgetList budgets={data.budgets} expenses={data.expenses} />
        <PublicExpenseList expenses={data.expenses} budgets={data.budgets} />
      </div>
    </div>
  );
}
