'use client';

import BottomNavigation from '@/components/BottomNavigation';
import Header from '@/components/Header';
import { AlertTriangle, BarChart3, CheckSquare, CreditCard, Download, Home, Info, Settings, StickyNote, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = () => {
        // Implementar exportação de dados
        alert('Funcionalidade de exportação será implementada em breve');
    };

    const handleImportData = () => {
        // Implementar importação de dados
        alert('Funcionalidade de importação será implementada em breve');
    };

    const handleClearData = async () => {
        if (confirm('Tem certeza que deseja excluir todos os dados? Esta ação não pode ser desfeita.')) {
            try {
                const response = await fetch('/api/transactions/clear', {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert('Todos os dados foram excluídos com sucesso');
                    window.location.reload();
                } else {
                    alert('Erro ao excluir dados');
                }
            } catch (error) {
                console.error('Erro ao excluir dados:', error);
                alert('Erro ao excluir dados');
            }
        }
    };

    return (
        <div className="min-h-screen pb-20 lg:pb-0">
            {/* Layout Desktop */}
            <div className="hidden lg:flex lg:min-h-screen lg:h-screen w-full">
                {/* Sidebar */}
                <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
                    {/* Header da Sidebar */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Configurações</h1>
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
                                    <a href="/parcels" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <CreditCard className="w-5 h-5" />
                                        <span>Parcelas</span>
                                    </a>
                                    <a href="/limbo" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
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
                                    <a href="/settings" className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 transition-colors">
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
                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* Informações do App */}
                            <div className="card p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <Info className="w-6 h-6 text-primary-600" />
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sobre o App</h2>
                                </div>

                                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                    <p><strong>Versão:</strong> 1.0.0</p>
                                    <p><strong>Desenvolvido para:</strong> Controle financeiro pessoal</p>
                                    <p><strong>Banco de dados:</strong> SQLite local</p>
                                </div>
                            </div>

                            {/* Categorias */}
                            <div className="card p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <Settings className="w-6 h-6 text-primary-600" />
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Categorias</h2>
                                </div>

                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {categories.map((category) => (
                                            <div key={category.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: category.color }}
                                                    ></div>
                                                    <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full ${category.type === 'income'
                                                    ? 'bg-success-100 text-success-700'
                                                    : 'bg-danger-100 text-danger-700'
                                                    }`}>
                                                    {category.type === 'income' ? 'Receita' : 'Despesa'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Backup e Restauração */}
                            <div className="card p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Backup e Restauração</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={handleExportData}
                                        className="flex items-center space-x-3 p-4 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                                    >
                                        <Download className="w-5 h-5" />
                                        <span className="font-medium">Exportar Dados</span>
                                    </button>

                                    <button
                                        onClick={handleImportData}
                                        className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <Upload className="w-5 h-5" />
                                        <span className="font-medium">Importar Dados</span>
                                    </button>
                                </div>
                            </div>

                            {/* Zona de Perigo */}
                            <div className="card p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                                <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-6">Zona de Perigo</h2>

                                <button
                                    onClick={handleClearData}
                                    className="flex items-center space-x-3 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors mb-4"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    <span className="font-medium">Excluir Todos os Dados</span>
                                </button>

                                <p className="text-sm text-red-600 dark:text-red-400">
                                    ⚠️ Esta ação excluirá permanentemente todas as transações e configurações.
                                </p>
                            </div>

                            {/* Dicas de Uso */}
                            <div className="card p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Dicas de Uso</h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-300">
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">💡 Adicione transações regularmente</p>
                                        <p>Mantenha seu controle financeiro sempre atualizado</p>
                                    </div>

                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">📊 Use parcelas para compras grandes</p>
                                        <p>Divida compras em parcelas para melhor controle</p>
                                    </div>

                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">📈 Acompanhe os resumos mensais</p>
                                        <p>Veja como está sua situação financeira ao longo do tempo</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout Mobile */}
            <div className="lg:hidden">
                <Header title="Configurações" />

                {/* Informações do App */}
                <div className="card mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Info className="w-5 h-5 text-primary-600" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sobre o App</h2>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p><strong>Versão:</strong> 1.0.0</p>
                        <p><strong>Desenvolvido para:</strong> Controle financeiro pessoal</p>
                        <p><strong>Banco de dados:</strong> SQLite local</p>
                    </div>
                </div>

                {/* Categorias */}
                <div className="card mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Settings className="w-5 h-5 text-primary-600" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Categorias</h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
                            <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <div key={category.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: category.color }}
                                        ></div>
                                        <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${category.type === 'income'
                                        ? 'bg-success-100 text-success-700'
                                        : 'bg-danger-100 text-danger-700'
                                        }`}>
                                        {category.type === 'income' ? 'Receita' : 'Despesa'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Backup e Restauração */}
                <div className="card mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Backup e Restauração</h2>

                    <div className="space-y-3">
                        <button
                            onClick={handleExportData}
                            className="w-full flex items-center space-x-3 p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            <span className="font-medium">Exportar Dados</span>
                        </button>

                        <button
                            onClick={handleImportData}
                            className="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Upload className="w-5 h-5" />
                            <span className="font-medium">Importar Dados</span>
                        </button>
                    </div>
                </div>

                {/* Zona de Perigo */}
                <div className="card mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                    <h2 className="text-lg font-bold text-red-800 dark:text-red-300 mb-4">Zona de Perigo</h2>

                    <div className="space-y-3">
                        <button
                            onClick={handleClearData}
                            className="w-full flex items-center space-x-3 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                            <span className="font-medium">Excluir Todos os Dados</span>
                        </button>
                    </div>

                    <p className="text-sm text-red-600 dark:text-red-400 mt-3">
                        ⚠️ Esta ação excluirá permanentemente todas as transações e configurações.
                    </p>
                </div>

                {/* Dicas de Uso */}
                <div className="card">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Dicas de Uso</h2>

                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                        <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">💡 Adicione transações regularmente</p>
                            <p>Mantenha seu controle financeiro sempre atualizado</p>
                        </div>

                        <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">📊 Use parcelas para compras grandes</p>
                            <p>Divida compras em parcelas para melhor controle</p>
                        </div>

                        <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">📈 Acompanhe os resumos mensais</p>
                            <p>Veja como está sua situação financeira ao longo do tempo</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Navigation apenas no mobile */}
            <div className="lg:hidden">
                <BottomNavigation />
            </div>
        </div>
    );
}
