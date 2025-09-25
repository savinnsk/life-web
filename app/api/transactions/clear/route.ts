import { dbMethods } from '@/lib/database';
import { NextResponse } from 'next/server';

// DELETE - Limpar todos os dados
export async function DELETE() {
    try {
        // Excluir todas as transações
        await dbMethods.run('DELETE FROM transactions');

        // Excluir todas as categorias (exceto as padrão)
        await dbMethods.run('DELETE FROM categories WHERE id > 10');

        return NextResponse.json({ message: 'Todos os dados foram excluídos com sucesso' });
    } catch (error) {
        console.error('Erro ao limpar dados:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
