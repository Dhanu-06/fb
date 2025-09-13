'use client';
import { StatsCards } from "@/components/dashboard/overview/stats-cards";
import { BudgetSummaryChart } from "@/components/dashboard/overview/budget-summary-chart";
import { RecentExpenses } from "@/components/dashboard/overview/recent-expenses";
import { useClarity } from "@/context/clarity-provider";
import { PublicDashboard } from "@/components/dashboard/public/public-dashboard";

export default function DashboardPage() {
  const { currentUser } = useClarity();

  if (currentUser?.role === 'Public') {
    return <PublicDashboard />;
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
