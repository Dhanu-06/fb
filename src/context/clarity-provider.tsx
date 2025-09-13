
'use client';

import type { Budget, Expense, Role, User, PublicStats, SignupData, Institution, PaymentMode, Payment, AuditLog, Feedback } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { DEPARTMENTS, EXPENSE_CATEGORIES, PAYMENT_MODES } from '@/lib/types';
import { auth, db, storage } from '@/lib/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    signOut,
    User as FirebaseUser
} from 'firebase/auth';
import { 
    doc, 
    setDoc, 
    getDoc, 
    addDoc, 
    collection, 
    query, 
    where, 
    getDocs,
    Timestamp,
    updateDoc,
    writeBatch
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => void;
}

const ClarityContext = createContext<ClarityContextType | undefined>(undefined);

// Provider Component
export const ClarityProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const fetchUserData = useCallback(async (uid: string) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setCurrentUser({ ...userData, id: uid });
        
        // Fetch institution-specific data
        const instId = userData.institutionId;
        if (instId) {
            const [instSnap, budgetsSnap, expensesSnap, paymentsSnap, usersSnap] = await Promise.all([
                getDoc(doc(db, 'institutions', instId)),
                getDocs(query(collection(db, 'budgets'), where('institutionId', '==', instId))),
                getDocs(query(collection(db, 'expenses'), where('institutionId', '==', instId))),
                getDocs(query(collection(db, 'payments'), where('institutionId', '==', instId))),
                getDocs(query(collection(db, 'users'), where('institutionId', '==', instId))),
            ]);
            
            if (instSnap.exists()) {
                setInstitutions([{ id: instSnap.id, ...instSnap.data() } as Institution]);
            }
            setBudgets(budgetsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Budget)));
            setExpenses(expensesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Expense)));
            setPayments(paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Payment)));
            setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
        }
        return { ...userData, id: uid };
    }
    return null;
  }, []);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setIsLoading(true);
        setFirebaseUser(user);
        if (user) {
            await fetchUserData(user.uid);
        } else {
            setCurrentUser(null);
            // Clear data
            setInstitutions([]);
            setBudgets([]);
            setExpenses([]);
            setPayments([]);
            setUsers([]);
        }
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserData]);


  const login = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    if (!user) throw new Error("Login failed: no user returned");

    const userData = await fetchUserData(user.uid);
    if (!userData) throw new Error("User profile not found in database.");

    return userData;
  };

  const logout = () => {
    return signOut(auth);
  };

  const signup = async (data: SignupData): Promise<User> => {
    const { email, password, ...rest } = data;
    if (!password) throw new Error("Password is required for signup.");
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const newUser: Omit<User, 'id'> = {
        ...rest,
        email,
    };
    
    await setDoc(doc(db, 'users', user.uid), newUser);

    // If it's the first user, create the institution
    const institutionSnap = await getDoc(doc(db, 'institutions', data.institutionId));
    if (!institutionSnap.exists()) {
        await setDoc(doc(db, 'institutions', data.institutionId), {
            name: 'Clarity University',
        });
    }

    return { ...newUser, id: user.uid };
  };
  
  const getInstitutionById = (id: string) => institutions.find(i => i.id === id);

  const addBudget = async (budgetData: Omit<Budget, 'id' | 'institutionId'>) => {
    if (!currentUser) throw new Error("No user logged in");
    
    const newBudgetData = {
        ...budgetData,
        institutionId: currentUser.institutionId,
    };

    const docRef = await addDoc(collection(db, 'budgets'), newBudgetData);
    setBudgets(prev => [...prev, { ...newBudgetData, id: docRef.id } as Budget]);
  };
  
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'submittedBy' | 'auditTrail' | 'status' | 'institutionId'>) => {
    if (!currentUser) throw new Error("No user logged in");

    const receiptDataUri = expenseData.receiptUrl;
    const placeholderReceipt = PlaceHolderImages.find(p => p.id === 'receipt-placeholder')?.imageUrl || '';

    const newExpenseData: Omit<Expense, 'id'> = {
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
      receiptUrl: '', // Initially set to empty
      date: Timestamp.fromDate(new Date(expenseData.date)).toDate().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'expenses'), newExpenseData);
    const newExpense = { ...newExpenseData, id: docRef.id } as Expense;
    setExpenses(prev => [...prev, newExpense]);

    // Asynchronously upload the image and update the expense
    const uploadAndUpdateReceipt = async () => {
        let finalReceiptUrl = placeholderReceipt;
        try {
            if (receiptDataUri && receiptDataUri.startsWith('data:')) {
                const storageRef = ref(storage, `receipts/${currentUser.institutionId}/${docRef.id}-${Date.now()}`);
                const uploadResult = await uploadString(storageRef, receiptDataUri, 'data_url');
                finalReceiptUrl = await getDownloadURL(uploadResult.ref);
            }
            
            await updateDoc(docRef, { receiptUrl: finalReceiptUrl });

            setExpenses(prev => 
                prev.map(exp => 
                    exp.id === docRef.id ? { ...exp, receiptUrl: finalReceiptUrl } : exp
                )
            );
        } catch (error) {
            console.error("Failed to upload receipt:", error);
            // Optionally update the expense with an error state for the receipt
        }
    };

    uploadAndUpdateReceipt();
  };
  
  const addPayment = async (paymentData: Omit<Payment, 'id'|'institutionId'>) => {
      if (!currentUser) throw new Error("No user logged in");

      const newPaymentData = {
          ...paymentData,
          institutionId: currentUser.institutionId,
          createdAt: Timestamp.fromDate(new Date()).toDate().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'payments'), newPaymentData);
      setPayments(prev => [...prev, { ...newPaymentData, id: docRef.id } as Payment]);
  }

  const updateExpenseStatus = async (expenseId: string, status: 'Approved' | 'Rejected', comments: string) => {
    if (!currentUser || (currentUser.role !== 'Reviewer' && currentUser.role !== 'Admin')) return;
    
    const expenseRef = doc(db, 'expenses', expenseId);
    const expenseSnap = await getDoc(expenseRef);

    if (expenseSnap.exists()) {
        const expense = expenseSnap.data() as Expense;
        const newAuditLog: AuditLog = {
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            action: status,
            comments,
        };
        const updatedTrail = [...(expense.auditTrail || []), newAuditLog];
        await updateDoc(expenseRef, { status: status, auditTrail: updatedTrail });

        setExpenses(prev =>
            prev.map(exp => 
                exp.id === expenseId ? { ...exp, status, auditTrail: updatedTrail } : exp
            )
        );
    }
  };

  const addFeedback = async (feedbackData: Omit<Feedback, 'id' | 'createdAt'>) => {
    const newFeedbackData = {
      ...feedbackData,
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, 'feedback'), newFeedbackData);
    // We don't need to store feedback in local state for this app
  };


  const getExpensesForBudget = (budgetId: string) => expenses.filter(e => e.budgetId === budgetId);
  const getBudgetById = (budgetId: string) => budgets.find(b => b.id === budgetId);
  const getExpenseById = (expenseId: string) => expenses.find(e => e.id === expenseId);
  const getUserById = (userId: string) => users.find(u => u.id === userId);

  const publicStats: PublicStats = {
    totalAllocated: 0,
    totalSpent: 0,
    departmentData: []
  }

  const fetchAllPublicData = async (): Promise<{ institutions: Institution[], budgets: Budget[], expenses: Expense[] }> => {
    const [instSnap, budgetsSnap, expensesSnap] = await Promise.all([
        getDocs(collection(db, 'institutions')),
        getDocs(collection(db, 'budgets')),
        getDocs(query(collection(db, 'expenses'), where('status', '==', 'Approved')))
    ]);
    return {
        institutions: instSnap.docs.map(d => ({id: d.id, ...d.data()}) as Institution),
        budgets: budgetsSnap.docs.map(d => ({id: d.id, ...d.data()}) as Budget),
        expenses: expensesSnap.docs.map(d => ({id: d.id, ...d.data()}) as Expense),
    }
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
    addFeedback,
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

    