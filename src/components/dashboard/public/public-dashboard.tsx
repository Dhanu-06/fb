'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useClarity } from "@/context/clarity-provider";
import { formatCurrency } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export function PublicDashboard() {
  const { publicStats, expenses, getBudgetById } = useClarity();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    vendor: '',
    date: ''
  });

  const approvedExpenses = useMemo(() => {
    return expenses.filter(e => e.status === 'Approved');
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return approvedExpenses
      .filter(expense => {
        const budget = getBudgetById(expense.budgetId);
        if (!budget) return false;

        const searchMatch =
          expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          budget.department.toLowerCase().includes(searchTerm.toLowerCase());

        const categoryMatch = !filters.category || expense.category === filters.category;
        const vendorMatch = !filters.vendor || expense.vendor === filters.vendor;
        const dateMatch = !filters.date || new Date(expense.date).toDateString() === new Date(filters.date).toDateString();

        return searchMatch && categoryMatch && vendorMatch && dateMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [approvedExpenses, searchTerm, filters, getBudgetById]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'secondary';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>A summary of allocated funds versus approved spending.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Total Allocated Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(publicStats.totalAllocated)}</p>
            </div>
             <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Total Spent (Approved)</p>
                <p className="text-2xl font-bold">{formatCurrency(publicStats.totalSpent)}</p>
            </div>
             <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Remaining Funds</p>
                <p className="text-2xl font-bold">{formatCurrency(publicStats.totalAllocated - publicStats.totalSpent)}</p>
            </div>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
            <CardTitle>Department Spending</CardTitle>
            <CardDescription>Budget utilization across different departments.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={publicStats.departmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value as number)}/>
                    <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                    }}
                    formatter={(value) => formatCurrency(value as number)}
                    />
                    <Legend />
                    <Bar dataKey="allocated" fill="hsl(var(--accent))" name="Allocated" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spent" fill="hsl(var(--primary))" name="Spent" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approved Expenses</CardTitle>
          <CardDescription>A detailed list of all approved expenses.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search expenses..."
                className="pl-8 sm:w-1/2 md:w-1/3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Add filter dropdowns here if needed */}
          </div>
           <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => {
                    const budget = getBudgetById(expense.budgetId);
                    return (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.title}</TableCell>
                        <TableCell>{budget?.department || 'N/A'}</TableCell>
                        <TableCell>{expense.vendor}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusVariant(expense.status)}>
                            {expense.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(expense.date).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No approved expenses found.
                    </TableCell>
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
