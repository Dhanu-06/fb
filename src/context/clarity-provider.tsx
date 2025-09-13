'use client';

import type { Budget, Expense, Role, User, PublicStats, SignupData, Institution, PaymentMode, Payment } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { DEPARTMENTS, EXPENSE_CATEGORIES, PAYMENT_MODES } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Initial Data
const initialInstitutions: Institution[] = [
    { id: 'inst-1', name: 'Clarity University' }
];

const initialUsers: User[] = [
  { id: 'user-1', name: 'Admin User', role: 'Admin', email: 'admin@clarity.com', institutionId: 'inst-1' },
  { id: 'user-2', name: 'Dr. Evelyn Reed', role: 'Reviewer', email: 'reviewer@clarity.com', institutionId: 'inst-1' },
];

const initialBudgets: Budget[] = [
    { id: 'budget-1', institutionId: 'inst-1', title: 'Annual Library Fund', allocated: 500000, department: 'Library' },
    { id: 'budget-2', institutionId: 'inst-1', title: 'University Sports Budget', allocated: 1200000, department: 'Sports' },
    { id: 'budget-3', institutionId: 'inst-1', title: 'Campus Food Services', allocated: 800000, department: 'Food' },
    { id: 'budget-4', institutionId: 'inst-1', title: 'Lab Equipment & Supplies', allocated: 2500000, department: 'Lab' },
    { id: 'budget-5', institutionId: 'inst-1', title: 'Annual Tech Fest "Innovate"', allocated: 750000, department: 'Events' },
    { id: 'budget-6', institutionId: 'inst-1', title: 'New Building Construction Phase 1', allocated: 50000000, department: 'Infrastructure & Construction' },
    { id: 'budget-7', institutionId: 'inst-1', title: 'Faculty Development Programs', allocated: 600000, department: 'Academics' },
    { id: 'budget-8', institutionId: 'inst-1', title: 'Administrative Overhead', allocated: 1500000, department: 'Administration' },
];

const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    institutionId: 'inst-1',
    title: 'New Books for Fall Semester',
    amount: 150000,
    category: 'Supplies',
    vendor: 'Global Book Publishers',
    date: '2023-08-15T10:00:00.000Z',
    receiptUrl: PlaceHolderImages.find(p => p.id === 'receipt-placeholder')?.imageUrl,
    budgetId: 'budget-1',
    submittedBy: 'user-1',
    status: 'Approved',
    paymentMode: 'Bank Transfer',
    transactionReference: 'TXN73628462',
    auditTrail: [
      { timestamp: '2023-08-15T10:00:00.000Z', userId: 'user-1', action: 'Created', comments: 'Submitted for approval' },
      { timestamp: '2023-08-16T11:30:00.000Z', userId: 'user-2', action: 'Approved', comments: 'Approved' },
    ],
  },
  {
    id: 'exp-2',
    institutionId: 'inst-1',
    title: 'New Cricket Kit',
    amount: 85000,
    category: 'Equipment',
    vendor: 'Sports Emporium',
    date: '2023-09-01T14:20:00.000Z',
    receiptUrl: PlaceHolderImages.find(p => p.id === 'receipt-placeholder')?.imageUrl,
    budgetId: 'budget-2',
    submittedBy: 'user-1',
    status: 'Submitted',
    paymentMode: 'Cheque',
    transactionReference: 'CQ198347',
    auditTrail: [{ timestamp: '2023-09-01T14:20:00.000Z', userId: 'user-1', action: 'Created', comments: 'Urgent requirement for team' }],
  },
   {
    id: 'exp-3',
    institutionId: 'inst-1',
    title: 'Catering for Orientation Week',
    amount: 120000,
    category: 'Services',
    vendor: 'Campus Catering Co.',
    date: '2023-08-20T12:00:00.000Z',
    receiptUrl: PlaceHolderImages.find(p => p.id === 'receipt-placeholder')?.imageUrl,
    budgetId: 'budget-3',
    submittedBy: 'user-1',
    status: 'Approved',
    paymentMode: 'UPI',
    transactionReference: 'UPI-982374923',
    auditTrail: [
      { timestamp: '2023-08-20T12:05:00.000Z', userId: 'user-1', action: 'Created', comments: 'Submitted for approval' },
      { timestamp: '2023-08-21T09:00:00.000Z', userId: 'user-2', action: 'Approved', comments: 'Looks good.' },
    ],
  },
  {
    id: 'exp-4',
    institutionId: 'inst-1',
    title: 'Microscopes for Biology Lab',
    amount: 450000,
    category: 'Equipment',
    vendor: 'Scientific Instruments Inc.',
    date: '2023-09-05T16:00:00.000Z',
    receiptUrl: PlaceHolderImages.find(p => p.id === 'receipt-placeholder')?.imageUrl,
    budgetId: 'budget-4',
    submittedBy: 'user-1',
    status: 'Submitted',
    paymentMode: 'Bank Transfer',
    auditTrail: [{ timestamp: '2023-09-05T16:00:00.000Z', userId: 'user-1', action: 'Created', comments: 'New equipment as per syllabus change' }],
  },
  {
    id: 'exp-5',
    institutionId: 'inst-1',
    title: 'Marketing for Innovate 2023',
    amount: 75000,
    category: 'Services',
    vendor: 'Creative Ads Agency',
    date: '2023-09-10T11:00:00.000Z',
    receiptUrl: PlaceHolderImages.find(p => p.id === 'receipt-placeholder')?.imageUrl,
    budgetId: 'budget-5',
    submittedBy: 'user-1',
    status: 'Rejected',
    paymentMode: 'Card',
    auditTrail: [
      { timestamp: '2023-09-10T11:00:00.000Z', userId: 'user-1', action: 'Created', comments: 'Marketing expense' },
      { timestamp: '2023-09-11T15:00:00.000Z', userId: 'user-2', action: 'Rejected', comments: 'Quote is too high. Please get more quotes.' },
    ],
  },
   {
    id: 'exp-6',
    institutionId: 'inst-1',
    title: 'Steel and Cement for New Block',
    amount: 12500000,
    category: 'Supplies',
    vendor: 'National Steel & Cement',
    date: '2023-07-20T10:00:00.000Z',
    receiptUrl: PlaceHolderImages.find(p => p.id === 'receipt-placeholder')?.imageUrl,
    budgetId: 'budget-6',
    submittedBy: 'user-1',
    status: 'Approved',
    paymentMode: 'Bank Transfer',
    transactionReference: 'TXN-CONST-001',
    auditTrail: [
      { timestamp: '2023-07-20T10:00:00.000Z', userId: 'user-1', action: 'Created', comments: 'Initial raw material procurement' },
      { timestamp: '2023-07-21T11:30:00.000Z', userId: 'user-2', action: 'Approved', comments: 'Approved' },
    ],
  },
];

const initialPayments: Payment[] = [
    {
        id: 'pay-1',
        institutionId: 'inst-1',
        payerName: 'Rohan Sharma',
        studentId: 'S54321',
        amount: 75000,
        paymentMode: 'UPI',
        transactionReference: 'UPI-STU-82736482',
        receiptUrl: PlaceHolderImages.find(p => p.id === 'receipt-placeholder')?.imageUrl,
        createdAt: '2023-09-01T10:00:00Z',
    },
    {
        id: 'pay-2',
        institutionId: 'inst-1',
        payerName: 'State Education Grant',
        amount: 500000,
        paymentMode: 'Bank Transfer',
        transactionReference: 'GRT-82736482',
        createdAt: '2023-08-15T10:00:00Z',
    }
]


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
  addExpense: (expense: Omit<Expense, 'id' | 'submittedBy' | 'auditTrail' | 'status' | 'institutionId'>) => Promise<void>;
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
    // Simulate checking auth status
    const storedUser = localStorage.getItem('clarity-user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);


  const login = async (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = users.find(u => u.email === email);
            if (user) {
                setCurrentUser(user);
                localStorage.setItem('clarity-user', JSON.stringify(user));
                resolve(user);
            } else {
                reject(new Error("Invalid email or password"));
            }
        }, 500)
    })
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('clarity-user');
  };

  const signup = async (data: SignupData): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (users.find(u => u.email === data.email)) {
                return reject(new Error("User with this email already exists."));
            }
            const newUser: User = {
                id: `user-${Date.now()}`,
                ...data,
                password: '', // Don't store password
            };
            setUsers(prev => [...prev, newUser]);
            resolve(newUser);
        }, 500);
    });
  };
  
  const getInstitutionById = (id: string) => institutions.find(i => i.id === id);

  const addBudget = async (budgetData: Omit<Budget, 'id' | 'institutionId'>) => {
    if (!currentUser) throw new Error("No user logged in");
    const newBudget: Budget = {
      id: `budget-${Date.now()}`,
      institutionId: currentUser.institutionId,
      ...budgetData,
    };
    setBudgets(prev => [...prev, newBudget]);
  };
  
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'submittedBy' | 'auditTrail' | 'status' | 'institutionId'>) => {
    if (!currentUser) throw new Error("No user logged in");

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      institutionId: currentUser.institutionId,
      submittedBy: currentUser.id,
      status: 'Submitted',
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          userId: currentUser.id,
          action: 'Created',
          comments: 'Expense submitted',
        },
      ],
      ...expenseData,
    };

    setExpenses(prev => [...prev, newExpense]);
  };
  
  const addPayment = async (paymentData: Omit<Payment, 'id'|'institutionId'>) => {
      if (!currentUser) throw new Error("No user logged in");
      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        institutionId: currentUser.institutionId,
        ...paymentData
      };
      setPayments(prev => [...prev, newPayment]);
  }

  const updateExpenseStatus = async (expenseId: string, status: 'Approved' | 'Rejected', comments: string) => {
    if (!currentUser || (currentUser.role !== 'Reviewer' && currentUser.role !== 'Admin')) return;
    
    setExpenses(prev =>
      prev.map(exp => {
        if (exp.id === expenseId) {
          const newAuditLog: AuditLog = {
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            action: status,
            comments,
          };
          return { ...exp, status, auditTrail: [...exp.auditTrail, newAuditLog] };
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
  
  const fetchAllPublicData = async () => {
    // Simulate fetching all data for public view
    return Promise.resolve({
      institutions: initialInstitutions,
      budgets: initialBudgets,
      expenses: initialExpenses.filter(e => e.status === 'Approved'),
    });
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
    budgets,
    addBudget,
    expenses,
    addExpense,
    updateExpenseStatus,
    payments,
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
    seedDatabase: async () => console.log("Seeding not available in mock mode."),
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
