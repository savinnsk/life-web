'use client';

import BottomNavigation from '@/components/BottomNavigation';
import Header from '@/components/Header';
import { Download, Info, Settings, Trash2, Upload } from 'lucide-react';
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
        <div className="min-h-screen pb-20">
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

            <BottomNavigation />
        </div>
    );
}
