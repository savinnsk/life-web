'use client';

import { Category, Transaction } from '@/lib/types';
import { ArrowDownLeft, ArrowUpRight, Calendar, DollarSign, FileText, Repeat, Tag, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TransactionFormProps {
    transaction?: Transaction;
    onSave: (transaction: Omit<Transaction, 'id' | 'created_at'>) => void;
    onCancel: () => void;
}

export default function TransactionForm({ transaction, onSave, onCancel }: TransactionFormProps) {
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'expense' as 'income' | 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0],
        is_parceled: false,
        total_parcels: 2,
        is_fixed: false
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (transaction) {
            setFormData({
                description: transaction.description,
                amount: transaction.amount.toString(),
                type: transaction.type,
                category: transaction.category,
                date: transaction.date,
                is_parceled: Boolean(transaction.is_parceled),
                total_parcels: transaction.total_parcels,
                is_fixed: Boolean(transaction.is_fixed)
            });
        }
    }, [transaction]);

    useEffect(() => {
        fetchCategories();
    }, [formData.type]);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`/api/categories?type=${formData.type}`);
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const transactionData = {
                ...formData,
                amount: parseFloat(formData.amount),
                total_parcels: formData.is_parceled ? Math.max(2, parseInt(formData.total_parcels.toString()) || 2) : 1,
                current_parcel: 1,
                paid: false
            };

            await onSave(transactionData);
        } catch (error) {
            console.error('Erro ao salvar transação:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => {
            const newData = {
                ...prev,
                [field]: value
            };

            // Se marcar como fixo, desmarcar parcelado
            if (field === 'is_fixed' && value) {
                newData.is_parceled = false;
            }
            // Se marcar como parcelado, desmarcar fixo
            if (field === 'is_parceled' && value) {
                newData.is_fixed = false;
            }

            return newData;
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-end lg:items-center justify-center">
            <div className="bg-white dark:bg-slate-800 rounded-t-2xl lg:rounded-2xl w-full max-w-md lg:max-w-2xl max-h-[85vh] lg:max-h-[90vh] flex flex-col shadow-2xl mx-4">
                <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {transaction ? 'Editar Transação' : 'Nova Transação'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-4 space-y-4 lg:space-y-6">
                        {/* Layout Desktop - Duas Colunas */}
                        <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 space-y-4">
                            {/* Coluna 1 */}
                            <div className="space-y-4">
                                {/* Tipo de Transação */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tipo
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('type', 'income')}
                                            className={`p-3 rounded-lg border-2 transition-colors ${formData.type === 'income'
                                                ? 'border-success-500 bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-300'
                                                : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center space-x-2">
                                                <ArrowUpRight className="w-4 h-4" />
                                                <span className="font-medium">Receita</span>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('type', 'expense')}
                                            className={`p-3 rounded-lg border-2 transition-colors ${formData.type === 'expense'
                                                ? 'border-danger-500 bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300'
                                                : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center space-x-2">
                                                <ArrowDownLeft className="w-4 h-4" />
                                                <span className="font-medium">Despesa</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Descrição */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Descrição
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            className="input-field pl-10"
                                            placeholder="Ex: Salário, Almoço, Uber..."
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Valor */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Valor
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.amount}
                                            onChange={(e) => handleInputChange('amount', e.target.value)}
                                            className="input-field pl-10"
                                            placeholder="0,00"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Coluna 2 */}
                            <div className="space-y-4">
                                {/* Categoria */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Categoria
                                    </label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                        <select
                                            value={formData.category}
                                            onChange={(e) => handleInputChange('category', e.target.value)}
                                            className="input-field pl-10"
                                            required
                                        >
                                            <option value="">Selecione uma categoria</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.name}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Data */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Data
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => handleInputChange('date', e.target.value)}
                                            className="input-field pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Opções de Recorrência */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Opções de Recorrência</h3>

                            {/* Parcelado */}
                            <div>
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_parceled}
                                        onChange={(e) => handleInputChange('is_parceled', e.target.checked)}
                                        className="w-4 h-4 text-primary-600 border-gray-300 dark:border-slate-600 rounded focus:ring-primary-500 bg-white dark:bg-slate-700"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Esta transação é parcelada
                                    </span>
                                </label>
                            </div>

                            {/* Fixo */}
                            <div>
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_fixed}
                                        onChange={(e) => handleInputChange('is_fixed', e.target.checked)}
                                        className="w-4 h-4 text-primary-600 border-gray-300 dark:border-slate-600 rounded focus:ring-primary-500 bg-white dark:bg-slate-700"
                                    />
                                    <div className="flex items-center space-x-2">
                                        <Repeat className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Esta transação é fixa (recorrente)
                                        </span>
                                    </div>
                                </label>
                                {formData.is_fixed && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                                        Será replicada automaticamente para os próximos 12 meses
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Número de Parcelas */}
                        {formData.is_parceled && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Número de Parcelas
                                </label>
                                <input
                                    type="number"
                                    min="2"
                                    max="24"
                                    value={formData.total_parcels}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || (parseInt(value) >= 2 && parseInt(value) <= 24)) {
                                            handleInputChange('total_parcels', value === '' ? '' : parseInt(value));
                                        }
                                    }}
                                    className="input-field"
                                    required
                                />
                            </div>
                        )}

                    </form>
                </div>

                {/* Botões fixos */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn-secondary flex-1 py-3"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn-primary flex-1 py-3"
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
