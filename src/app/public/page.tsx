'use client';
import { useEffect, useState } from 'react';
import { useClarity } from '@/context/clarity-provider';
import type { Institution, Budget, Expense, PublicStats } from '@/lib/types';
import { PublicHeader } from '@/components/public/public-header';
import { PublicStatsCards } from '@/components/public/public-stats-cards';
import { PublicDepartmentSpend } from '@/components/public/public-department-spend';
import { PublicExpenseList } from '@/components/public/public-expense-list';
import { Footer } from '@/components/public/footer';

type PublicData = {
  institutions: Institution[];
  budgets: Budget[];
  expenses: Expense[];
};

export default function PublicDashboardPage() {
  const { fetchAllPublicData } = useClarity();
  const [data, setData] = useState<PublicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const publicData = await fetchAllPublicData();
      setData(publicData);
      setIsLoading(false);
    };
    loadData();
  }, [fetchAllPublicData]);

  if (isLoading || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading Public Data...</p>
        </div>
      </div>
    );
  }

  const filteredBudgets = selectedInstitutionId === 'all' 
    ? data.budgets 
    : data.budgets.filter(b => b.institutionId === selectedInstitutionId);
  
  const filteredExpenses = selectedInstitutionId === 'all'
    ? data.expenses
    : data.expenses.filter(e => e.institutionId === selectedInstitutionId);


  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <PublicHeader 
        institutions={data.institutions}
        selectedInstitutionId={selectedInstitutionId}
        onInstitutionChange={setSelectedInstitutionId}
      />
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col gap-6">
            <PublicStatsCards budgets={filteredBudgets} expenses={filteredExpenses} />
            <div className="grid gap-6 lg:grid-cols-2">
                <PublicDepartmentSpend budgets={filteredBudgets} expenses={filteredExpenses} />
                <PublicExpenseList expenses={filteredExpenses} />
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
