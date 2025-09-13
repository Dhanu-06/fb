
export type Role = 'Admin' | 'Reviewer' | 'Public';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  password?: string;
}

export interface SignupData {
  name: string;
  email: string;
  password?: string;
  role: Role;
}

export interface Budget {
  id: string;
  title: string;
  allocated: number;
  department: string;
  // Versioning can be handled by storing previous states
  history?: Partial<Budget>[];
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  vendor: string;
  date: string; // ISO string
  receiptUrl?: string;
  budgetId: string;
  submittedBy: string; // User ID
  status: 'Submitted' | 'Approved' | 'Rejected';
  auditTrail: AuditLog[];
}

export interface AuditLog {
  timestamp: string; // ISO string
  userId: string;
  action: 'Created' | 'Approved' | 'Rejected' | 'Updated';
  comments?: string;
}

export interface PublicDepartmentStat {
    department: string;
    allocated: number;
    spent: number;
    utilization: number;
}

export interface PublicStats {
    totalAllocated: number;
    totalSpent: number;
    departmentData: PublicDepartmentStat[];
}

export const DEPARTMENTS = ["Library", "Sports", "Food", "Maintenance", "Lab", "Events", "Transport", "IT Services", "Student Welfare", "Administration"];
export const EXPENSE_CATEGORIES = ["Supplies", "Services", "Equipment", "Travel", "Utilities", "Miscellaneous"];
