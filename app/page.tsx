'use client';

import BottomNavigation from '@/components/BottomNavigation';
import FinancialSummary from '@/components/FinancialSummary';
import Header from '@/components/Header';
import TransactionCard from '@/components/TransactionCard';
import TransactionForm from '@/components/TransactionForm';
import { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MonthlySummary {
    summary: {
        month: number;
        year: number;
        totalIncome: number;
        totalExpense: number;
        balance: number;
        incomeCount: number;
        expenseCount: number;
        transactionCount: number;
    };
    pendingParcels: any[];
    topCategories: any[];
}

export default function HomePage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<MonthlySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [showMonthSelector, setShowMonthSelector] = useState(false);

    useEffect(() => {
        fetchData();
    }, [currentDate, filterType]);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showMonthSelector) {
                const target = event.target as HTMLElement;
                if (!target.closest('.month-selector')) {
                    setShowMonthSelector(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMonthSelector]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();

            // Buscar transações
            const transactionsUrl = `/api/transactions?month=${month}&year=${year}${filterType !== 'all' ? `&type=${filterType}` : ''
                }`;
            const transactionsResponse = await fetch(transactionsUrl);
            const transactionsData = await transactionsResponse.json();

            // Buscar resumo
            const summaryResponse = await fetch(`/api/summary?month=${month}&year=${year}`);
            const summaryData = await summaryResponse.json();

            setTransactions(transactionsData);
            setSummary(summaryData);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTransaction = () => {
        setEditingTransaction(undefined);
        setShowForm(true);
    };

    const handleEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setShowForm(true);
    };

    const handleDeleteTransaction = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

        try {
            const response = await fetch(`/api/transactions/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchData();
            } else {
                alert('Erro ao excluir transação');
            }
        } catch (error) {
            console.error('Erro ao excluir transação:', error);
            alert('Erro ao excluir transação');
        }
    };

    const handleSaveTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at'>) => {
        try {
            const url = editingTransaction
                ? `/api/transactions/${editingTransaction.id}`
                : '/api/transactions';

            const method = editingTransaction ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transactionData)
            });

            if (response.ok) {
                setShowForm(false);
                setEditingTransaction(undefined);
                fetchData();
            } else {
                const error = await response.json();
                alert(error.error || 'Erro ao salvar transação');
            }
        } catch (error) {
            console.error('Erro ao salvar transação:', error);
            alert('Erro ao salvar transação');
        }
    };

    const changeMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1);
            } else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
            return newDate;
        });
    };

    const generateMonthOptions = () => {
        const months = [];
        const current = new Date();
        const startDate = new Date(current.getFullYear() - 2, 0, 1); // 2 anos atrás
        const endDate = new Date(current.getFullYear() + 1, 11, 31); // 1 ano à frente

        for (let date = new Date(startDate); date <= endDate; date.setMonth(date.getMonth() + 1)) {
            months.push({
                value: date.toISOString().slice(0, 7), // YYYY-MM
                label: format(date, 'MMMM yyyy', { locale: ptBR }),
                month: date.getMonth() + 1,
                year: date.getFullYear()
            });
        }

        return months.reverse(); // Mais recentes primeiro
    };

    const selectMonth = (monthValue: string) => {
        const [year, month] = monthValue.split('-').map(Number);
        setCurrentDate(new Date(year, month - 1, 1));
        setShowMonthSelector(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-white">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            <Header
                title="Controle Financeiro"
                showAdd
                onAddClick={handleAddTransaction}
            />

            {/* Seletor de Mês */}
            <div className="card mb-6">
                <div className="relative month-selector">
                    <button
                        onClick={() => setShowMonthSelector(!showMonthSelector)}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                            </span>
                        </div>
                        <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400 rotate-90" />
                    </button>

                    {/* Dropdown de Meses */}
                    {showMonthSelector && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                            {generateMonthOptions().map((month) => (
                                <button
                                    key={month.value}
                                    onClick={() => selectMonth(month.value)}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${currentDate.getMonth() + 1 === month.month &&
                                            currentDate.getFullYear() === month.year
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                            : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    {month.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Resumo Financeiro */}
            {summary && (
                <FinancialSummary
                    totalIncome={summary.summary.totalIncome}
                    totalExpense={summary.summary.totalExpense}
                    balance={summary.summary.balance}
                    transactionCount={summary.summary.transactionCount}
                    pendingParcels={summary.pendingParcels.length}
                />
            )}

            {/* Filtros */}
            <div className="card mb-4">
                <div className="flex items-center space-x-2 mb-3">
                    <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-white">Filtrar por tipo:</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { key: 'all', label: 'Todos' },
                        { key: 'income', label: 'Receitas' },
                        { key: 'expense', label: 'Despesas' }
                    ].map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() => setFilterType(filter.key as any)}
                            className={`p-2 rounded-lg text-sm font-medium transition-colors ${filterType === filter.key
                                ? 'bg-primary-600 text-white dark:bg-primary-600 dark:text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de Transações */}
            <div className="space-y-3">
                {transactions.length === 0 ? (
                    <div className="card text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400 mb-2">Nenhuma transação encontrada</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            Adicione sua primeira transação clicando no botão +
                        </p>
                    </div>
                ) : (
                    transactions.map((transaction) => (
                        <TransactionCard
                            key={transaction.id}
                            transaction={transaction}
                            onEdit={handleEditTransaction}
                            onDelete={handleDeleteTransaction}
                        />
                    ))
                )}
            </div>

            {/* Formulário de Transação */}
            {showForm && (
                <TransactionForm
                    transaction={editingTransaction}
                    onSave={handleSaveTransaction}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingTransaction(undefined);
                    }}
                />
            )}

            <BottomNavigation />
        </div>
    );
}
