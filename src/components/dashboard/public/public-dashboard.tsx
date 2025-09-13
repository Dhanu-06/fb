'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useClarity } from "@/context/clarity-provider";
import { formatCurrency } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function PublicDashboard() {
  const { publicStats, expenses, budgets } = useClarity();
  const approvedExpenses = expenses.filter(e => e.status === 'Approved');

  return (
    <div className="flex flex-col gap-6">
      <Card>
          <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>A summary of total allocated funds vs. total spending.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Allocated Funds</p>
                    <p className="text-3xl font-bold">{formatCurrency(publicStats.totalAllocated)}</p>
                </div>
                 <div className="p-6 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Approved Spending</p>
                    <p className="text-3xl font-bold">{formatCurrency(publicStats.totalSpent)}</p>
                </div>
              </div>
          </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department Spending Breakdown</CardTitle>
           <CardDescription>Allocated budget vs. approved spending per department.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={publicStats.departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value as number)}/>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                }}
                formatter={(value) => formatCurrency(value as number)}
              />
              <Legend />
              <Bar dataKey="allocated" name="Allocated" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name="Spent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>All Approved Expenses</CardTitle>
           <CardDescription>A detailed list of all expenses that have been approved.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedExpenses.map((expense) => {
                  const budget = budgets.find(b => b.id === expense.budgetId);
                  return (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.title}</TableCell>
                      <TableCell>{budget?.department}</TableCell>
                      <TableCell>{expense.vendor}</TableCell>
                      <TableCell><Badge variant="outline">{expense.category}</Badge></TableCell>
                      <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}
