'use client';

import { Task } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    Calendar,
    CheckCircle2,
    Circle,
    Edit,
    Flag,
    MoreVertical,
    PlayCircle,
    Trash2,
    XCircle
} from 'lucide-react';
import { useState } from 'react';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
    onStatusChange: (id: number, status: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
    const [showActions, setShowActions] = useState(false);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'in_progress':
                return <PlayCircle className="w-5 h-5 text-blue-500" />;
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Circle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
            case 'in_progress':
                return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
            case 'cancelled':
                return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
            default:
                return 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700';
        }
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

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return <Flag className="w-3 h-3" />;
            case 'high':
                return <Flag className="w-3 h-3" />;
            case 'medium':
                return <Flag className="w-3 h-3" />;
            case 'low':
                return <Flag className="w-3 h-3" />;
            default:
                return <Flag className="w-3 h-3" />;
        }
    };

    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

    // Parse tags from string
    const taskTags = task.tags ? task.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-3 ${getStatusColor(task.status)} transition-all duration-200 hover:shadow-md`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                    <button
                        onClick={() => onStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                        className="mt-1 hover:scale-110 transition-transform"
                    >
                        {getStatusIcon(task.status)}
                    </button>

                    <div className="flex-1 min-w-0">
                        <h3 className={`font-medium text-gray-900 dark:text-white ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                            {task.title}
                        </h3>

                        {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                {task.description}
                            </p>
                        )}

                        <div className="flex items-center flex-wrap gap-2 mt-3">
                            {/* Tags */}
                            {taskTags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                >
                                    {tag}
                                </span>
                            ))}

                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {getPriorityIcon(task.priority)}
                                <span className="capitalize">{task.priority}</span>
                            </div>

                            {task.due_date && (
                                <div className={`flex items-center space-x-1 text-xs ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowActions(!showActions)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>

                    {showActions && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                            <button
                                onClick={() => {
                                    onEdit(task);
                                    setShowActions(false);
                                }}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                            >
                                <Edit className="w-4 h-4" />
                                <span>Editar</span>
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(task.id);
                                    setShowActions(false);
                                }}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Excluir</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
