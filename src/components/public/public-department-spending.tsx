'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { PublicDepartmentStat } from '@/lib/types';

interface PublicDepartmentSpendingProps {
    departmentData: PublicDepartmentStat[];
}

export function PublicDepartmentSpending({ departmentData }: PublicDepartmentSpendingProps) {

  const chartData = departmentData.map(d => ({
      name: d.department,
      "Allocated": d.allocated,
      "Spent": d.spent,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Department</CardTitle>
        <CardDescription>A comparison of allocated vs. spent funds across departments.</CardDescription>
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
            <Legend wrapperStyle={{paddingTop: '20px'}}/>
            <Bar dataKey="Allocated" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Spent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
