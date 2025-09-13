'use client';
import { useMemo } from 'react';
import type { Budget, Expense } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { DEPARTMENTS } from '@/lib/types';

interface PublicDepartmentSpendProps {
    budgets: Budget[];
    expenses: Expense[];
}

export function PublicDepartmentSpend({ budgets, expenses }: PublicDepartmentSpendProps) {

  const chartData = useMemo(() => {
    return DEPARTMENTS.map(department => {
      const departmentBudgets = budgets.filter(b => b.department === department);
      const totalAllocated = departmentBudgets.reduce((sum, b) => sum + b.allocated, 0);
      
      const departmentExpenses = expenses.filter(e => {
        const budget = budgets.find(b => b.id === e.budgetId);
        return budget?.department === department;
      });
      const totalSpent = departmentExpenses.reduce((sum, e) => sum + e.amount, 0);

      return {
        name: department,
        "Allocated": totalAllocated,
        "Spent": totalSpent
      };
    }).filter(d => d.Allocated > 0 || d.Spent > 0);
  }, [budgets, expenses]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Spending Analysis</CardTitle>
        <CardDescription>Allocated budget vs. approved spending per department.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
            <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value as number)}/>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
              formatter={(value) => formatCurrency(value as number)}
            />
            <Legend />
            <Bar dataKey="Allocated" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Spent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
