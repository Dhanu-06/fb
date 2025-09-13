'use client';
import { useClarity } from "@/context/clarity-provider";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

export function PublicDashboardClient() {
  const { budgets, expenses, departments } = useClarity();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const approvedExpenses = useMemo(() => expenses.filter(e => e.status === 'Approved'), [expenses]);

  const totalCollected = useMemo(() => budgets.reduce((sum, b) => sum + b.allocated, 0), [budgets]);
  const totalSpent = useMemo(() => approvedExpenses.reduce((sum, e) => sum + e.amount, 0), [approvedExpenses]);

  const allocationData = useMemo(() => {
    return departments.map(dept => {
      const allocated = budgets
        .filter(b => b.department === dept)
        .reduce((sum, b) => sum + b.allocated, 0);
      return { name: dept, value: allocated };
    }).filter(d => d.value > 0);
  }, [budgets, departments]);

  const utilizationData = useMemo(() => {
    return departments.map(dept => {
      const allocated = budgets.filter(b => b.department === dept).reduce((sum, b) => sum + b.allocated, 0);
      const spent = approvedExpenses.filter(e => getBudgetById(e.budgetId)?.department === dept).reduce((sum, e) => sum + e.amount, 0);
      const utilization = allocated > 0 ? (spent / allocated) * 100 : 0;
      return { name: dept, utilization };
    }).filter(d => d.utilization > 0 || allocated > 0);
  }, [budgets, approvedExpenses, departments]);
  
  const getBudgetById = (id: string) => budgets.find(b => b.id === id);

  const filteredExpenses = useMemo(() => {
    return approvedExpenses.filter(expense => {
        const budget = getBudgetById(expense.budgetId);
        const searchMatch = searchTerm === '' ||
            expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            budget?.department.toLowerCase().includes(searchTerm.toLowerCase());
        
        const categoryMatch = categoryFilter === 'All' || expense.category === categoryFilter;

        return searchMatch && categoryMatch;
    });
  }, [approvedExpenses, searchTerm, categoryFilter]);

  const allCategories = useMemo(() => ['All', ...new Set(approvedExpenses.map(e => e.category))], [approvedExpenses]);

  return (
    <div className="container py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Public Dashboard</h1>
        <p className="text-muted-foreground mt-2">Transparency in college fund utilization.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 text-center">
        <Card>
            <CardHeader>
                <CardTitle>Total Fees Collected</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(totalCollected)}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Total Funds Spent</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(totalSpent)}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Remaining Funds</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(totalCollected - totalSpent)}</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fund Allocation</CardTitle>
            <CardDescription>How the total fund is allocated across departments.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={allocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Department Utilization</CardTitle>
            <CardDescription>Percentage of allocated funds spent by each department.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={utilizationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip formatter={(value) => `${(value as number).toFixed(2)}%`} />
                <Bar dataKey="utilization" fill="hsl(var(--primary))" background={{ fill: 'hsl(var(--muted))' }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Approved Expenses Ledger</CardTitle>
            <CardDescription>A searchable and filterable list of all approved expenses.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Input 
                    placeholder="Search by title, vendor, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                />
                <Select onValueChange={setCategoryFilter} defaultValue="All">
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        {allCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredExpenses.length > 0 ? filteredExpenses.map(expense => {
                        const budget = getBudgetById(expense.budgetId);
                        return (
                            <TableRow key={expense.id}>
                                <TableCell className="font-medium">{expense.title}</TableCell>
                                <TableCell>{budget?.department}</TableCell>
                                <TableCell><Badge variant="outline">{expense.category}</Badge></TableCell>
                                <TableCell>{expense.vendor}</TableCell>
                                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                            </TableRow>
                        );
                    }) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">No expenses match your criteria.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
