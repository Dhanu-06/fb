'use client';

import type { Budget, Expense, Role, User, PublicStats, SignupData, Institution, PaymentMode, Payment } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { DEPARTMENTS, EXPENSE_CATEGORIES, PAYMENT_MODES } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';


// Context Type
interface ClarityContextType {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  signup: (data: Omit<SignupData, 'institutionId'>) => Promise<User>;
  institutions: Institution[];
  getInstitutionById: (institutionId: string) => Institution | undefined;
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'institutionId'>) => Promise<void>;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'submittedBy' | 'auditTrail' | 'status' | 'institutionId'>) => Promise<void>;
  updateExpenseStatus: (expenseId: string, status: 'Approved' | 'Rejected', comments: string) => Promise<void>;
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'institutionId'>) => Promise<void>;
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
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userQuery = query(collection(db, 'users'), where('id', '==', firebaseUser.uid));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const userData = { id: userDoc.id, ...userDoc.data() } as User;
          setCurrentUser(userData);
          localStorage.setItem('clarity-user', JSON.stringify(userData));
        } else {
            setCurrentUser(null);
            localStorage.removeItem('clarity-user');
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('clarity-user');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!currentUser) {
        setBudgets([]);
        setExpenses([]);
        setPayments([]);
        setInstitutions([]);
        setUsers([]);
        return;
      };

      setIsLoading(true);

      const instId = currentUser.institutionId;

      // Fetch institutions, users, budgets, expenses, payments
      const institutionsQuery = query(collection(db, 'institutions'), where('id', '==', instId));
      const usersQuery = query(collection(db, 'users'), where('institutionId', '==', instId));
      const budgetsQuery = query(collection(db, 'budgets'), where('institutionId', '==', instId));
      const expensesQuery = query(collection(db, 'expenses'), where('institutionId', '==', instId));
      const paymentsQuery = query(collection(db, 'payments'), where('institutionId', '==', instId));
      
      const [instSnap, usersSnap, budgetsSnap, expensesSnap, paymentsSnap] = await Promise.all([
        getDocs(institutionsQuery),
        getDocs(usersQuery),
        getDocs(budgetsQuery),
        getDocs(expensesQuery),
        getDocs(paymentsQuery)
      ]);

      setInstitutions(instSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Institution)));
      setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
      setBudgets(budgetsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget)));
      setExpenses(expensesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
      setPayments(paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment)));

      setIsLoading(false);
    }
    fetchAllData();
  }, [currentUser]);


  const login = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userQuery = query(collection(db, 'users'), where('id', '==', userCredential.user.uid));
    const userSnapshot = await getDocs(userQuery);
    if (userSnapshot.empty) {
        throw new Error("User profile not found in database.");
    }
    const userDoc = userSnapshot.docs[0];
    const userData = { id: userDoc.id, ...userDoc.data() } as User;
    setCurrentUser(userData);
    localStorage.setItem('clarity-user', JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    localStorage.removeItem('clarity-user');
  };

  const signup = async (data: Omit<SignupData, 'institutionId'>): Promise<User> => {
     const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password!);
     const newUser: User = {
        id: userCredential.user.uid,
        name: data.name,
        email: data.email,
        role: data.role,
        institutionId: 'inst-1', // Default institution for new signups
    };
    await addDoc(collection(db, "users"), newUser);
    return newUser;
  };

  const getInstitutionById = (id: string) => institutions.find(i => i.id === id);

  const addBudget = async (budgetData: Omit<Budget, 'id' | 'institutionId'>) => {
    if (!currentUser) throw new Error("No user logged in");
    const newBudget: Omit<Budget, 'id'> = {
      ...budgetData,
      institutionId: currentUser.institutionId,
    };
    await addDoc(collection(db, 'budgets'), newBudget);
  };
  
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'submittedBy' | 'auditTrail' | 'status' | 'institutionId'>) => {
    if (!currentUser) throw new Error("No user logged in");
    const newExpense: Omit<Expense, 'id'> = {
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
    await addDoc(collection(db, 'expenses'), newExpense);
  };
  
  const addPayment = async (paymentData: Omit<Payment, 'id' | 'institutionId'>) => {
    if (!currentUser) throw new Error("No user logged in");
    const newPayment: Omit<Payment, 'id'> = {
        ...paymentData,
        institutionId: currentUser.institutionId,
    };
    await addDoc(collection(db, 'payments'), newPayment);
  };

  const updateExpenseStatus = async (expenseId: string, status: 'Approved' | 'Rejected', comments: string) => {
    if (!currentUser || currentUser.role !== 'Reviewer') throw new Error("Unauthorized");
    
    const expenseRef = doc(db, 'expenses', expenseId);
    const currentExpense = expenses.find(e => e.id === expenseId);
    if (!currentExpense) throw new Error("Expense not found");
    if(currentExpense.institutionId !== currentUser.institutionId) throw new Error("Unauthorized: You can only review expenses for your own institution.");

    const newAuditLog = {
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        action: status as 'Approved' | 'Rejected',
        comments,
    };

    await updateDoc(expenseRef, {
        status: status,
        auditTrail: [...currentExpense.auditTrail, newAuditLog]
    });
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
