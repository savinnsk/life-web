'use client';

import { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDownLeft, ArrowUpRight, Check, CreditCard } from 'lucide-react';

interface TransactionCardProps {
    transaction: Transaction;
    onEdit?: (transaction: Transaction) => void;
    onDelete?: (id: number) => void;
    onMarkAsPaid?: (id: number) => void;
}

export default function TransactionCard({ transaction, onEdit, onDelete, onMarkAsPaid }: TransactionCardProps) {
    const isIncome = transaction.type === 'income';
    const isParceled = transaction.is_parceled && transaction.total_parcels > 1;

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
    };

    return (
        <div className="card mb-3">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                        <div className={`p-1.5 rounded-lg ${isIncome ? 'bg-success-50 dark:bg-success-900/20 text-success-600' : 'bg-danger-50 dark:bg-danger-900/20 text-danger-600'
                            }`}>
                            {isIncome ? (
                                <ArrowUpRight className="w-4 h-4" />
                            ) : (
                                <ArrowDownLeft className="w-4 h-4" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                {transaction.description}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category}</p>
                        </div>
                    </div>

                    {isParceled && (
                        <div className="flex items-center space-x-2 mt-2">
                            <CreditCard className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Parcela {transaction.current_parcel} de {transaction.total_parcels}
                            </span>
                            {transaction.paid && (
                                <span className="text-xs text-success-600 dark:text-success-400 font-medium flex items-center">
                                    <Check className="w-3 h-3 mr-1" />
                                    Paga
                                </span>
                            )}
                        </div>
                    )}

                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatDate(transaction.date)}
                    </p>
                </div>

                <div className="flex flex-col items-end space-y-2">
                    <span className={`font-bold text-lg ${isIncome ? 'text-success-600' : 'text-danger-600'
                        }`}>
                        {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
                    </span>

                    {(onEdit || onDelete || onMarkAsPaid) && (
                        <div className="flex space-x-2">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(transaction)}
                                    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                                >
                                    Editar
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(transaction.id)}
                                    className="text-xs text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 font-medium"
                                >
                                    Excluir
                                </button>
                            )}
                            {onMarkAsPaid && !transaction.paid && (
                                <button
                                    onClick={() => onMarkAsPaid(transaction.id)}
                                    className="text-xs text-success-600 hover:text-success-700 dark:text-success-400 dark:hover:text-success-300 font-medium flex items-center"
                                >
                                    <Check className="w-4 h-4 mr-1" />
                                    Paga
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
