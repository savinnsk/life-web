'use client';

import BottomNavigation from '@/components/BottomNavigation';
import Header from '@/components/Header';
import TransactionForm from '@/components/TransactionForm';
import { Transaction } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddTransactionPage() {
    const [showForm, setShowForm] = useState(true);
    const router = useRouter();

    const handleSaveTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at'>) => {
        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transactionData)
            });

            if (response.ok) {
                router.push('/');
            } else {
                const error = await response.json();
                alert(error.error || 'Erro ao salvar transação');
            }
        } catch (error) {
            console.error('Erro ao salvar transação:', error);
            alert('Erro ao salvar transação');
        }
    };

    const handleCancel = () => {
        router.push('/');
    };

    return (
        <div className="min-h-screen pb-20">
            <Header
                title="Nova Transação"
                showBack
                onBackClick={handleCancel}
            />

            {showForm && (
                <TransactionForm
                    onSave={handleSaveTransaction}
                    onCancel={handleCancel}
                />
            )}

            <BottomNavigation />
        </div>
    );
}
