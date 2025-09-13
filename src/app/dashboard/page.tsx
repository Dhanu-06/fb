'use client';
import { StatsCards } from "@/components/dashboard/overview/stats-cards";
import { BudgetSummaryChart } from "@/components/dashboard/overview/budget-summary-chart";
import { RecentExpenses } from "@/components/dashboard/overview/recent-expenses";
import { useClarity } from "@/context/clarity-provider";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { currentUser, budgets, seedDatabase, isLoading } = useClarity();

  const handleSeed = async () => {
    try {
      await seedDatabase();
      toast({
        title: "Database Seeded",
        description: "Sample data has been added to your database.",
      });
    } catch (error: any) {
      toast({
        title: "Seeding Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Reviewer')) {
    return (
        <div className="text-center p-10">
            <p className="text-lg text-muted-foreground">Welcome to your dashboard. Select an option from the sidebar.</p>
        </div>
    );
  }

  // Show seeding button only for admins if there are no budgets
  if (currentUser.role === 'Admin' && !isLoading && budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-10 border-2 border-dashed rounded-lg">
        <h2 className="text-2xl font-semibold">Welcome, Administrator!</h2>
        <p className="text-muted-foreground mt-2 max-w-md">Your dashboard is empty. You can start by creating budgets manually, or populate your database with sample data for "Clarity University" to see how it works.</p>
        <Button onClick={handleSeed} className="mt-6">
          Add Sample Data
        </Button>
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
