'use client';

import type { Budget, Expense, Role, User, PublicStats, SignupData, Institution, PaymentMode, Payment } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { DEPARTMENTS, EXPENSE_CATEGORIES, PAYMENT_MODES } from '@/lib/types';
import { auth, db, storage } from '@/lib/firebase';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut as firebaseSignOut 
} from 'firebase/auth';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    doc, 
    getDoc,
    setDoc, 
    addDoc,
    updateDoc
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { toast } from '@/hooks/use-toast';

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
            try {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data() as User;
                    setCurrentUser(userData);
                    await fetchDataForUser(userData);
                } else {
                    // This case can happen if the user record in Auth exists but not in Firestore.
                    console.error("User document not found in Firestore.");
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setCurrentUser(null);
            }
        } else {
            setCurrentUser(null);
            // Clear all data when user logs out
            setInstitutions([]);
            setBudgets([]);
            setExpenses([]);
            setPayments([]);
            setUsers([]);
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchDataForUser = async (user: User) => {
    if (!user.institutionId) {
        setInstitutions([]);
        setBudgets([]);
        setExpenses([]);
        setPayments([]);
        setUsers([]);
        return;
    }

    try {
        const collectionsToFetch = ['institutions', 'budgets', 'expenses', 'payments', 'users'];
        const setters:any = {
            institutions: setInstitutions,
            budgets: setBudgets,
            expenses: setExpenses,
            payments: setPayments,
            users: setUsers,
        };

        const institutionQuery = query(collection(db, 'institutions'), where('id', '==', user.institutionId));
        const instSnap = await getDocs(institutionQuery);
        const fetchedInstitutions = instSnap.docs.map(d => ({ ...d.data(), id: d.id }) as Institution);
        setInstitutions(fetchedInstitutions);


        for (const coll of ['budgets', 'expenses', 'payments', 'users']) {
            const q = query(collection(db, coll), where('institutionId', '==', user.institutionId));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
            setters[coll](data);
        }

    } catch (error) {
        console.error("Error fetching data for user:", error);
        toast({ title: "Error", description: "Could not load institution data.", variant: "destructive"});
    }
  };


  const login = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as User;
        setCurrentUser(userData);
        await fetchDataForUser(userData);
        return userData;
    } else {
        throw new Error("User data not found in Firestore.");
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setCurrentUser(null);
  };

  const signup = async (data: SignupData): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password || '');
    const newUser: User = {
        id: userCredential.user.uid,
        name: data.name,
        email: data.email,
        role: data.role,
        institutionId: data.institutionId,
    };
    await setDoc(doc(db, "users", userCredential.user.uid), newUser);
    return newUser;
  };
  
  const getInstitutionById = (id: string) => institutions.find(i => i.id === id);

  const addBudget = async (budgetData: Omit<Budget, 'id' | 'institutionId'>) => {
    if (!currentUser) throw new Error("No user logged in");
    const newBudgetData = {
      ...budgetData,
      institutionId: currentUser.institutionId,
    };
    const docRef = await addDoc(collection(db, 'budgets'), newBudgetData);
    setBudgets(prev => [...prev, { ...newBudgetData, id: docRef.id }]);
  };
  
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'submittedBy' | 'auditTrail' | 'status' | 'institutionId' | 'receiptUrl'> & { receiptFile?: File }) => {
    if (!currentUser) throw new Error("No user logged in");

    let receiptUrl = '';
    if (expenseData.receiptFile) {
        const storageRef = ref(storage, `receipts/${currentUser.institutionId}/${Date.now()}-${expenseData.receiptFile.name}`);
        
        // Convert File to data URL for upload
        const reader = new FileReader();
        receiptUrl = await new Promise((resolve, reject) => {
            reader.onload = async (event) => {
                try {
                    const dataUrl = event.target?.result as string;
                    await uploadString(storageRef, dataUrl, 'data_url');
                    const downloadUrl = await getDownloadURL(storageRef);
                    resolve(downloadUrl);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(expenseData.receiptFile as Blob);
        });
    }


    const newExpense: Omit<Expense, 'id'> = {
      ...expenseData,
      receiptUrl,
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
    setExpenses(prev => [...prev, { ...newExpense, id: docRef.id } as Expense]);
  };
  
  const addPayment = async (paymentData: Omit<Payment, 'id'|'institutionId'>) => {
      if (!currentUser) throw new Error("No user logged in");
        const newPaymentData = {
            ...paymentData,
            institutionId: currentUser.institutionId,
        };
        const docRef = await addDoc(collection(db, 'payments'), newPaymentData);
        setPayments(prev => [...prev, { ...newPaymentData, id: docRef.id } as Payment]);
  }

  const updateExpenseStatus = async (expenseId: string, status: 'Approved' | 'Rejected', comments: string) => {
    if (!currentUser || (currentUser.role !== 'Reviewer' && currentUser.role !== 'Admin')) return;
    
    const expenseRef = doc(db, 'expenses', expenseId);
    const expenseSnap = await getDoc(expenseRef);

    if(expenseSnap.exists() && expenseSnap.data().institutionId === currentUser.institutionId) {
        const currentTrail = expenseSnap.data().auditTrail || [];
        const newTrailEntry = {
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            action: status,
            comments,
        };

        await updateDoc(expenseRef, {
            status: status,
            auditTrail: [...currentTrail, newTrailEntry]
        });

        setExpenses(prev =>
          prev.map(exp => 
            exp.id === expenseId 
            ? { ...exp, status, auditTrail: [...exp.auditTrail, newTrailEntry] }
            : exp
          )
        );
    }
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
    const institutionsSnap = await getDocs(collection(db, 'institutions'));
    const budgetsSnap = await getDocs(collection(db, 'budgets'));
    const expensesQuery = query(collection(db, 'expenses'), where('status', '==', 'Approved'));
    const expensesSnap = await getDocs(expensesQuery);
    
    const allInstitutions = institutionsSnap.docs.map(d => ({ ...d.data(), id: d.id })) as Institution[];
    const allBudgets = budgetsSnap.docs.map(d => ({ ...d.data(), id: d.id })) as Budget[];
    const allApprovedExpenses = expensesSnap.docs.map(d => ({ ...d.data(), id: d.id })) as Expense[];

    return { institutions: allInstitutions, budgets: allBudgets, expenses: allApprovedExpenses };
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
