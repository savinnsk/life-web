'use client';

import BottomNavigation from '@/components/BottomNavigation';
import Header from '@/components/Header';
import TransactionCard from '@/components/TransactionCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, AlertTriangle, BarChart3, CreditCard, DollarSign, Home, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Parcel {
    id: number;
    parent_transaction_id: number;
    description: string;
    total_parcels: number;
    current_parcel: number;
    amount: number;
    date: string;
    type: 'income' | 'expense';
    category: string;
    paid: boolean;
    is_parceled: boolean;
    created_at: string;
}

export default function ParcelsPage() {
    const [parcels, setParcels] = useState<Parcel[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'overdue'>('all');

    useEffect(() => {
        fetchParcels();
    }, []);

    const fetchParcels = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/parcels`);
            const data = await response.json();
            setParcels(data || []);
        } catch (error) {
            console.error('Erro ao buscar parcelas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (id: number) => {
        try {
            const parcel = parcels.find(p => p.id === id);
            if (!parcel) return;

            const response = await fetch(`/api/transactions/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ...parcel, paid: true })
                });

            if (response.ok) {
                fetchParcels();
            }
        } catch (error) {
            console.error('Erro ao marcar parcela como paga:', error);
        }
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
    };

    const isOverdue = (parcel: Parcel) => {
        return new Date(parcel.date) < new Date() && !parcel.paid;
    };

    const filteredParcels = parcels.filter(parcel => {
        if (filter === 'pending') return !isOverdue(parcel);
        if (filter === 'overdue') return isOverdue(parcel);
        return true;
    });

    const totalPending = parcels.filter(p => !isOverdue(p)).length;
    const totalOverdue = parcels.filter(p => isOverdue(p)).length;
    const totalAmount = parcels.filter(p => !p.paid).reduce((sum, p) => sum + p.amount, 0);

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
            <div className="hidden lg:flex lg:min-h-screen lg:h-screen w-full">
                {/* Sidebar */}
                <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
                    {/* Header da Sidebar */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Parcelas</h1>
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
                                    <a href="/summary" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <BarChart3 className="w-5 h-5" />
                                        <span>Resumos</span>
                                    </a>
                                    <a href="/parcels" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 transition-colors">
                                        <CreditCard className="w-5 h-5" />
                                        <span>Parcelas</span>
                                    </a>
                                    <a href="/limbo" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <AlertTriangle className="w-5 h-5" />
                                        <span>Limbo</span>
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
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 p-8 overflow-y-auto w-full">
                        {/* Grid Desktop */}
                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 w-full">
                            {/* Coluna 1: Resumo */}
                            <div className="xl:col-span-1 space-y-6">
                                {/* Resumo das Parcelas */}
                                <div className="space-y-4">
                                    <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 p-4">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <CreditCard className="w-5 h-5 text-yellow-600" />
                                            <h3 className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pendentes</h3>
                                        </div>
                                        <p className="text-2xl font-bold text-yellow-600">{totalPending}</p>
                                    </div>

                                    <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                            <h3 className="text-sm font-medium text-red-700 dark:text-red-300">Vencidas</h3>
                                        </div>
                                        <p className="text-2xl font-bold text-red-600">{totalOverdue}</p>
                                    </div>
                                </div>

                                {/* Valor Total */}
                                <div className="card text-center p-6">
                                    <div className="flex items-center justify-center space-x-2 mb-4">
                                        <DollarSign className="w-6 h-6 text-primary-600" />
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Valor Total Pendente</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-primary-600">
                                        {formatAmount(totalAmount)}
                                    </p>
                                </div>

                                {/* Filtros */}
                                <div className="card">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-white mb-4">Filtrar por status:</h3>
                                    <div className="space-y-2">
                                        {[
                                            { key: 'all', label: 'Todas' },
                                            { key: 'pending', label: 'Pendentes' },
                                            { key: 'overdue', label: 'Vencidas' }
                                        ].map((filterOption) => (
                                            <button
                                                key={filterOption.key}
                                                onClick={() => setFilter(filterOption.key as any)}
                                                className={`w-full p-3 rounded-lg text-sm font-medium transition-colors ${filter === filterOption.key
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                {filterOption.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Coluna 2: Lista de Parcelas */}
                            <div className="xl:col-span-3">
                                <div className="card">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Parcelas</h2>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {filteredParcels.length} parcela{filteredParcels.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        {filteredParcels.length === 0 ? (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                    <CreditCard className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 mb-2 text-lg">
                                                    {filter === 'all'
                                                        ? 'Nenhuma parcela encontrada'
                                                        : filter === 'pending'
                                                            ? 'Nenhuma parcela pendente'
                                                            : 'Nenhuma parcela vencida'
                                                    }
                                                </p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                                    Adicione transações parceladas para vê-las aqui
                                                </p>
                                            </div>
                                        ) : (
                                            filteredParcels.map((parcel) => (
                                                <TransactionCard
                                                    key={parcel.id}
                                                    transaction={parcel}
                                                    onMarkAsPaid={handleMarkAsPaid}
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
                <Header title="Parcelas" />

                {/* Resumo das Parcelas */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center space-x-2 mb-2">
                            <CreditCard className="w-4 h-4 text-yellow-600" />
                            <h3 className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pendentes</h3>
                        </div>
                        <p className="text-xl font-bold text-yellow-600">{totalPending}</p>
                    </div>

                    <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                        <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <h3 className="text-sm font-medium text-red-700 dark:text-red-300">Vencidas</h3>
                        </div>
                        <p className="text-xl font-bold text-red-600">{totalOverdue}</p>
                    </div>
                </div>

                {/* Valor Total */}
                <div className="card mb-6 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <DollarSign className="w-5 h-5 text-primary-600" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Valor Total Pendente</h3>
                    </div>
                    <p className="text-2xl font-bold text-primary-600">
                        {formatAmount(totalAmount)}
                    </p>
                </div>

                {/* Filtros */}
                <div className="card mb-4">
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { key: 'all', label: 'Todas' },
                            { key: 'pending', label: 'Pendentes' },
                            { key: 'overdue', label: 'Vencidas' }
                        ].map((filterOption) => (
                            <button
                                key={filterOption.key}
                                onClick={() => setFilter(filterOption.key as any)}
                                className={`p-2 rounded-lg text-sm font-medium transition-colors ${filter === filterOption.key
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {filterOption.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista de Parcelas */}
                <div className="space-y-3">
                    {filteredParcels.length === 0 ? (
                        <div className="card text-center py-8">
                            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-white mb-2">
                                {filter === 'all'
                                    ? 'Nenhuma parcela encontrada'
                                    : filter === 'pending'
                                        ? 'Nenhuma parcela pendente'
                                        : 'Nenhuma parcela vencida'
                                }
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-300">
                                Adicione transações parceladas para vê-las aqui
                            </p>
                        </div>
                    ) : (
                        filteredParcels.map((parcel) => (
                            <TransactionCard
                                key={parcel.id}
                                transaction={parcel}
                                onMarkAsPaid={handleMarkAsPaid}
                            />
                        ))
                    )}
                </div>

                <BottomNavigation />
            </div>
        </div>
    );
}
