
'use client';
import { useEffect, useState, useMemo } from 'react';
import { useClarity } from '@/context/clarity-provider';
import type { Budget, Expense, Institution, PublicDepartmentStat } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

export default function PublicDashboardPage() {
  const { fetchAllPublicData } = useClarity();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    institutions: Institution[],
    budgets: Budget[],
    expenses: Expense[],
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const publicData = await fetchAllPublicData();
        setData(publicData);
      } catch (error) {
        console.error("Could not download public data:", error);
        toast({
          title: "Error",
          description: "Could not download public data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchAllPublicData, toast]);

  const { totalAllocated, totalSpent, departmentData } = useMemo(() => {
    if (!data) {
      return { totalAllocated: 0, totalSpent: 0, departmentData: [] };
    }

    const { budgets, expenses } = data;
    const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const departments = Array.from(new Set(budgets.map(b => b.department)));

    const departmentData: PublicDepartmentStat[] = departments.map(dept => {
      const allocated = budgets
        .filter(b => b.department === dept)
        .reduce((sum, b) => sum + b.allocated, 0);
      
      const spent = expenses
        .filter(e => budgets.find(b => b.id === e.budgetId)?.department === dept)
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        department: dept,
        allocated,
        spent,
        utilization: allocated > 0 ? (spent / allocated) * 100 : 0,
      };
    }).filter(d => d.allocated > 0 || d.spent > 0);

    return { totalAllocated, totalSpent, departmentData };
  }, [data]);

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
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
            <h2 className="text-xl font-semibold">Could not load data</h2>
            <p className="text-muted-foreground">There was an issue fetching the public financial data. Please try again later.</p>
             <Button variant="outline" onClick={() => router.push('/')} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Homepage
            </Button>
        </div>
      </div>
    );
  }

  const { budgets, expenses: approvedExpenses } = data;
  
  return (
    <div className="min-h-screen bg-background">
       <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <Logo />
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Public Transparency Dashboard</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-2">
                A complete and transparent overview of all approved financial activities across all institutions. 
                This data is provided for public accountability.
            </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card>
                <CardHeader>
                    <CardTitle>Total Allocated Funds</CardTitle>
                    <CardDescription>Sum of all budgets across all departments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{formatCurrency(totalAllocated)}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Total Approved Spending</CardTitle>
                    <CardDescription>Sum of all approved expenses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{formatCurrency(totalSpent)}</p>
                </CardContent>
            </Card>
        </div>

        {/* Department Spending Chart */}
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Spending by Department</CardTitle>
                <CardDescription>An overview of how funds are allocated and spent across different departments.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={departmentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={80}/>
                        <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value as number)} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                            formatter={(value) => formatCurrency(value as number)}
                        />
                        <Legend />
                        <Bar dataKey="allocated" fill="hsl(var(--accent))" name="Allocated" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="spent" fill="hsl(var(--primary))" name="Spent" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        {/* Budget Utilization Table */}
         <Card className="mb-8">
            <CardHeader>
                <CardTitle>Budget Utilization Details</CardTitle>
                 <CardDescription>A detailed breakdown of spending versus allocation for each budget.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Budget Title</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Allocated</TableHead>
                            <TableHead>Spent</TableHead>
                            <TableHead className="w-[15%] text-center">Utilization</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {budgets.map(budget => {
                            const spent = approvedExpenses
                                .filter(e => e.budgetId === budget.id)
                                .reduce((sum, e) => sum + e.amount, 0);
                            const utilization = budget.allocated > 0 ? (spent / budget.allocated) * 100 : 0;
                            return (
                                <TableRow key={budget.id}>
                                    <TableCell className="font-medium">{budget.title}</TableCell>
                                    <TableCell>{budget.department}</TableCell>
                                    <TableCell>{formatCurrency(budget.allocated)}</TableCell>
                                    <TableCell>{formatCurrency(spent)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={utilization} className="h-2" />
                                            <span className="text-xs text-muted-foreground w-12 text-right">{utilization.toFixed(0)}%</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>


        {/* Approved Expenses Table */}
        <Card>
            <CardHeader>
                <CardTitle>All Approved Expenses</CardTitle>
                <CardDescription>A comprehensive log of all expenses that have been approved.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {approvedExpenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => {
                            const budget = budgets.find(b => b.id === expense.budgetId);
                            return (
                                <TableRow key={expense.id}>
                                    <TableCell className="font-medium">{expense.title}</TableCell>
                                    <TableCell>{budget?.department || 'N/A'}</TableCell>
                                    <TableCell>{expense.vendor}</TableCell>
                                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
    