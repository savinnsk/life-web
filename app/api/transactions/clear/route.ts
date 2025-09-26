import { authenticateRequest } from '@/lib/auth';
import { dbMethods } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

// DELETE - Limpar todos os dados do usuário
export async function DELETE(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        // Excluir todas as transações do usuário
        await dbMethods.run('DELETE FROM transactions WHERE user_id = ?', [user.id]);

        // Excluir todas as categorias do usuário (exceto as padrão que são criadas pelo trigger)
        await dbMethods.run('DELETE FROM categories WHERE user_id = ?', [user.id]);

        // Excluir todas as dívidas do limbo do usuário
        await dbMethods.run('DELETE FROM limbo_debts WHERE user_id = ?', [user.id]);

        return NextResponse.json({ message: 'Todos os seus dados foram excluídos com sucesso' });
    } catch (error) {
        console.error('Erro ao limpar dados:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
