export interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    is_parceled: boolean | number;
    total_parcels: number;
    current_parcel: number;
    parent_transaction_id?: number;
    is_fixed: boolean | number;
    paid: boolean;
    paid_at?: string;
    created_at: string;
}

export interface Category {
    id: number;
    name: string;
    type: 'income' | 'expense';
    color: string;
    created_at: string;
}

export interface MonthlySummary {
    month: string;
    year: number;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
}

export interface ParcelInfo {
    totalParcels: number;
    paidParcels: number;
    remainingParcels: number;
    nextDueDate?: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
}

export interface Task {
    id: number;
    user_id: number;
    title: string;
    description?: string;
    tags?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    completed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Note {
    id: number;
    user_id: number;
    title: string;
    content?: string;
    tags?: string;
    color: string;
    created_at: string;
    updated_at: string;
}
