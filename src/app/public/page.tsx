
'use client';
import { useEffect, useState, useMemo } from 'react';
import { useClarity } from '@/context/clarity-provider';
import type { Budget, Expense, Institution } from '@/lib/types';
import { StatsCards } from '@/components/dashboard/overview/stats-cards';
import { BudgetSummaryChart } from '@/components/dashboard/overview/budget-summary-chart';
import { PublicExpenseList } from '@/components/public/public-expense-list';
import { PublicBudgetList } from '@/components/public/public-budget-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DEPARTMENTS } from '@/lib/types';

export default function PublicDashboardPage() {
  const { fetchAllPublicData } = useClarity();
  const [data, setData] = useState<{
    institutions: Institution[];
    budgets: Budget[];
    expenses: Expense[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const publicData = await fetchAllPublicData();
        setData(publicData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Could not download public data. Please check Firestore security rules.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [fetchAllPublicData]);

  const publicClarityContext = useMemo(() => {
    if (!data) return null;
    return {
      ...data,
      departments: DEPARTMENTS,
      getBudgetById: (id: string) => data.budgets.find(b => b.id === id),
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading Public Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-destructive/10 border border-destructive rounded-lg">
        <h2 className="text-xl font-semibold text-destructive">Error Loading Data</h2>
        <p className="text-destructive-foreground mt-2">{error}</p>
      </div>
    );
  }

  if (!publicClarityContext || publicClarityContext.budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-10 border-2 border-dashed rounded-lg">
        <h2 className="text-2xl font-semibold">No Public Data Available</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          This institution has not published any financial data yet. Please check back later.
        </p>
      </div>
    );
  }

  // Create a mock context for the components that need it
  const mockProviderValue = {
      budgets: publicClarityContext.budgets,
      expenses: publicClarityContext.expenses,
      departments: publicClarityContext.departments,
      getBudgetById: publicClarityContext.getBudgetById
  }

  return (
    <div className="container mx-auto">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Public Transparency Dashboard</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                An open view of financial allocation and expenditure for {data?.institutions[0]?.name || 'our institution'}.
            </p>
        </div>
        <div className="flex flex-col gap-6">
            {/* We need to wrap these components with a provider-like structure or pass props */}
            <StatsCardsWrapper budgets={publicClarityContext.budgets} expenses={publicClarityContext.expenses} />
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Department Spending</CardTitle>
                            <CardDescription>Allocated budget vs. approved spending per department.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <BudgetSummaryChartWrapper budgets={publicClarityContext.budgets} expenses={publicClarityContext.expenses} departments={publicClarityContext.departments}/>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-3">
                   <PublicExpenseList expenses={publicClarityContext.expenses} getBudgetById={publicClarityContext.getBudgetById}/>
                </div>
            </div>

            <PublicBudgetList budgets={publicClarityContext.budgets} expenses={publicClarityContext.expenses}/>

        </div>
    </div>
  );
}

// Wrapper components to provide context-like props
const StatsCardsWrapper = ({ budgets, expenses }: { budgets: Budget[], expenses: Expense[] }) => {
    const { useClarity } = require('@/context/clarity-provider');
    const originalContext = useClarity();
    const mockContext = { ...originalContext, budgets, expenses };
    
    return (
        <ClarityProvider mock={mockContext}>
            <StatsCards />
        </ClarityProvider>
    );
}

const BudgetSummaryChartWrapper = ({ budgets, expenses, departments }: { budgets: Budget[], expenses: Expense[], departments: string[] }) => {
    const { useClarity } = require('@/context/clarity-provider');
    const originalContext = useClarity();
    const mockContext = { ...originalContext, budgets, expenses, departments };

    return (
        <ClarityProvider mock={mockContext}>
            <BudgetSummaryChart />
        </ClarityProvider>
    );
}

// A trick to use the context provider for isolated components without affecting the main app state
const ClarityProvider = ({ children, mock }: { children: React.ReactNode, mock: any }) => {
    const { ClarityProvider: OriginalProvider, useClarity } = require('@/context/clarity-provider');
    const originalContext = useClarity();
    
    const augmentedContext = { ...originalContext, ...mock };

    // We need a new context to avoid overwriting the main one
    const NewContext = require('react').createContext(augmentedContext);

    return <NewContext.Provider value={augmentedContext}>{children}</NewContext.Provider>;
};

