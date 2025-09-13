'use client';
import { StatsCards } from "@/components/dashboard/overview/stats-cards";
import { BudgetSummaryChart } from "@/components/dashboard/overview/budget-summary-chart";
import { RecentExpenses } from "@/components/dashboard/overview/recent-expenses";
import { useClarity } from "@/context/clarity-provider";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { currentUser, budgets, seedDatabase } = useClarity();
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
        await seedDatabase();
        toast({
            title: "Database Seeded",
            description: "Sample data has been added to your database.",
        });
    } catch (error: any) {
        toast({
            title: "Seeding Failed",
            description: error.message || "An error occurred while seeding the database.",
            variant: "destructive",
        });
    } finally {
        setIsSeeding(false);
    }
  };

  // The public dashboard is now a separate page, so this check is simpler.
  if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Reviewer')) {
    // You can show a message or a restricted view if needed.
    return (
        <div className="text-center p-10">
            <p className="text-lg text-muted-foreground">Welcome to your dashboard. Select an option from the sidebar.</p>
        </div>
    );
  }

  // Show seed button only to admin if there are no budgets
  if (currentUser.role === 'Admin' && budgets.length === 0) {
    return (
        <div className="text-center p-10 flex flex-col items-center gap-4">
            <h2 className="text-2xl font-semibold">Welcome to ClarityLedger!</h2>
            <p className="text-muted-foreground max-w-md">
                Your database is currently empty. To get started, you can add some sample data for a fictional university.
            </p>
            <Button onClick={handleSeedData} disabled={isSeeding}>
                <Sparkles className="mr-2 h-4 w-4" />
                {isSeeding ? 'Seeding...' : 'Add Sample Data'}
            </Button>
        </div>
    )
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
