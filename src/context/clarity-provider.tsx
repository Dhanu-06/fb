'use client';

import type { Budget, Expense, Role, User, PublicStats, SignupData } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { DEPARTMENTS, EXPENSE_CATEGORIES } from '@/lib/types';

// Mock Data
const initialUsers: User[] = [
  { id: 'user-1', name: 'Admin User', role: 'Admin', email: 'admin@example.com', password: 'password' },
  { id: 'user-2', name: 'Reviewer User', role: 'Reviewer', email: 'reviewer@example.com', password: 'password' },
  { id: 'user-3', name: 'Public User', role: 'Public', email: 'public@example.com', password: 'password' },
];

const initialBudgets: Budget[] = [
  { id: 'budget-1', title: 'Annual Fest 2025', allocated: 500000, department: 'Events' },
  { id: 'budget-2', title: 'Library Acquisition Q3', allocated: 1000000, department: 'Library' },
  { id: 'budget-3', title: 'Sports Equipment 2025', allocated: 750000, department: 'Sports' },
];

const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    title: 'New Computer Science Books',
    amount: 20000,
    category: 'Supplies',
    vendor: 'Book World Inc.',
    date: new Date('2024-07-15T10:00:00Z').toISOString(),
    budgetId: 'budget-2',
    submittedBy: 'user-1',
    status: 'Approved',
    receiptUrl: 'https://picsum.photos/seed/receipt1/400/600',
    auditTrail: [
      { timestamp: new Date('2024-07-15T10:00:00Z').toISOString(), userId: 'user-1', action: 'Created' },
      { timestamp: new Date('2024-07-16T11:30:00Z').toISOString(), userId: 'user-2', action: 'Approved', comments: 'Looks good.' },
    ],
  },
  {
    id: 'exp-2',
    title: 'Stage and Lighting Setup',
    amount: 150000,
    category: 'Services',
    vendor: 'Event Masters',
    date: new Date('2024-08-01T14:00:00Z').toISOString(),
    budgetId: 'budget-1',
    submittedBy: 'user-1',
    status: 'Submitted',
    receiptUrl: 'https://picsum.photos/seed/receipt2/400/600',
    auditTrail: [{ timestamp: new Date('2024-08-01T14:00:00Z').toISOString(), userId: 'user-1', action: 'Created' }],
  },
  {
    id: 'exp-3',
    title: 'New Football Kits',
    amount: 85000,
    category: 'Equipment',
    vendor: 'Sports United',
    date: new Date('2024-07-20T09:00:00Z').toISOString(),
    budgetId: 'budget-3',
    submittedBy: 'user-1',
    status: 'Rejected',
    receiptUrl: 'https://picsum.photos/seed/receipt3/400/600',
    auditTrail: [
      { timestamp: new Date('2024-07-20T09:00:00Z').toISOString(), userId: 'user-1', action: 'Created' },
      {
        timestamp: new Date('2024-07-21T16:00:00Z').toISOString(),
        userId: 'user-2',
        action: 'Rejected',
        comments: 'Quote is too high. Please find alternative vendors.',
      },
    ],
  },
];

// Context Type
interface ClarityContextType {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => User;
  logout: () => void;
  signup: (data: SignupData) => User;
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'submittedBy' | 'auditTrail' | 'status'>) => void;
  updateExpenseStatus: (expenseId: string, status: 'Approved' | 'Rejected', comments: string) => void;
  getExpensesForBudget: (budgetId: string) => Expense[];
  getBudgetById: (budgetId: string) => Budget | undefined;
  getExpenseById: (expenseId: string) => Expense | undefined;
  getUserById: (userId: string) => User | undefined;
  departments: string[];
  expenseCategories: string[];
  publicStats: PublicStats;
}

const ClarityContext = createContext<ClarityContextType | undefined>(undefined);

// Provider Component
export const ClarityProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('clarity-user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): User => {
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      throw new Error("Invalid email or password.");
    }
    setCurrentUser(user);
    localStorage.setItem('clarity-user', JSON.stringify(user));
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('clarity-user');
  };

  const signup = (data: SignupData): User => {
    if (users.some(u => u.email === data.email)) {
      throw new Error("User with this email already exists.");
    }
    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const addBudget = (budgetData: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: `budget-${Date.now()}`,
    };
    setBudgets((prev) => [...prev, newBudget]);
  };
  
  const addExpense = (expenseData: Omit<Expense, 'id' | 'submittedBy' | 'auditTrail' | 'status'>) => {
    if (!currentUser) throw new Error("No user logged in");
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      submittedBy: currentUser.id,
      status: 'Submitted',
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          userId: currentUser.id,
          action: 'Created',
        },
      ],
    };
    setExpenses((prev) => [...prev, newExpense]);
  };

  const updateExpenseStatus = (expenseId: string, status: 'Approved' | 'Rejected', comments: string) => {
    if (!currentUser || currentUser.role !== 'Reviewer') throw new Error("Unauthorized");
    setExpenses((prev) =>
      prev.map((exp) => {
        if (exp.id === expenseId) {
          const newAuditLog = {
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            action: status === 'Approved' ? 'Approved' : 'Rejected',
            comments,
          };
          return {
            ...exp,
            status,
            auditTrail: [...exp.auditTrail, newAuditLog],
          };
        }
        return exp;
      })
    );
  };

  const getExpensesForBudget = (budgetId: string) => expenses.filter(e => e.budgetId === budgetId);
  const getBudgetById = (budgetId: string) => budgets.find(b => b.id === budgetId);
  const getExpenseById = (expenseId: string) => expenses.find(e => e.id === expenseId);
  const getUserById = (userId: string) => users.find(u => u.id === userId);

  const publicStats = useMemo<PublicStats>(() => {
    const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
    const approvedExpenses = expenses.filter(e => e.status === 'Approved');
    const totalSpent = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);

    const departmentData = DEPARTMENTS.map(department => {
      const departmentBudgets = budgets.filter(b => b.department === department);
      const allocated = departmentBudgets.reduce((sum, b) => sum + b.allocated, 0);
      
      const departmentApprovedExpenses = approvedExpenses.filter(e => {
        const budget = budgets.find(b => b.id === e.budgetId);
        return budget?.department === department;
      });
      const spent = departmentApprovedExpenses.reduce((sum, e) => sum + e.amount, 0);
      const utilization = allocated > 0 ? (spent / allocated) * 100 : 0;
      
      return {
        department,
        allocated,
        spent,
        utilization
      };
    }).filter(d => d.allocated > 0 || d.spent > 0);

    return {
      totalAllocated,
      totalSpent,
      departmentData
    };
  }, [budgets, expenses]);

  const value = {
    users,
    currentUser,
    isLoading,
    login,
    logout,
    signup,
    budgets,
    addBudget,
    expenses,
    addExpense,
    updateExpenseStatus,
    getExpensesForBudget,
    getBudgetById,
    getExpenseById,
    getUserById,
    departments: DEPARTMENTS,
    expenseCategories: EXPENSE_CATEGORIES,
    publicStats,
  };

  return <ClarityContext.Provider value={value}>{children}</ClarityContext.Provider>;
};

// Custom Hook
export const useClarity = () => {
  const context = useContext(ClarityContext);
  if (context === undefined) {
    throw new Error('useClarity must be used within a ClarityProvider');
  }
  return context;
};
