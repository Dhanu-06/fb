'use client';

import type { Budget, Expense, Role, User, PublicStats, SignupData, Institution, PaymentMode, Payment, ExpenseStatus, AuditLogAction } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { DEPARTMENTS, EXPENSE_CATEGORIES, PAYMENT_MODES } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';


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
  addBudget: (budget: Omit<Budget, 'id' | 'institutionId'>) => Promise<void>;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'submittedBy' | 'auditTrail' | 'status' | 'institutionId'>) => Promise<void>;
  updateExpenseStatus: (expenseId: string, status: ExpenseStatus, comments: string) => Promise<void>;
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
      setIsLoading(true);
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          const userData = { id: userSnapshot.id, ...userSnapshot.data() } as User;
          setCurrentUser(userData);
        } else {
            console.error("No user profile found in Firestore for UID:", firebaseUser.uid);
            setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!currentUser) {
        // Clear data if no user is logged in
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
      try {
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
      } catch (error) {
          console.error("Error fetching data:", error);
      } finally {
        // This isLoading(false) was inside onAuthStateChanged, moved here to signal data loading is done.
        setIsLoading(false);
      }
    }

    fetchAllData();
  }, [currentUser]);


  const login = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userSnapshot = await getDoc(userDocRef);
    if (!userSnapshot.exists()) {
        throw new Error("User profile not found in database.");
    }
    const userData = { id: userSnapshot.id, ...userSnapshot.data() } as User;
    // No need to set current user here, onAuthStateChanged will handle it.
    return userData;
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const signup = async (data: SignupData): Promise<User> => {
     const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password!);
     const newUser: Omit<User, 'id'> = {
        name: data.name,
        email: data.email,
        role: data.role,
        institutionId: data.institutionId,
    };
    // Use the user's UID as the document ID in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), newUser);
    return { id: userCredential.user.uid, ...newUser };
  };

  const getInstitutionById = (id: string) => institutions.find(i => i.id === id);

  const addBudget = async (budgetData: Omit<Budget, 'id' | 'institutionId'>) => {
    if (!currentUser) throw new Error("No user logged in");
    const newBudget: Omit<Budget, 'id'> = {
      ...budgetData,
      institutionId: currentUser.institutionId,
    };
    const docRef = await addDoc(collection(db, 'budgets'), newBudget);
    setBudgets(prev => [...prev, {id: docRef.id, ...newBudget} as Budget]);
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
    const docRef = await addDoc(collection(db, 'expenses'), newExpense);
    setExpenses(prev => [...prev, {id: docRef.id, ...newExpense} as Expense]);
  };
  
  const addPayment = async (paymentData: Omit<Payment, 'id' | 'institutionId'>) => {
    if (!currentUser) throw new Error("No user logged in");
    const newPayment: Omit<Payment, 'id'> = {
        ...paymentData,
        institutionId: currentUser.institutionId,
    };
    const docRef = await addDoc(collection(db, 'payments'), newPayment);
    setPayments(prev => [...prev, {id: docRef.id, ...newPayment} as Payment]);
  };

  const updateExpenseStatus = async (expenseId: string, status: ExpenseStatus, comments: string) => {
    if (!currentUser || (currentUser.role !== 'Reviewer' && currentUser.role !== 'Admin')) throw new Error("Unauthorized");
    
    const expenseDocRef = doc(db, 'expenses', expenseId);
    const expenseSnapshot = await getDoc(expenseDocRef);

    if (!expenseSnapshot.exists()) throw new Error("Expense not found");
    const currentExpense = expenseSnapshot.data() as Expense;
    if(currentExpense.institutionId !== currentUser.institutionId) throw new Error("Unauthorized: You can only review expenses for your own institution.");

    const newAuditLog: { timestamp: string; userId: string; action: AuditLogAction; comments?: string } = {
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        action: status,
    };

    if (comments) {
      newAuditLog.comments = comments;
    }

    const updatedAuditTrail = [...currentExpense.auditTrail, newAuditLog];

    await updateDoc(expenseDocRef, {
        status: status,
        auditTrail: updatedAuditTrail
    });

    setExpenses(prev => prev.map(exp => exp.id === expenseId ? {...exp, status, auditTrail: updatedAuditTrail} : exp));
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
