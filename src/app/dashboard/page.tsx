'use client';
import { StatsCards } from "@/components/dashboard/overview/stats-cards";
import { BudgetSummaryChart } from "@/components/dashboard/overview/budget-summary-chart";
import { RecentExpenses } from "@/components/dashboard/overview/recent-expenses";
import { useClarity } from "@/context/clarity-provider";

export default function DashboardPage() {
  const { currentUser } = useClarity();

  // The public dashboard is now a separate page, so this check is simpler.
  if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Reviewer')) {
    // You can show a message or a restricted view if needed.
    return (
        <div className="text-center p-10">
            <p className="text-lg text-muted-foreground">Welcome to your dashboard. Select an option from the sidebar.</p>
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
