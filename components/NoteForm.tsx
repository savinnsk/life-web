'use client';

import { Note } from '@/lib/types';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NoteFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (noteData: Partial<Note>) => Promise<void>;
    note?: Note | null;
}

const colorOptions = [
    { value: '#3b82f6', label: 'Azul', color: 'bg-blue-500' },
    { value: '#22c55e', label: 'Verde', color: 'bg-green-500' },
    { value: '#f59e0b', label: 'Amarelo', color: 'bg-yellow-500' },
    { value: '#ef4444', label: 'Vermelho', color: 'bg-red-500' },
    { value: '#8b5cf6', label: 'Roxo', color: 'bg-purple-500' },
    { value: '#06b6d4', label: 'Ciano', color: 'bg-cyan-500' },
    { value: '#f97316', label: 'Laranja', color: 'bg-orange-500' },
    { value: '#84cc16', label: 'Lima', color: 'bg-lime-500' },
];

export default function NoteForm({ isOpen, onClose, onSave, note }: NoteFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: '',
        color: '#3b82f6'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (note) {
            setFormData({
                title: note.title,
                content: note.content || '',
                tags: note.tags || '',
                color: note.color
            });
        } else {
            setFormData({
                title: '',
                content: '',
                tags: '',
                color: '#3b82f6'
            });
        }
    }, [note]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        setIsSubmitting(true);
        try {
            await onSave({
                title: formData.title.trim(),
                content: formData.content.trim() || undefined,
                tags: formData.tags.trim() || undefined,
                color: formData.color
            });
            onClose();
        } catch (error) {
            console.error('Erro ao salvar anotação:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-end lg:items-center justify-center">
            <div className="bg-white dark:bg-slate-800 rounded-t-2xl lg:rounded-2xl w-full max-w-md lg:max-w-2xl max-h-[85vh] lg:max-h-[90vh] flex flex-col shadow-2xl mx-4">
                <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                        {note ? 'Editar Anotação' : 'Nova Anotação'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Título */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                Título *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                                placeholder="Digite o título da anotação"
                                required
                            />
                        </div>

                        {/* Conteúdo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                Conteúdo
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                                placeholder="Digite o conteúdo da anotação"
                                rows={6}
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                Tags
                            </label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                                placeholder="Ex: finanças, investimentos, metas (separadas por vírgula)"
                            />
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                Separe as tags por vírgula
                            </p>
                        </div>

                        {/* Cor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                Cor
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {colorOptions.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: color.value })}
                                        className={`w-full h-10 rounded-lg border-2 transition-all ${formData.color === color.value
                                                ? 'border-gray-900 dark:border-slate-100 scale-110'
                                                : 'border-gray-300 dark:border-slate-600 hover:scale-105'
                                            }`}
                                    >
                                        <div className={`w-full h-full rounded-md ${color.color}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Botões fixos */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1 py-3"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.title.trim() || isSubmitting}
                            className="btn-primary flex-1 py-3"
                        >
                            {isSubmitting ? 'Salvando...' : note ? 'Atualizar' : 'Criar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
