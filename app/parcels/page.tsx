'use client';

import BottomNavigation from '@/components/BottomNavigation';
import Header from '@/components/Header';
import TransactionCard from '@/components/TransactionCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, CreditCard, DollarSign } from 'lucide-react';
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
        <div className="min-h-screen pb-20">
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
    );
}
