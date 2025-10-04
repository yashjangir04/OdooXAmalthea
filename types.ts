
export enum Role {
  Admin = 'Admin',
  Manager = 'Manager',
  Finance = 'Finance',
  Director = 'Director',
  Employee = 'Employee',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  managerId?: string;
}

export enum ExpenseCategory {
  Food = 'Food',
  Travel = 'Travel',
  Accommodation = 'Accommodation',
  Other = 'Other',
}

export enum ApprovalStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface ExpenseRequest {
  id: string;
  userId: string;
  description: string;
  expenseDate: string;
  category: ExpenseCategory;
  paidBy: string;
  amount: number;
  currency: string;
  remarks: string;
  status: ApprovalStatus;
  createdAt: string;
  approvers: { userId: string, status: 'Pending' | 'Approved' | 'Rejected' }[];
  receiptImageUrl?: string;
}

export interface ApprovalWorkflow {
  approvers: string[]; // array of user IDs
  isSequenced: boolean;
  minApprovalPercentage: number;
  specialApproverId?: string;
}