'use client';

import BottomNavigation from '@/components/BottomNavigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import TaskCard from '@/components/TaskCard';
import TaskFilters from '@/components/TaskFilters';
import TaskForm from '@/components/TaskForm';
import { Task } from '@/lib/types';
import { AlertTriangle, BarChart3, CheckCircle2, CreditCard, Home, Plus, Settings, StickyNote } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        tag: 'all',
        search: ''
    });

    // Buscar dados
    const fetchData = async () => {
        try {
            setLoading(true);

            // Buscar tarefas
            const tasksResponse = await fetch('/api/tasks');
            if (tasksResponse.ok) {
                const tasksData = await tasksResponse.json();
                setTasks(tasksData);
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filtrar tarefas
    const filteredTasks = tasks.filter(task => {
        if (filters.status !== 'all' && task.status !== filters.status) return false;
        if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
        if (filters.tag !== 'all' && task.tags && !task.tags.toLowerCase().includes(filters.tag.toLowerCase())) return false;
        if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
            !task.description?.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
    });

    // Salvar tarefa
    const handleSaveTask = async (taskData: Partial<Task>) => {
        try {
            const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
            const method = editingTask ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            if (response.ok) {
                await fetchData();
                setShowForm(false);
                setEditingTask(null);
            } else {
                const error = await response.json();
                alert(error.error || 'Erro ao salvar tarefa');
            }
        } catch (error) {
            console.error('Erro ao salvar tarefa:', error);
            alert('Erro ao salvar tarefa');
        }
    };

    // Deletar tarefa
    const handleDeleteTask = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

        try {
            const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            if (response.ok) {
                await fetchData();
            } else {
                alert('Erro ao excluir tarefa');
            }
        } catch (error) {
            console.error('Erro ao excluir tarefa:', error);
            alert('Erro ao excluir tarefa');
        }
    };

    // Alterar status da tarefa
    const handleStatusChange = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                await fetchData();
            }
        } catch (error) {
            console.error('Erro ao alterar status:', error);
        }
    };

    // Estatísticas
    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header Mobile */}
                <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Tarefas
                        </h1>
                        <button
                            onClick={() => setShowForm(true)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Layout Desktop */}
                <div className="hidden lg:flex min-h-screen">
                    {/* Sidebar */}
                    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
                        {/* Header da Sidebar */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tarefas</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Gerencie suas tarefas e projetos
                            </p>
                        </div>

                        {/* Navegação da Sidebar */}
                        <nav className="flex-1 p-4">
                            <div className="space-y-2">
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="font-medium">Nova Tarefa</span>
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
                                        <a href="/limbo" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <AlertTriangle className="w-5 h-5" />
                                            <span>Limbo</span>
                                        </a>
                                        <a href="/tasks" className="flex items-center space-x-3 px-4 py-2 text-blue-600 dark:text-blue-400 rounded-lg bg-blue-50 dark:bg-blue-900/20 transition-colors">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span>Tarefas</span>
                                        </a>
                                        <a href="/notes" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                            <StickyNote className="w-5 h-5" />
                                            <span>Anotações</span>
                                        </a>
                                        <a href="/settings" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <Settings className="w-5 h-5" />
                                            <span>Configurações</span>
                                        </a>
                                    </div>
                                </div>

                                {/* Estatísticas */}
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                        Estatísticas
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Total</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{stats.total}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Pendentes</span>
                                            <span className="font-medium text-yellow-600 dark:text-yellow-400">{stats.pending}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Em Andamento</span>
                                            <span className="font-medium text-blue-600 dark:text-blue-400">{stats.inProgress}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Concluídas</span>
                                            <span className="font-medium text-green-600 dark:text-green-400">{stats.completed}</span>
                                        </div>
                                        {stats.overdue > 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Atrasadas</span>
                                                <span className="font-medium text-red-600 dark:text-red-400">{stats.overdue}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div>

                    {/* Conteúdo Principal */}
                    <div className="flex-1 p-6">
                        <div className="max-w-4xl mx-auto">
                            <TaskFilters
                                onFilterChange={setFilters}
                                currentFilters={filters}
                            />

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : filteredTasks.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Nenhuma tarefa encontrada
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        {filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.tag !== 'all'
                                            ? 'Tente ajustar os filtros para encontrar suas tarefas.'
                                            : 'Comece criando sua primeira tarefa.'
                                        }
                                    </p>
                                    {!filters.search && filters.status === 'all' && filters.priority === 'all' && filters.tag === 'all' && (
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Criar Primeira Tarefa
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredTasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onEdit={setEditingTask}
                                            onDelete={handleDeleteTask}
                                            onStatusChange={handleStatusChange}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Layout Mobile */}
                <div className="lg:hidden p-4">
                    <TaskFilters
                        onFilterChange={setFilters}
                        currentFilters={filters}
                    />

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Nenhuma tarefa encontrada
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.tag !== 'all'
                                    ? 'Tente ajustar os filtros para encontrar suas tarefas.'
                                    : 'Comece criando sua primeira tarefa.'
                                }
                            </p>
                            {!filters.search && filters.status === 'all' && filters.priority === 'all' && filters.tag === 'all' && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Criar Primeira Tarefa
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onEdit={setEditingTask}
                                    onDelete={handleDeleteTask}
                                    onStatusChange={handleStatusChange}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Formulário */}
                <TaskForm
                    isOpen={showForm || !!editingTask}
                    onClose={() => {
                        setShowForm(false);
                        setEditingTask(null);
                    }}
                    onSave={handleSaveTask}
                    task={editingTask}
                />

                {/* Bottom Navigation apenas no mobile */}
                <div className="lg:hidden">
                    <BottomNavigation />
                </div>
            </div>
        </ProtectedRoute>
    );
}
