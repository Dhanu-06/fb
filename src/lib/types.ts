

export type Role = 'Admin' | 'Reviewer' | 'Public';
export type Currency = 'INR' | 'USD';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  institutionId: string;
}

export interface SignupData {
  name:string;
  email: string;
  password?: string;
  role: Role;
  institutionId: string;
}

export interface Institution {
    id: string;
    name: string;
}

export interface Budget {
  id: string;
  title: string;
  allocated: number;
  department: string;
  institutionId: string;
  history?: Partial<Budget>[];
}

export type PaymentMode = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Card' | 'In-Kind';

export interface Payment {
  id: string;
  institutionId: string;
  payerName: string;
  studentId?: string;
  amount: number;
  paymentMode: PaymentMode;
  transactionReference?: string;
  receiptUrl?: string;
  createdAt: string; // ISO string
}

export type ExpenseStatus = 'Submitted' | 'Approved' | 'Rejected';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  vendor: string;
  date: string; // ISO string
  receiptUrl?: string;
  budgetId: string;
  institutionId: string;
  submittedBy: string; // User ID
  status: ExpenseStatus;
  paymentMode: PaymentMode;
  transactionReference?: string;
  auditTrail: AuditLog[];
}

export type AuditLogAction = 'Created' | 'Approved' | 'Rejected' | 'Updated';

export interface AuditLog {
  timestamp: string; // ISO string
  userId: string;
  action: AuditLogAction;
  comments?: string;
}

export interface Feedback {
    id: string;
    budgetId: string;
    comment: string;
    createdAt: string; // ISO string
    userId?: string; // Optional: for logged-in users
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

export const DEPARTMENTS = ["Library", "Sports", "Food", "Maintenance", "Lab", "Events", "Transport", "IT Services", "Student Welfare", "Administration", "Hostel", "Academics", "Research & Development", "Infrastructure & Construction"];
export const EXPENSE_CATEGORIES = ["Supplies", "Services", "Equipment", "Travel", "Utilities", "Miscellaneous"];
export const PAYMENT_MODES: PaymentMode[] = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card', 'In-Kind'];
