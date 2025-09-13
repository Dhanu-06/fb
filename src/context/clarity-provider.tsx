
'use client';

import type { Budget, Expense, Role, User, SignupData, Institution, PaymentMode, Payment, AuditLog, Feedback, Currency } from '@/lib/types';
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
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { fetchAllPublicData } from '@/lib/public-data';

const USD_INR_EXCHANGE_RATE = 83; // Hardcoded exchange rate

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
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => void;
  publicData: {
    institutions: Institution[];
    budgets: Budget[];
    expenses: Expense[];
    error: any;
    isLoading: boolean;
  }
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number;
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
  const [currency, setCurrency] = useState<Currency>('INR');

  const [publicData, setPublicData] = useState<{institutions: Institution[], budgets: Budget[], expenses: Expense[], error: any, isLoading: boolean}>({
    institutions: [],
    budgets: [],
    expenses: [],
    error: null,
    isLoading: true,
  });

  const fetchUserData = useCallback(async (uid: string) => {
    setIsLoading(true);
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<User, 'id'>;
        const userWithId = { ...userData, id: uid };
        setCurrentUser(userWithId);
        
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
        setIsLoading(false);
        return userWithId;
    }
    setIsLoading(false);
    return null;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setIsLoading(true);
        if (user) {
            setFirebaseUser(user);
            await fetchUserData(user.uid);
        } else {
            setFirebaseUser(null);
            setCurrentUser(null);
            setInstitutions([]);
            setBudgets([]);
            setExpenses([]);
            setPayments([]);
            setUsers([]);
            setIsLoading(false);
        }
    });
    return () => unsubscribe();
  }, [fetchUserData]);

  // Fetch public data separately
  useEffect(() => {
    const loadPublicData = async () => {
      try {
        const { institutions, budgets, expenses } = await fetchAllPublicData();
        setPublicData({ institutions, budgets, expenses, error: null, isLoading: false });
      } catch (error) {
        console.error("Could not download public data:", error);
        setPublicData({ institutions: [], budgets: [], expenses: [], error, isLoading: false });
      }
    };
    loadPublicData();
  }, []);

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
      receiptUrl: '',
      date: new Date(expenseData.date).toISOString(),
    };

    const docRef = await addDoc(collection(db, 'expenses'), newExpenseData);
    
    const optimisticExpense = { ...newExpenseData, id: docRef.id, receiptUrl: placeholderReceipt } as Expense;
    setExpenses(prev => [...prev, optimisticExpense]);

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
            // Revert optimistic update on failure if needed
            setExpenses(prev => prev.filter(exp => exp.id !== docRef.id));
        }
    };

    uploadAndUpdateReceipt();
  };
  
  const addPayment = async (paymentData: Omit<Payment, 'id'|'institutionId'>) => {
      if (!currentUser) throw new Error("No user logged in");

      const newPaymentData = {
          ...paymentData,
          institutionId: currentUser.institutionId,
          createdAt: new Date().toISOString(),
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
  };


  const getExpensesForBudget = (budgetId: string) => expenses.filter(e => e.budgetId === budgetId);
  const getBudgetById = (budgetId: string) => budgets.find(b => b.id === budgetId);
  const getExpenseById = (expenseId: string) => expenses.find(e => e.id === expenseId);
  
  const getUserById = useCallback((userId: string) => {
    return users.find(u => u.id === userId);
  }, [users]);


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
    addFeedback,
    publicData,
    currency,
    setCurrency,
    exchangeRate: USD_INR_EXCHANGE_RATE,
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
