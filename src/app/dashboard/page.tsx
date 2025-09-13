'use client';
import { StatsCards } from "@/components/dashboard/overview/stats-cards";
import { BudgetSummaryChart } from "@/components/dashboard/overview/budget-summary-chart";
import { RecentExpenses } from "@/components/dashboard/overview/recent-expenses";
import { useClarity } from "@/context/clarity-provider";

export default function DashboardPage() {
  const { currentUser, budgets, isLoading } = useClarity();

  if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="text-center">
                <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Loading Dashboard...</p>
            </div>
        </div>
    );
  }

  if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Reviewer')) {
    return (
        <div className="text-center p-10">
            <p className="text-lg text-muted-foreground">Welcome to your dashboard. Select an option from the sidebar.</p>
        </div>
    );
  }

  // Show a welcome message if there is no data yet
  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-10 border-2 border-dashed rounded-lg">
        <h2 className="text-2xl font-semibold">Welcome to ClarityLedger!</h2>
        <p className="text-muted-foreground mt-2 max-w-md">Your dashboard is ready. Start by creating a budget or submitting an expense to see your financial data visualized here.</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-4">
      <StatsCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
            <BudgetSummaryChart />
        </div>
        <div className="lg:col-span-3">
            <RecentExpenses />
        </div>
      </div>
    </div>
  );
}
