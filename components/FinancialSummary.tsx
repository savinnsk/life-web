'use client';

import { CreditCard, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

interface FinancialSummaryProps {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
    pendingParcels?: number;
}

export default function FinancialSummary({
    totalIncome,
    totalExpense,
    balance,
    transactionCount,
    pendingParcels = 0
}: FinancialSummaryProps) {
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    };

    const isPositive = balance >= 0;

    return (
        <div className="space-y-6">
            {/* Saldo Principal */}
            <div className={`bg-white dark:bg-slate-800 rounded-lg border text-center p-4 ${isPositive ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800' : 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800'
                }`}>
                <div className="flex items-center justify-center space-x-3 mb-4">
                    <DollarSign className={`w-6 h-6 ${isPositive ? 'text-success-600' : 'text-danger-600'
                        }`} />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saldo do Mês</h2>
                </div>
                <p className={`text-4xl font-bold mb-2 ${isPositive ? 'text-success-600' : 'text-danger-600'
                    }`}>
                    {formatAmount(balance)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {transactionCount} transação{transactionCount !== 1 ? 'ões' : ''}
                </p>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Receitas */}
                <div className="bg-success-100 dark:bg-success-900/30 border border-success-200 dark:border-success-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-success-600" />
                        <h3 className="text-sm font-medium text-success-700 dark:text-success-400">Receitas</h3>
                    </div>
                    <p className="text-xl font-bold text-success-600 dark:text-success-400">
                        {formatAmount(totalIncome)}
                    </p>
                </div>

                {/* Despesas */}
                <div className="bg-danger-100 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-danger-600" />
                        <h3 className="text-sm font-medium text-danger-700 dark:text-danger-400">Despesas</h3>
                    </div>
                    <p className="text-xl font-bold text-danger-600 dark:text-danger-400">
                        {formatAmount(totalExpense)}
                    </p>
                </div>
            </div>

            {/* Parcelas Pendentes */}
            {pendingParcels > 0 && (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                        <CreditCard className="w-4 h-4 text-yellow-600" />
                        <h3 className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Parcelas Pendentes</h3>
                    </div>
                    <p className="text-lg font-bold text-yellow-600">
                        {pendingParcels} parcela{pendingParcels !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        Aguardando pagamento
                    </p>
                </div>
            )}
        </div>
    );
}
