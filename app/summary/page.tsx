'use client';

import BottomNavigation from '@/components/BottomNavigation';
import Header from '@/components/Header';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, BarChart3, Calendar, CheckSquare, CreditCard, Home, PieChart, Settings, StickyNote, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MonthlyData {
    month: number;
    year: number;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
}

interface CategoryData {
    category: string;
    total: number;
    percentage: number;
    color: string;
}

export default function SummaryPage() {
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showMonthSelector, setShowMonthSelector] = useState(false);

    useEffect(() => {
        fetchMonthlyData();
    }, [currentDate]);

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

    const fetchMonthlyData = async () => {
        setLoading(true);
        try {
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();

            // Buscar dados do mês selecionado
            const response = await fetch(`/api/summary?month=${month}&year=${year}`);
            const result = await response.json();

            setMonthlyData([{
                month,
                year,
                ...result.summary
            }]);

            // Buscar dados de categorias para análise de porcentagem
            const categoriesResponse = await fetch(`/api/categories?month=${month}&year=${year}`);
            const categoriesResult = await categoriesResponse.json();
            setCategoryData(categoriesResult);
        } catch (error) {
            console.error('Erro ao buscar dados mensais:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
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

    const currentMonthData = monthlyData[0] || { totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 };

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
        <div className="min-h-screen pb-20 lg:pb-0">
            {/* Layout Desktop */}
            <div className="hidden lg:flex lg:min-h-screen">
                {/* Sidebar */}
                <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    {/* Header da Sidebar */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Resumos</h1>
                    </div>

                    {/* Navegação da Sidebar */}
                    <nav className="flex-1 p-4">
                        <div className="space-y-2">
                            <div className="pt-4">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                    Navegação
                                </h3>
                                <div className="space-y-1">
                                    <a href="/" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <Home className="w-5 h-5" />
                                        <span>Início</span>
                                    </a>
                                    <a href="/summary" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 transition-colors">
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
                        </div>
                    </nav>
                </div>

                {/* Conteúdo Principal Desktop */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 p-6 overflow-y-auto">
                        {/* Seletor de Mês Desktop */}
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

                        {/* Grid Desktop */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* Resumo do Mês Selecionado */}
                            <div className="card">
                                <div className="flex items-center space-x-2 mb-4">
                                    <BarChart3 className="w-5 h-5 text-primary-600" />
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Resumo - {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center space-x-1 mb-1">
                                            <TrendingUp className="w-4 h-4 text-success-600" />
                                            <span className="text-sm font-medium text-success-700 dark:text-success-300">Total Receitas</span>
                                        </div>
                                        <p className="text-xl font-bold text-success-600">
                                            {formatAmount(currentMonthData.totalIncome)}
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <div className="flex items-center justify-center space-x-1 mb-1">
                                            <TrendingDown className="w-4 h-4 text-danger-600" />
                                            <span className="text-sm font-medium text-danger-700 dark:text-danger-300">Total Despesas</span>
                                        </div>
                                        <p className="text-xl font-bold text-danger-600">
                                            {formatAmount(currentMonthData.totalExpense)}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-center pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600 mb-1">Saldo do Mês</p>
                                    <p className={`text-2xl font-bold ${currentMonthData.balance >= 0 ? 'text-success-600' : 'text-danger-600'
                                        }`}>
                                        {formatAmount(currentMonthData.balance)}
                                    </p>
                                </div>
                            </div>

                            {/* Análise por Categoria */}
                            {categoryData.length > 0 && (
                                <div className="card">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <PieChart className="w-5 h-5 text-primary-600" />
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Gastos por Categoria</h2>
                                    </div>

                                    <div className="space-y-3">
                                        {categoryData.map((category, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: category.color }}
                                                    ></div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {category.category}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {formatAmount(category.total)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {category.percentage.toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout Mobile */}
            <div className="lg:hidden">
                <Header title="Resumos" />

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

                {/* Resumo do Mês Selecionado */}
                <div className="card mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-primary-600" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Resumo - {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1 mb-1">
                                <TrendingUp className="w-4 h-4 text-success-600" />
                                <span className="text-sm font-medium text-success-700 dark:text-success-300">Total Receitas</span>
                            </div>
                            <p className="text-xl font-bold text-success-600">
                                {formatAmount(currentMonthData.totalIncome)}
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1 mb-1">
                                <TrendingDown className="w-4 h-4 text-danger-600" />
                                <span className="text-sm font-medium text-danger-700 dark:text-danger-300">Total Despesas</span>
                            </div>
                            <p className="text-xl font-bold text-danger-600">
                                {formatAmount(currentMonthData.totalExpense)}
                            </p>
                        </div>
                    </div>

                    <div className="text-center pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Saldo do Mês</p>
                        <p className={`text-2xl font-bold ${currentMonthData.balance >= 0 ? 'text-success-600' : 'text-danger-600'
                            }`}>
                            {formatAmount(currentMonthData.balance)}
                        </p>
                    </div>
                </div>

                {/* Análise por Categoria */}
                {categoryData.length > 0 && (
                    <div className="card mb-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <PieChart className="w-5 h-5 text-primary-600" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Gastos por Categoria</h2>
                        </div>

                        <div className="space-y-3">
                            {categoryData.map((category, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: category.color }}
                                        ></div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {category.category}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {formatAmount(category.total)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {category.percentage.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Bottom Navigation apenas no mobile */}
            <div className="lg:hidden">
                <BottomNavigation />
            </div>
        </div>
    );
}
