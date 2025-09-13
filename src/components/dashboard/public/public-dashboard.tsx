'use client';
import { useEffect, useState } from "react";
import { useClarity } from "@/context/clarity-provider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Institution, Budget, Expense } from "@/lib/types";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface PublicData {
    institutions: Institution[];
    budgets: Budget[];
    expenses: Expense[];
}

export function PublicDashboard() {
    const { fetchAllPublicData } = useClarity();
    const [data, setData] = useState<PublicData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const publicData = await fetchAllPublicData();
            setData(publicData);
            setIsLoading(false);
        };
        loadData();
    }, [fetchAllPublicData]);

    if (isLoading) {
        return (
             <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground">Loading Public Data...</p>
                </div>
            </div>
        )
    }

    if (!data || data.institutions.length === 0) {
        return (
            <div className="text-center p-10">
                <p className="text-lg text-muted-foreground">No public data available at the moment.</p>
            </div>
        )
    }

    const getChartData = (institutionId: string) => {
        const institutionBudgets = data.budgets.filter(b => b.institutionId === institutionId);
        const institutionExpenses = data.expenses.filter(e => e.institutionId === institutionId && e.status === 'Approved');
        
        const departments = [...new Set(institutionBudgets.map(b => b.department))];

        return departments.map(dept => {
            const allocated = institutionBudgets.filter(b => b.department === dept).reduce((sum, b) => sum + b.allocated, 0);
            const spent = institutionExpenses.filter(e => {
                const budget = institutionBudgets.find(b => b.id === e.budgetId);
                return budget?.department === dept;
            }).reduce((sum, e) => sum + e.amount, 0);
            return { name: dept, Allocated: allocated, Spent: spent };
        }).filter(d => d.Allocated > 0 || d.Spent > 0);
    }

    return (
        <div className="container mx-auto py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold">Public Transparency Dashboard</h1>
                <p className="text-muted-foreground mt-2">An open view of financial data for all participating institutions.</p>
            </div>
            <Accordion type="single" collapsible className="w-full">
                {data.institutions.map(inst => {
                    const instBudgets = data.budgets.filter(b => b.institutionId === inst.id);
                    const instExpenses = data.expenses.filter(e => e.institutionId === inst.id);
                    const totalAllocated = instBudgets.reduce((sum, b) => sum + b.allocated, 0);
                    const totalSpent = instExpenses.reduce((sum, e) => sum + e.amount, 0);
                     const chartData = getChartData(inst.id);

                    return (
                        <AccordionItem value={inst.id} key={inst.id}>
                            <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                                {inst.name}
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="grid gap-6 p-4">
                                     <div className="grid md:grid-cols-2 gap-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Overall Financials</CardTitle>
                                            </CardHeader>
                                            <CardContent className="grid grid-cols-2 gap-4 text-center">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Total Allocated</p>
                                                    <p className="text-2xl font-bold">{formatCurrency(totalAllocated)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Total Spent (Approved)</p>
                                                    <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Department Spending</CardTitle>
                                                <CardDescription>Allocated vs. Spent per department.</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                 <ResponsiveContainer width="100%" height={200}>
                                                    <BarChart data={chartData}>
                                                        <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={10} tickLine={false} axisLine={false} />
                                                        <YAxis stroke="hsl(var(--foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${Number(value)/1000}k`}/>
                                                        <Tooltip
                                                          contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                                                          formatter={(value) => formatCurrency(value as number)}
                                                        />
                                                        <Bar dataKey="Allocated" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                                                        <Bar dataKey="Spent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>
                                     </div>
                                     <div>
                                        <h3 className="text-lg font-semibold mb-2">Approved Expenses</h3>
                                        {instExpenses.length > 0 ? (
                                            <div className="border rounded-lg">
                                                {instExpenses.map(exp => (
                                                    <div key={exp.id} className="p-3 border-b text-sm grid grid-cols-3 gap-2 items-center">
                                                        <span className="font-medium">{exp.title}</span>
                                                        <span>{exp.vendor}</span>
                                                        <span className="text-right font-semibold">{formatCurrency(exp.amount)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No approved expenses to show.</p>
                                        )}
                                     </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        </div>
    );
}