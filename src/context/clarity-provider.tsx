'use client';

import type { Budget, Expense, Role, User, PublicStats, SignupData, Institution, PaymentMode, Payment } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { DEPARTMENTS, EXPENSE_CATEGORIES, PAYMENT_MODES } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Initial Data
const initialInstitutions: Institution[] = [
    { id: 'inst-1', name: 'Clarity University' },
    { id: 'inst-2', name: 'Sunshine Public School' }
];

const initialUsers: User[] = [
  { id: 'user-1', name: 'Admin User', role: 'Admin', email: 'admin@example.com', institutionId: 'inst-1' },
  { id: 'user-2', name: 'Reviewer User', role: 'Reviewer', email: 'reviewer@example.com', institutionId: 'inst-1' },
  { id: 'user-3', name: 'Public User', role: 'Public', email: 'public@example.com', institutionId: 'inst-1' },
  { id: 'user-4', name: 'Admin User 2', role: 'Admin', email: 'admin2@example.com', institutionId: 'inst-1' },
  { id: 'user-5', name: 'Admin Three', role: 'Admin', email: 'admin3@example.com', institutionId: 'inst-2' },
];

const initialBudgets: Budget[] = [
  { id: 'bud-1', title: 'Library Renovation', allocated: 500000, department: 'Library', institutionId: 'inst-1' },
  { id: 'bud-2', title: 'Annual Sports Meet', allocated: 250000, department: 'Sports', institutionId: 'inst-1' },
  { id: 'bud-3', title: 'Cafeteria Upgrade', allocated: 750000, department: 'Food', institutionId: 'inst-1' },
  { id: 'bud-4', title: 'Science Fair 2024', allocated: 150000, department: 'Lab', institutionId: 'inst-2' },
];

const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    title: 'New Books Purchase',
    amount: 75000,
    category: 'Supplies',
    vendor: 'Book World Inc.',
    date: '2024-05-10T10:00:00Z',
    receiptUrl: PlaceHolderImages.find(p => p.id === 'receipt-placeholder')?.imageUrl,
    budgetId: 'bud-1',
    institutionId: 'inst-1',
    submittedBy: 'user-1',
    status: 'Approved',
    paymentMode: 'Bank Transfer',
    transactionReference: 'NEFT12345',
    auditTrail: [
      { timestamp: '2024-05-10T10:00:00Z', userId: 'user-1', action: 'Created' },
      { timestamp: '2024-05-11T14:30:00Z', userId: 'user-2', action: 'Approved', comments: 'Invoice and delivery receipt verified.' },
    ],
  },
  {
    id: 'exp-2',
    title: 'Catering for Sports Finals',
    amount: 50000,
    category: 'Services',
    vendor: 'Tasty Bites Catering',
    date: '2024-05-15T12:00:00Z',
    receiptUrl: PlaceHolderImages.find(p => p.id === 'receipt-placeholder')?.imageUrl,
    budgetId: 'bud-2',
    institutionId: 'inst-1',
    submittedBy: 'user-1',
    status: 'Submitted',
    paymentMode: 'UPI',
    transactionReference: 'UPI98765',
    auditTrail: [{ timestamp: '2024-05-15T12:00:00Z', userId: 'user-1', action: 'Created' }],
  },
   {
    id: 'exp-3',
    title: 'Lab Equipment',
    amount: 10000,
    category: 'Equipment',
    vendor: 'Science Supply Co.',
    date: '2024-05-20T12:00:00Z',
    receiptUrl: PlaceHolderImages.find(p => p.id === 'receipt-placeholder')?.imageUrl,
    budgetId: 'bud-4',
    institutionId: 'inst-2',
    submittedBy: 'user-5',
    status: 'Approved',
    paymentMode: 'Cheque',
    transactionReference: 'CQ123456',
    auditTrail: [{ timestamp: '2024-05-20T12:00:00Z', userId: 'user-5', action: 'Created' }, { timestamp: '2024-05-21T12:00:00Z', userId: 'user-5', action: 'Approved' }],
  },
  {
    id: 'exp-4',
    title: 'New Kitchen Stove',
    amount: 120000,
    category: 'Equipment',
    vendor: 'Kitchen Solutions Ltd.',
    date: '2024-06-01T09:00:00Z',
    receiptUrl: PlaceHolderImages.find(p => p.id === 'receipt-placeholder')?.imageUrl,
    budgetId: 'bud-3',
    institutionId: 'inst-1',
    submittedBy: 'user-4',
    status: 'Rejected',
    paymentMode: 'Bank Transfer',
    transactionReference: 'NEFT67890',
    auditTrail: [
      { timestamp: '2024-06-01T09:00:00Z', userId: 'user-4', action: 'Created' },
      { timestamp: '2024-06-02T11:00:00Z', userId: 'user-2', action: 'Rejected', comments: 'Quote is too high. Please get competitive bids.' },
    ],
  },
  {
    id: 'exp-5',
    title: 'Medals and Trophies',
    amount: 30000,
    category: 'Miscellaneous',
    vendor: 'Awards & Recognition',
    date: '2024-06-05T15:00:00Z',
    receiptUrl: PlaceHolderImages.find(p => p.id === 'receipt-placeholder')?.imageUrl,
    budgetId: 'bud-2',
    institutionId: 'inst-1',
    submittedBy: 'user-1',
    status: 'Submitted',
    paymentMode: 'Cash',
    auditTrail: [{ timestamp: '2024-06-05T15:00:00Z', userId: 'user-1', action: 'Created' }],
  },
];

const initialPayments: Payment[] = [
    {
        id: 'pay-1',
        payerName: 'John Doe',
        studentId: 'S123',
        amount: 5000,
        paymentMode: 'UPI',
        transactionReference: 'UPI123',
        receiptUrl: PlaceHolderImages.find(p => p.id === 'receipt-placeholder')?.imageUrl,
        createdAt: new Date().toISOString(),
        institutionId: 'inst-1'
    }
];

// Context Type
interface ClarityContextType {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  signup: (data: SignupData) => Promise<User>;
  institutions: Institution[];
  getInstitutionById: (institutionId: string) => Institution | undefined;
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'| 'institutionId'>) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'submittedBy' | 'auditTrail' | 'status' | 'institutionId'>) => void;
  updateExpenseStatus: (expenseId: string, status: 'Approved' | 'Rejected', comments: string) => void;
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'|'institutionId'>) => void;
  getExpensesForBudget: (budgetId: string) => Expense[];
  getBudgetById: (budgetId: string) => Budget | undefined;
  getExpenseById: (expenseId: string) => Expense | undefined;
  getUserById: (userId: string) => User | undefined;
  departments: string[];
  expenseCategories: string[];
  paymentModes: PaymentMode[];
  publicStats: PublicStats;
  fetchAllPublicData: () => Promise<{ institutions: Institution[], budgets: Budget[], expenses: Expense[] }>;
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
    // Simulate checking for a logged-in user
    const loggedInUserEmail = localStorage.getItem('clarity-user');
    if (loggedInUserEmail) {
      const user = users.find(u => u.email === loggedInUserEmail);
      setCurrentUser(user || null);
    }
    setIsLoading(false);
  }, [users]);


  const login = (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.email === email); // Password check is omitted for demo
        if (user) {
          localStorage.setItem('clarity-user', user.email);
          setCurrentUser(user);
          resolve(user);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500);
    });
  };

  const logout = () => {
    localStorage.removeItem('clarity-user');
    setCurrentUser(null);
  };

  const signup = (data: SignupData): Promise<User> => {
     return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (users.some(u => u.email === data.email)) {
          reject(new Error('User with this email already exists.'));
          return;
        }
        const newUser: User = {
          id: `user-${Date.now()}`,
          ...data,
        };
        setUsers(prev => [...prev, newUser]);
        resolve(newUser);
      }, 500);
    });
  };
  
  const getInstitutionById = (id: string) => institutions.find(i => i.id === id);
  const currentUserInstitution = getInstitutionById(currentUser?.institutionId || '');


  const addBudget = (budgetData: Omit<Budget, 'id' | 'institutionId'>) => {
    if (!currentUser) throw new Error("No user logged in");
    const newBudget: Budget = {
      id: `bud-${Date.now()}`,
      ...budgetData,
      institutionId: currentUser.institutionId,
    };
    setBudgets(prev => [...prev, newBudget]);
  };
  
  const addExpense = (expenseData: Omit<Expense, 'id' | 'submittedBy' | 'auditTrail' | 'status' | 'institutionId'>) => {
    if (!currentUser) throw new Error("No user logged in");
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      ...expenseData,
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
    setExpenses(prev => [...prev, newExpense]);
  };
  
  const addPayment = (paymentData: Omit<Payment, 'id'|'institutionId'>) => {
      if (!currentUser) throw new Error("No user logged in");
        const newPayment: Payment = {
            id: `pay-${Date.now()}`,
            ...paymentData,
            institutionId: currentUser.institutionId,
        };
        setPayments(prev => [...prev, newPayment]);
  }

  const updateExpenseStatus = (expenseId: string, status: 'Approved' | 'Rejected', comments: string) => {
    if (!currentUser || (currentUser.role !== 'Reviewer' && currentUser.role !== 'Admin')) return;
    
    setExpenses(prev =>
      prev.map(exp => {
        if (exp.id === expenseId && exp.institutionId === currentUser.institutionId) {
          return {
            ...exp,
            status,
            auditTrail: [
              ...exp.auditTrail,
              {
                timestamp: new Date().toISOString(),
                userId: currentUser.id,
                action: status,
                comments: comments,
              },
            ],
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
  
  // Memoize the data filtered by the current user's institution
  const institutionBudgets = useMemo(() => budgets.filter(b => b.institutionId === currentUser?.institutionId), [budgets, currentUser]);
  const institutionExpenses = useMemo(() => expenses.filter(e => e.institutionId === currentUser?.institutionId), [expenses, currentUser]);
  const institutionPayments = useMemo(() => payments.filter(p => p.institutionId === currentUser?.institutionId), [payments, currentUser]);


  const fetchAllPublicData = async () => {
    return { institutions: initialInstitutions, budgets: initialBudgets, expenses: initialExpenses.filter(e => e.status === 'Approved') };
  };

  const value = {
    users,
    currentUser,
    isLoading,
    login,
    logout,
    signup,
    institutions,
    getInstitutionById,
    budgets: institutionBudgets,
    addBudget,
    expenses: institutionExpenses,
    addExpense,
    updateExpenseStatus,
    payments: institutionPayments,
    addPayment,
    getExpensesForBudget,
    getBudgetById,
    getExpenseById,
    getUserById,
    departments: DEPARTMENTS,
    expenseCategories: EXPENSE_CATEGORIES,
    paymentModes: PAYMENT_MODES,
    publicStats,
    fetchAllPublicData,
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
