

export type Role = 'Admin' | 'Reviewer' | 'Public';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  password?: string;
  institutionId: string;
}

export interface SignupData {
  name: string;
  email: string;
  password?: string;
  role: Role;
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
  status: 'Submitted' | 'Approved' | 'Rejected';
  paymentMode: PaymentMode;
  transactionReference?: string;
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

export const DEPARTMENTS = ["Library", "Sports", "Food", "Maintenance", "Lab", "Events", "Transport", "IT Services", "Student Welfare", "Administration", "Hostel", "Academics", "Research & Development"];
export const EXPENSE_CATEGORIES = ["Supplies", "Services", "Equipment", "Travel", "Utilities", "Miscellaneous"];
export const PAYMENT_MODES: PaymentMode[] = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card', 'In-Kind'];

