'use client';

import BottomNavigation from '@/components/BottomNavigation';
import FinancialSummary from '@/components/FinancialSummary';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import TransactionCard from '@/components/TransactionCard';
import TransactionForm from '@/components/TransactionForm';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, BarChart3, Calendar, CheckSquare, CreditCard, Filter, Home, LogOut, Plus, Settings, StickyNote, User } from 'lucide-react';
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
    const { user, logout } = useAuth();
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

            if (transactionsResponse.ok) {
                const transactionsData = await transactionsResponse.json();
                setTransactions(transactionsData);
            } else {
                setTransactions([]);
            }

            // Buscar resumo
            const summaryResponse = await fetch(`/api/summary?month=${month}&year=${year}`);

            if (summaryResponse.ok) {
                const summaryData = await summaryResponse.json();
                setSummary(summaryData);
            } else {
                setSummary(null);
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            setTransactions([]);
            setSummary(null);
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

        // Ordenar para que o mês atual apareça primeiro, depois os próximos meses, depois os anteriores
        return months.sort((a, b) => {
            const currentMonth = current.getMonth() + 1;
            const currentYear = current.getFullYear();

            // Se ambos são do ano atual
            if (a.year === currentYear && b.year === currentYear) {
                // Mês atual primeiro
                if (a.month === currentMonth) return -1;
                if (b.month === currentMonth) return 1;
                // Depois próximos meses
                if (a.month >= currentMonth && b.month < currentMonth) return -1;
                if (a.month < currentMonth && b.month >= currentMonth) return 1;
                // Ordenar por mês
                return a.month - b.month;
            }

            // Se um é do ano atual e outro não, priorizar o atual
            if (a.year === currentYear) return -1;
            if (b.year === currentYear) return 1;

            // Para outros anos, ordenar por ano (mais recente primeiro)
            return b.year - a.year;
        });
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
        <ProtectedRoute>
            <div className="min-h-screen pb-20 lg:pb-0">
                {/* Layout Desktop */}
                <div className="hidden lg:flex lg:min-h-screen lg:h-screen w-full">
                    {/* Sidebar */}
                    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
                        {/* Header da Sidebar */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Controle Financeiro</h1>
                            {user && (
                                <div className="mt-2 flex items-center space-x-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{user.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Navegação da Sidebar */}
                        <nav className="flex-1 p-4">
                            <div className="space-y-2">
                                <button
                                    onClick={handleAddTransaction}
                                    className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="font-medium">Nova Transação</span>
                                </button>

                                <div className="pt-4">
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                        Navegação
                                    </h3>
                                    <div className="space-y-1">
                                        <a href="/" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <Home className="w-5 h-5" />
                                            <span>Início</span>
                                        </a>
                                        <a href="/summary" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <BarChart3 className="w-5 h-5" />
                                            <span>Resumos</span>
                                        </a>
                                        <a href="/parcels" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <CreditCard className="w-5 h-5" />
                                            <span>Parcelas</span>
                                        </a>
                                        <a href="/limbo" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <AlertTriangle className="w-5 h-5" />
                                            <span>Limbo</span>
                                        </a>
                                        <a href="/tasks" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <CheckSquare className="w-5 h-5" />
                                            <span>Tarefas</span>
                                        </a>
                                        <a href="/notes" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <StickyNote className="w-5 h-5" />
                                            <span>Anotações</span>
                                        </a>
                                        <a href="/settings" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <Settings className="w-5 h-5" />
                                            <span>Configurações</span>
                                        </a>
                                    </div>
                                </div>

                                {/* Logout */}
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>Sair</span>
                                    </button>
                                </div>
                            </div>
                        </nav>
                    </div>

                    {/* Conteúdo Principal Desktop */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex-1 p-8 overflow-y-auto w-full">
                            {/* Seletor de Mês Desktop */}
                            <div className="card mb-8">
                                <div className="relative month-selector">
                                    <button
                                        onClick={() => setShowMonthSelector(!showMonthSelector)}
                                        className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                                            </span>
                                        </div>
                                        <Calendar className="w-6 h-6 text-gray-600 dark:text-gray-400 rotate-90" />
                                    </button>

                                    {/* Dropdown de Meses */}
                                    {showMonthSelector && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
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

                            {/* Grid Desktop */}
                            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 w-full">
                                {/* Coluna 1: Resumo Financeiro */}
                                <div className="xl:col-span-2">
                                    {summary && summary.summary && (
                                        <div className="mb-8">
                                            <FinancialSummary
                                                totalIncome={summary.summary.totalIncome}
                                                totalExpense={summary.summary.totalExpense}
                                                balance={summary.summary.balance}
                                                transactionCount={summary.summary.transactionCount}
                                                pendingParcels={summary.pendingParcels?.length || 0}
                                            />
                                        </div>
                                    )}

                                    {/* Filtros */}
                                    <div className="card">
                                        <div className="flex items-center space-x-2 mb-4">
                                            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-white">Filtrar por tipo:</span>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { key: 'all', label: 'Todos' },
                                                { key: 'income', label: 'Receitas' },
                                                { key: 'expense', label: 'Despesas' }
                                            ].map((filter) => (
                                                <button
                                                    key={filter.key}
                                                    onClick={() => setFilterType(filter.key as any)}
                                                    className={`w-full p-4 rounded-lg text-sm font-medium transition-colors ${filterType === filter.key
                                                        ? 'bg-primary-600 text-white dark:bg-primary-600 dark:text-white'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {filter.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Coluna 2: Lista de Transações */}
                                <div className="xl:col-span-3">
                                    <div className="card">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transações</h2>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {transactions.length} transação{transactions.length !== 1 ? 'ões' : ''}
                                            </span>
                                        </div>
                                        <div className="space-y-4">
                                            {transactions.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                        <Plus className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 dark:text-gray-400 mb-2 text-lg">Nenhuma transação encontrada</p>
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Layout Mobile */}
                <div className="lg:hidden">
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
                    {summary && summary.summary && (
                        <FinancialSummary
                            totalIncome={summary.summary.totalIncome}
                            totalExpense={summary.summary.totalExpense}
                            balance={summary.summary.balance}
                            transactionCount={summary.summary.transactionCount}
                            pendingParcels={summary.pendingParcels?.length || 0}
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
                    <div className="space-y-4">
                        {transactions.length === 0 ? (
                            <div className="card text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400 mb-2">Nenhuma transação encontrada</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    Adicione sua primeira transação clicando no botão +
                                </p>
                            </div>
                        ) : (
                            transactions.map((transaction) => (
                                <div key={transaction.id} className="mb-4 last:mb-0">
                                    <TransactionCard
                                        transaction={transaction}
                                        onEdit={handleEditTransaction}
                                        onDelete={handleDeleteTransaction}
                                    />
                                </div>
                            ))
                        )}
                    </div>

                    {/* Bottom Navigation apenas no mobile */}
                    <div className="lg:hidden">
                        <BottomNavigation />
                    </div>
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
            </div>
        </ProtectedRoute>
    );
}
