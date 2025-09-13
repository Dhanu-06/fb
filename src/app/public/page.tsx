'use client';

import { useState, useEffect } from 'react';
import { useClarity } from '@/context/clarity-provider';
import type { Budget, Expense, Institution } from '@/lib/types';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PublicStatsCards } from '@/components/public/public-stats-cards';
import { PublicBudgetSummaryChart } from '@/components/public/public-budget-summary-chart';
import { PublicBudgetList } from '@/components/public/public-budget-list';
import { PublicExpenseList } from '@/components/public/public-expense-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


export default function PublicPage() {
  const { fetchAllPublicData } = useClarity();
  const [data, setData] = useState<{
    institutions: Institution[];
    budgets: Budget[];
    expenses: Expense[];
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
      } catch (e) {
        console.error(e);
        setError('Could not download public data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
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

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.budgets.length === 0) {
     return (
       <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <Logo />
            <Button asChild variant="outline">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Admin Login
              </Link>
            </Button>
          </div>
        </header>
        <main className="flex-1">
          <div className="flex flex-col items-center justify-center h-full text-center p-10 mt-20">
            <h2 className="text-2xl font-semibold">No Public Data Available</h2>
            <p className="text-muted-foreground mt-2 max-w-md">There is currently no financial data to display to the public. Please check back later.</p>
          </div>
        </main>
       </div>
    );
  }

  const { institutions, budgets, expenses } = data;
  const institutionName = institutions[0]?.name || 'Our Institution';


  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex flex-col">
            <Logo />
             <p className="text-sm text-muted-foreground -mt-1">{institutionName} - Public Transparency Dashboard</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/login">
               <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Login
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:px-6 sm:py-8 container mx-auto">
        <div className="flex flex-col gap-6">
            <PublicStatsCards budgets={budgets} expenses={expenses} />
            <PublicBudgetSummaryChart budgets={budgets} expenses={expenses} />

            <Tabs defaultValue="budgets" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="budgets">Budget Overview</TabsTrigger>
                <TabsTrigger value="expenses">Approved Expenses</TabsTrigger>
              </TabsList>
              <TabsContent value="budgets">
                <PublicBudgetList budgets={budgets} expenses={expenses} />
              </TabsContent>
              <TabsContent value="expenses">
                <PublicExpenseList expenses={expenses} budgets={budgets} />
              </TabsContent>
            </Tabs>
        </div>
      </main>
    </div>
  );
}
