'use client';

import BottomNavigation from '@/components/BottomNavigation';
import Header from '@/components/Header';
import { BarChart3, Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MonthlyData {
    month: number;
    year: number;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
}

export default function SummaryPage() {
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchMonthlyData();
    }, [selectedYear]);

    const fetchMonthlyData = async () => {
        setLoading(true);
        try {
            const data = [];
            for (let month = 1; month <= 12; month++) {
                const response = await fetch(`/api/summary?month=${month}&year=${selectedYear}`);
                const result = await response.json();
                data.push({
                    month,
                    year: selectedYear,
                    ...result.summary
                });
            }
            setMonthlyData(data);
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

    const getMonthName = (month: number) => {
        const months = [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];
        return months[month - 1];
    };

    const totalIncome = monthlyData.reduce((sum, month) => sum + month.totalIncome, 0);
    const totalExpense = monthlyData.reduce((sum, month) => sum + month.totalExpense, 0);
    const totalBalance = totalIncome - totalExpense;

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
            <Header title="Resumos" />

            {/* Resumo Anual */}
            <div className="card mb-6">
                <div className="flex items-center space-x-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-primary-600" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Resumo Anual - {selectedYear}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                            <TrendingUp className="w-4 h-4 text-success-600" />
                            <span className="text-sm font-medium text-success-700 dark:text-success-300">Total Receitas</span>
                        </div>
                        <p className="text-xl font-bold text-success-600">
                            {formatAmount(totalIncome)}
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                            <TrendingDown className="w-4 h-4 text-danger-600" />
                            <span className="text-sm font-medium text-danger-700 dark:text-danger-300">Total Despesas</span>
                        </div>
                        <p className="text-xl font-bold text-danger-600">
                            {formatAmount(totalExpense)}
                        </p>
                    </div>
                </div>

                <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Saldo do Ano</p>
                    <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-success-600' : 'text-danger-600'
                        }`}>
                        {formatAmount(totalBalance)}
                    </p>
                </div>
            </div>

            {/* Seletor de Ano */}
            <div className="card mb-6">
                <div className="flex items-center space-x-2 mb-3">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Ano:</span>
                </div>
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="input-field"
                >
                    {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        );
                    })}
                </select>
            </div>

            {/* Dados Mensais */}
            <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Dados Mensais</h3>

                {monthlyData
                    .sort((a, b) => {
                        // Ordenar: mês atual primeiro, depois próximos meses
                        const currentMonth = new Date().getMonth() + 1;
                        const currentYear = new Date().getFullYear();

                        // Se for o ano atual, priorizar mês atual e futuros
                        if (a.year === currentYear && b.year === currentYear) {
                            if (a.month >= currentMonth && b.month < currentMonth) return -1;
                            if (a.month < currentMonth && b.month >= currentMonth) return 1;
                            return a.month - b.month;
                        }

                        // Para outros anos, ordenar por mês normal
                        return a.month - b.month;
                    })
                    .map((month) => (
                        <div key={month.month} className="card">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-gray-900 dark:text-white">
                                    {getMonthName(month.month)}
                                </h4>
                                <span className={`text-lg font-bold ${month.balance >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                                    }`}>
                                    {formatAmount(month.balance)}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600 dark:text-gray-300">Receitas</p>
                                    <p className="font-medium text-success-600 dark:text-success-400">
                                        {formatAmount(month.totalIncome)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-300">Despesas</p>
                                    <p className="font-medium text-danger-600 dark:text-danger-400">
                                        {formatAmount(month.totalExpense)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {month.transactionCount} transação{month.transactionCount !== 1 ? 'ões' : ''}
                                </p>
                            </div>
                        </div>
                    ))}
            </div>

            <BottomNavigation />
        </div>
    );
}
