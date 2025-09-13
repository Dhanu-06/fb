'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Expense, Budget } from '@/lib/types';
import { useClarity } from '@/context/clarity-provider';


interface PublicExpenseListProps {
  expenses: Expense[];
  budgets: Budget[]; // Note: This will be empty on public page, need to fetch all budgets
}

export function PublicExpenseList({ expenses: initialExpenses }: PublicExpenseListProps) {
  const { fetchAllPublicData } = useClarity();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const [allBudgets, setAllBudgets] = useState<Budget[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>(initialExpenses);

  useEffect(() => {
    const loadData = async () => {
        const { budgets, expenses } = await fetchAllPublicData();
        setAllBudgets(budgets);
        // Only update if initial expenses is empty, to avoid re-fetch if already loaded by parent
        if (initialExpenses.length === 0) {
            setAllExpenses(expenses);
        }
    }
    loadData();
  }, [fetchAllPublicData, initialExpenses.length]);

  const departments = useMemo(() => {
    const depts = new Set(allBudgets.map(b => b.department));
    return ['All', ...Array.from(depts)];
  }, [allBudgets]);

  const getBudgetById = (id: string) => allBudgets.find(b => b.id === id);

  const filteredExpenses = useMemo(() => {
    return allExpenses
      .filter((expense) => {
        const budget = getBudgetById(expense.budgetId);
        if (!budget) return false;

        const searchMatch =
          expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          budget.department.toLowerCase().includes(searchTerm.toLowerCase());

        const departmentMatch =
          departmentFilter === 'All' || budget.department === departmentFilter;

        return searchMatch && departmentMatch;
      });
  }, [allExpenses, searchTerm, departmentFilter, getBudgetById]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approved Expenses</CardTitle>
        <CardDescription>A detailed list of all approved expenses across the institution.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search expenses by title or vendor..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                    {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => {
                  const budget = getBudgetById(expense.budgetId);
                  return (
                    <TableRow
                      key={expense.id}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{expense.title}</TableCell>
                      <TableCell>{budget?.department || 'N/A'}</TableCell>
                      <TableCell>{expense.vendor}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>
                        {new Date(expense.date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No expenses found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
