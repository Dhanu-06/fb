'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListFilter, PlusCircle, Search } from 'lucide-react';
import { useClarity } from '@/context/clarity-provider';
import { formatCurrency } from '@/lib/utils';
import { Expense } from '@/lib/types';

export function ExpenseTable() {
  const { expenses, getBudgetById, currentUser, currency, exchangeRate } = useClarity();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        const budget = getBudgetById(expense.budgetId);
        if (!budget) return false;

        const searchMatch =
          expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          budget.department.toLowerCase().includes(searchTerm.toLowerCase());

        const statusMatch =
          statusFilter === 'All' || expense.status === statusFilter;

        return searchMatch && statusMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchTerm, statusFilter, getBudgetById]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'secondary';
      case 'Rejected':
        return 'destructive';
      case 'Submitted':
        return 'outline';
      default:
        return 'default';
    }
  };

  const handleRowClick = (expenseId: string) => {
    router.push(`/dashboard/expenses/${expenseId}`);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title, vendor, department..."
            className="pl-8 sm:w-1/2 md:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="All">All</TabsTrigger>
                <TabsTrigger value="Submitted">Submitted</TabsTrigger>
                <TabsTrigger value="Approved">Approved</TabsTrigger>
                <TabsTrigger value="Rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
          {currentUser?.role === 'Admin' && (
            <Button asChild size="sm" className="h-8 gap-1">
              <Link href="/dashboard/expenses/new">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Add Expense</span>
              </Link>
            </Button>
          )}
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
              <TableHead className="text-center">Status</TableHead>
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
                    onClick={() => handleRowClick(expense.id)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">{expense.title}</TableCell>
                    <TableCell>{budget?.department || 'N/A'}</TableCell>
                    <TableCell>{expense.vendor}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(expense.amount, currency, exchangeRate)}
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
                  No expenses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
