'use client';

import BottomNavigation from '@/components/BottomNavigation';
import Header from '@/components/Header';
import { AlertTriangle, BarChart3, CheckSquare, CreditCard, DollarSign, Edit, Home, Plus, Settings, StickyNote, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LimboDebt {
    id: number;
    description: string;
    amount: number;
    created_at: string;
}

export default function LimboPage() {
    const [debts, setDebts] = useState<LimboDebt[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingDebt, setEditingDebt] = useState<LimboDebt | undefined>();
    const [formData, setFormData] = useState({ description: '', amount: '' });

    useEffect(() => {
        fetchDebts();
    }, []);

    const fetchDebts = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/limbo');
            const data = await response.json();
            setDebts(data);
        } catch (error) {
            console.error('Erro ao buscar dívidas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDebt = () => {
        setEditingDebt(undefined);
        setFormData({ description: '', amount: '' });
        setShowForm(true);
    };

    const handleEditDebt = (debt: LimboDebt) => {
        setEditingDebt(debt);
        setFormData({ description: debt.description, amount: debt.amount.toString() });
        setShowForm(true);
    };

    const handleDeleteDebt = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta dívida?')) return;

        try {
            const response = await fetch(`/api/limbo/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchDebts();
            } else {
                alert('Erro ao excluir dívida');
            }
        } catch (error) {
            console.error('Erro ao excluir dívida:', error);
            alert('Erro ao excluir dívida');
        }
    };

    const handleSaveDebt = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.description || !formData.amount) {
            alert('Preencha todos os campos');
            return;
        }

        try {
            const url = editingDebt ? `/api/limbo/${editingDebt.id}` : '/api/limbo';
            const method = editingDebt ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: formData.description,
                    amount: parseFloat(formData.amount)
                })
            });

            if (response.ok) {
                setShowForm(false);
                setEditingDebt(undefined);
                setFormData({ description: '', amount: '' });
                fetchDebts();
            } else {
                const error = await response.json();
                alert(error.error || 'Erro ao salvar dívida');
            }
        } catch (error) {
            console.error('Erro ao salvar dívida:', error);
            alert('Erro ao salvar dívida');
        }
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    };

    const totalDebts = debts.reduce((sum, debt) => sum + debt.amount, 0);

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
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Limbo</h1>
                    </div>

                    {/* Navegação da Sidebar */}
                    <nav className="flex-1 p-4">
                        <div className="space-y-2">
                            <button
                                onClick={handleAddDebt}
                                className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="font-medium">Nova Dívida</span>
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
                                    <a href="/limbo" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 transition-colors">
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
                        {/* Grid Desktop */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            {/* Coluna 1: Resumo Total */}
                            <div className="xl:col-span-1">
                                <div className="card">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Total em Dívidas</h2>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                            {formatAmount(totalDebts)}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {debts.length} dívida{debts.length !== 1 ? 's' : ''} registrada{debts.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Coluna 2: Lista de Dívidas */}
                            <div className="xl:col-span-2">
                                <div className="card">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Dívidas Registradas</h2>
                                    <div className="space-y-3">
                                        {debts.length === 0 ? (
                                            <div className="text-center py-8">
                                                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-500 dark:text-gray-400 mb-2">Nenhuma dívida registrada</p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                                    Adicione sua primeira dívida clicando no botão +
                                                </p>
                                            </div>
                                        ) : (
                                            debts.map((debt) => (
                                                <div key={debt.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                                                                {debt.description}
                                                            </h3>
                                                            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                                                {formatAmount(debt.amount)}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {new Date(debt.created_at).toLocaleDateString('pt-BR')}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => handleEditDebt(debt)}
                                                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteDebt(debt.id)}
                                                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
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
                    title="Limbo"
                    showAdd
                    onAddClick={handleAddDebt}
                />

                {/* Resumo Total */}
                <div className="card mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Total em Dívidas</h2>
                    </div>

                    <div className="text-center">
                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                            {formatAmount(totalDebts)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {debts.length} dívida{debts.length !== 1 ? 's' : ''} registrada{debts.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Lista de Dívidas */}
                <div className="space-y-3">
                    {debts.length === 0 ? (
                        <div className="card text-center py-8">
                            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 mb-2">Nenhuma dívida registrada</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                Adicione sua primeira dívida clicando no botão +
                            </p>
                        </div>
                    ) : (
                        debts.map((debt) => (
                            <div key={debt.id} className="card">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                                            {debt.description}
                                        </h3>
                                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                            {formatAmount(debt.amount)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(debt.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEditDebt(debt)}
                                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDebt(debt.id)}
                                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>

            {/* Formulário de Dívida */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md lg:max-w-lg">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            {editingDebt ? 'Editar Dívida' : 'Nova Dívida'}
                        </h3>

                        <form onSubmit={handleSaveDebt} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Descrição
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field"
                                    placeholder="Ex: Empréstimo do João"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Valor
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="input-field pl-10"
                                        placeholder="0,00"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingDebt(undefined);
                                        setFormData({ description: '', amount: '' });
                                    }}
                                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    {editingDebt ? 'Atualizar' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bottom Navigation apenas no mobile */}
            <div className="lg:hidden">
                <BottomNavigation />
            </div>
        </div>
    );
}
