import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import type { Institution, Budget, Expense } from "./types";

export async function fetchAllPublicData(): Promise<{ institutions: Institution[], budgets: Budget[], expenses: Expense[] }> {
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
