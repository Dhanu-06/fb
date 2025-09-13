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
    updateDoc,
    writeBatch
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { toast } from '@/hooks/use-toast';
import { seedData } from '@/lib/seed-data';

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
  addExpense: (expense: Omit<Expense, 'id' | 'submittedBy' | 'auditTrail' | 'status' | 'institutionId' | 'receiptUrl'> & { receiptFile?: File }) => Promise<void>;
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
  seedDatabase: () => Promise<void>;
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
                    const userData = { ...userDocSnap.data(), id: userDocSnap.id } as User;
                    setCurrentUser(userData);
                    await fetchDataForUser(userData);
                } else {
                    console.error("User document not found in Firestore.");
                    setCurrentUser(null);
                    await firebaseSignOut(auth);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setCurrentUser(null);
            }
        } else {
            setCurrentUser(null);
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
        const institutionQuery = query(collection(db, 'institutions'), where('id', '==', user.institutionId));
        const instSnap = await getDocs(institutionQuery);
        const fetchedInstitutions = instSnap.docs.map(d => ({ ...d.data(), id: d.id }) as Institution);
        setInstitutions(fetchedInstitutions);

        const collectionsToFetch = ['budgets', 'expenses', 'payments', 'users'];
        const setters:any = {
            budgets: setBudgets,
            expenses: setExpenses,
            payments: setPayments,
            users: setUsers,
        };

        for (const coll of collectionsToFetch) {
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
        const userData = { ...userDocSnap.data(), id: userDocSnap.id } as User;
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
    const newUser: Omit<User, 'id'> = {
        name: data.name,
        email: data.email,
        role: data.role,
        institutionId: data.institutionId,
    };
    await setDoc(doc(db, "users", userCredential.user.uid), newUser);
    return { ...newUser, id: userCredential.user.uid };
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
  
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'submittedBy' | 'auditTrail' | 'status' | 'institutionId' | 'receiptUrl'> & { receiptFile?: File }) => {
    if (!currentUser) throw new Error("No user logged in");

    let receiptUrl = '';
    if (expenseData.receiptFile) {
        const storageRef = ref(storage, `receipts/${currentUser.institutionId}/${Date.now()}-${expenseData.receiptFile.name}`);
        
        const reader = new FileReader();
        receiptUrl = await new Promise((resolve, reject) => {
            reader.onload = async (event) => {
                try {
                    const dataUrl = event.target?.result as string;
                    const uploadTask = await uploadString(storageRef, dataUrl, 'data_url');
                    const downloadUrl = await getDownloadURL(uploadTask.ref);
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
          comments: 'Expense submitted',
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

  const seedDatabase = async () => {
    if (!currentUser || currentUser.role !== 'Admin') {
        throw new Error("You don't have permission to perform this action.");
    }
    const { sampleInstitution, sampleBudgets, sampleReviewer } = seedData;
    const institutionId = currentUser.institutionId;

    const batch = writeBatch(db);

    // 1. Update current institution
    const instRef = doc(db, 'institutions', institutionId);
    batch.update(instRef, { name: sampleInstitution.name });

    // 2. Add sample budgets
    sampleBudgets.forEach(budget => {
        const budgetRef = doc(collection(db, 'budgets'));
        batch.set(budgetRef, { ...budget, institutionId });
    });

    // 3. Add sample reviewer user
    // In a real app, you'd want a more secure way to handle user creation and passwords
    const reviewerEmail = `reviewer-${institutionId.slice(0,6)}@clarity.com`;
    const reviewerExistsQuery = query(collection(db, 'users'), where('email', '==', reviewerEmail));
    const existingReviewerSnap = await getDocs(reviewerExistsQuery);
    
    if (existingReviewerSnap.empty) {
      // This is a simplified signup for seeding, it doesn't use firebase auth to create a user
      // so this user won't be able to log in. This is for display purposes.
       const reviewerRef = doc(collection(db, 'users'));
       batch.set(reviewerRef, { ...sampleReviewer, email: reviewerEmail, institutionId });
    }


    await batch.commit();

    // Refetch all data to update the UI
    await fetchDataForUser(currentUser);
  }

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
    seedDatabase,
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
