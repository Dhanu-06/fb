'use client';

import type { Budget, Expense, Role, User, PublicStats, SignupData, Institution, PaymentMode, Payment } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { DEPARTMENTS, EXPENSE_CATEGORIES, PAYMENT_MODES } from '@/lib/types';

// Mock Data
const initialInstitutions: Institution[] = [
    { id: 'inst-1', name: 'Global Tech University' },
    { id: 'inst-2', name: 'City College of Arts' },
    { id: 'inst-3', name: 'Sunshine Public School' },
]

const initialUsers: User[] = [
  { id: 'user-1', name: 'Admin User', role: 'Admin', email: 'admin@example.com', password: 'password', institutionId: 'inst-1' },
  { id: 'user-2', name: 'Reviewer User', role: 'Reviewer', email: 'reviewer@example.com', password: 'password', institutionId: 'inst-1' },
  { id: 'user-3', name: 'Public User', role: 'Public', email: 'public@example.com', password: 'password', institutionId: 'inst-1' },
  { id: 'user-4', name: 'Admin from another institution', role: 'Admin', email: 'admin2@example.com', password: 'password', institutionId: 'inst-2' },
  { id: 'user-5', name: 'Sunshine Admin', role: 'Admin', email: 'admin3@example.com', password: 'password', institutionId: 'inst-3' },
];

const initialBudgets: Budget[] = [
  { id: 'budget-1', title: 'Annual Fest 2025', allocated: 500000, department: 'Events', institutionId: 'inst-1' },
  { id: 'budget-2', title: 'Library Acquisition Q3', allocated: 1000000, department: 'Library', institutionId: 'inst-1' },
  { id: 'budget-3', title: 'Sports Equipment 2025', allocated: 750000, department: 'Sports', institutionId: 'inst-1' },
  { id: 'budget-4', title: 'Art Exhibition Materials', allocated: 200000, department: 'Academics', institutionId: 'inst-2' },
  { id: 'budget-5', title: 'Annual Day Celebration', allocated: 300000, department: 'Events', institutionId: 'inst-3' },
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
    institutionId: 'inst-1',
    submittedBy: 'user-1',
    status: 'Approved',
    receiptUrl: 'https://picsum.photos/seed/receipt1/400/600',
    paymentMode: 'Bank Transfer',
    transactionReference: 'BT-987654321',
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
    institutionId: 'inst-1',
    submittedBy: 'user-1',
    status: 'Submitted',
    receiptUrl: 'https://picsum.photos/seed/receipt2/400/600',
    paymentMode: 'Cheque',
    transactionReference: 'Cheque #123456',
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
    institutionId: 'inst-1',
    submittedBy: 'user-1',
    status: 'Rejected',
    receiptUrl: 'https://picsum.photos/seed/receipt3/400/600',
    paymentMode: 'UPI',
    transactionReference: 'UPI-abc@okbank',
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
  {
    id: 'exp-4',
    title: 'Science Lab Chemicals',
    amount: 45000,
    category: 'Supplies',
    vendor: 'Chem Supplies Co.',
    date: new Date('2024-08-05T11:00:00Z').toISOString(),
    budgetId: 'budget-5',
    institutionId: 'inst-3',
    submittedBy: 'user-5',
    status: 'Submitted',
    receiptUrl: 'https://picsum.photos/seed/receipt4/400/600',
    paymentMode: 'Bank Transfer',
    transactionReference: 'BT-1122334455',
    auditTrail: [{ timestamp: new Date('2024-08-05T11:00:00Z').toISOString(), userId: 'user-5', action: 'Created' }],
  },
];

const initialPayments: Payment[] = [];

// Context Type
interface ClarityContextType {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => User;
  logout: () => void;
  signup: (data: Omit<SignupData, 'institutionId'>) => User;
  institutions: Institution[];
  getInstitutionById: (institutionId: string) => Institution | undefined;
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'institutionId'>) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'submittedBy' | 'auditTrail' | 'status' | 'institutionId'>) => void;
  updateExpenseStatus: (expenseId: string, status: 'Approved' | 'Rejected', comments: string) => void;
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'institutionId'>) => void;
  getExpensesForBudget: (budgetId: string) => Expense[];
  getBudgetById: (budgetId: string) => Budget | undefined;
  getExpenseById: (expenseId: string) => Expense | undefined;
  getUserById: (userId: string) => User | undefined;
  departments: string[];
  expenseCategories: string[];
  paymentModes: PaymentMode[];
  publicStats: PublicStats;
}

const ClarityContext = createContext<ClarityContextType | undefined>(undefined);

// Provider Component
export const ClarityProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [institutions, setInstitutions] = useState<Institution[]>(initialInstitutions);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);

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

  const signup = (data: Omit<SignupData, 'institutionId'>): User => {
    if (users.some(u => u.email === data.email)) {
      throw new Error("User with this email already exists.");
    }
    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`,
      institutionId: 'inst-1', // Default institution for new signups
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const getInstitutionById = (id: string) => institutions.find(i => i.id === id);

  const addBudget = (budgetData: Omit<Budget, 'id' | 'institutionId'>) => {
    if (!currentUser) throw new Error("No user logged in");
    const newBudget: Budget = {
      ...budgetData,
      id: `budget-${Date.now()}`,
      institutionId: currentUser.institutionId,
    };
    setBudgets((prev) => [...prev, newBudget]);
  };
  
  const addExpense = (expenseData: Omit<Expense, 'id' | 'submittedBy' | 'auditTrail' | 'status' | 'institutionId'>) => {
    if (!currentUser) throw new Error("No user logged in");
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      submittedBy: currentUser.id,
      institutionId: currentUser.institutionId,
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
  
  const addPayment = (paymentData: Omit<Payment, 'id' | 'institutionId'>) => {
    if (!currentUser) throw new Error("No user logged in");
    const newPayment: Payment = {
        ...paymentData,
        id: `pay-${Date.now()}`,
        institutionId: currentUser.institutionId,
    };
    setPayments((prev) => [...prev, newPayment]);
  };

  const updateExpenseStatus = (expenseId: string, status: 'Approved' | 'Rejected', comments: string) => {
    if (!currentUser || currentUser.role !== 'Reviewer') throw new Error("Unauthorized");
    setExpenses((prev) =>
      prev.map((exp) => {
        if (exp.id === expenseId) {
          // Ensure reviewer is from the same institution
          if(exp.institutionId !== currentUser.institutionId) throw new Error("Unauthorized: You can only review expenses for your own institution.");

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
    const relevantBudgets = budgets.filter(b => b.institutionId === currentUser?.institutionId)
    const relevantExpenses = expenses.filter(e => e.institutionId === currentUser?.institutionId)

    const totalAllocated = relevantBudgets.reduce((sum, b) => sum + b.allocated, 0);
    const approvedExpenses = relevantExpenses.filter(e => e.status === 'Approved');
    const totalSpent = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);

    const departmentData = DEPARTMENTS.map(department => {
      const departmentBudgets = relevantBudgets.filter(b => b.department === department);
      const allocated = departmentBudgets.reduce((sum, b) => sum + b.allocated, 0);
      
      const departmentApprovedExpenses = approvedExpenses.filter(e => {
        const budget = relevantBudgets.find(b => b.id === e.budgetId);
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
  }, [budgets, expenses, currentUser]);

  const value = {
    users,
    currentUser,
    isLoading,
    login,
    logout,
    signup,
    institutions,
    getInstitutionById,
    budgets: currentUser ? budgets.filter(b => b.institutionId === currentUser.institutionId) : [],
    addBudget,
    expenses: currentUser ? expenses.filter(e => e.institutionId === currentUser.institutionId) : [],
    addExpense,
    updateExpenseStatus,
    payments: currentUser ? payments.filter(p => p.institutionId === currentUser.institutionId) : [],
    addPayment,
    getExpensesForBudget,
    getBudgetById,
    getExpenseById,
    getUserById,
    departments: DEPARTMENTS,
    expenseCategories: EXPENSE_CATEGORIES,
    paymentModes: PAYMENT_MODES,
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
