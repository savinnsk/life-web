'use client';

import { Task } from '@/lib/types';
import { Flag, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Partial<Task>) => void;
    task?: Task | null;
}

export default function TaskForm({ isOpen, onClose, onSave, task }: TaskFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        priority: 'medium',
        due_date: ''
    });

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description || '',
                tags: task.tags || '',
                priority: task.priority,
                due_date: task.due_date || ''
            });
        } else {
            setFormData({
                title: '',
                description: '',
                tags: '',
                priority: 'medium',
                due_date: ''
            });
        }
    }, [task, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert('Título é obrigatório');
            return;
        }

        const taskData = {
            ...formData,
            tags: formData.tags || undefined,
            due_date: formData.due_date || undefined,
            priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent'
        };

        onSave(taskData);
        onClose();
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
            case 'high':
                return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
            case 'low':
                return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
            default:
                return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="p-6 flex-shrink-0">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6">
                    <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
                        {/* Título */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Título *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                                placeholder="Digite o título da tarefa"
                                required
                            />
                        </div>

                        {/* Descrição */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Descrição
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                                placeholder="Digite a descrição da tarefa"
                                rows={3}
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tags
                            </label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                                placeholder="Ex: trabalho, urgente, projeto (separadas por vírgula)"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Separe as tags por vírgula
                            </p>
                        </div>

                        {/* Prioridade */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Prioridade
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {['low', 'medium', 'high', 'urgent'].map((priority) => (
                                    <button
                                        key={priority}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority })}
                                        className={`p-3 rounded-lg border-2 transition-all ${formData.priority === priority
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <Flag className="w-4 h-4" />
                                            <span className="text-sm font-medium capitalize">{priority}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Data de vencimento */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Data de Vencimento
                            </label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                            />
                        </div>

                    </form>
                </div>

                {/* Botões fixos no final */}
                <div className="p-6 pt-4 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium min-h-[44px]"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            form="task-form"
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium min-h-[44px]"
                        >
                            {task ? 'Atualizar' : 'Criar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
