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
