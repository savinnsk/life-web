'use client';

import { Filter, Search } from 'lucide-react';
import { useState } from 'react';

interface TaskFiltersProps {
    onFilterChange: (filters: {
        status: string;
        priority: string;
        tag: string;
        search: string;
    }) => void;
    currentFilters: {
        status: string;
        priority: string;
        tag: string;
        search: string;
    };
}

export default function TaskFilters({ onFilterChange, currentFilters }: TaskFiltersProps) {
    const [showFilters, setShowFilters] = useState(false);

    const handleFilterChange = (key: string, value: string) => {
        onFilterChange({
            ...currentFilters,
            [key]: value
        });
    };

    const clearFilters = () => {
        onFilterChange({
            status: 'all',
            priority: 'all',
            tag: 'all',
            search: ''
        });
    };

    const hasActiveFilters = currentFilters.status !== 'all' ||
        currentFilters.priority !== 'all' ||
        currentFilters.tag !== 'all' ||
        currentFilters.search !== '';

    return (
        <div className="space-y-4">
            {/* Barra de busca e botão de filtros */}
            <div className="flex space-x-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar tarefas..."
                        value={currentFilters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${showFilters || hasActiveFilters
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600'
                        }`}
                >
                    <Filter className="w-4 h-4" />
                </button>
            </div>

            {/* Filtros expandidos */}
            {showFilters && (
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-white">Filtros</h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Limpar filtros
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                value={currentFilters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                            >
                                <option value="all">Todos</option>
                                <option value="pending">Pendente</option>
                                <option value="in_progress">Em Andamento</option>
                                <option value="completed">Concluída</option>
                                <option value="cancelled">Cancelada</option>
                            </select>
                        </div>

                        {/* Prioridade */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Prioridade
                            </label>
                            <select
                                value={currentFilters.priority}
                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                            >
                                <option value="all">Todas</option>
                                <option value="low">Baixa</option>
                                <option value="medium">Média</option>
                                <option value="high">Alta</option>
                                <option value="urgent">Urgente</option>
                            </select>
                        </div>

                        {/* Tag */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tag
                            </label>
                            <input
                                type="text"
                                value={currentFilters.tag === 'all' ? '' : currentFilters.tag}
                                onChange={(e) => handleFilterChange('tag', e.target.value || 'all')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                                placeholder="Digite uma tag para filtrar"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
