import { dbMethods } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

// PUT - Atualizar dívida do Limbo
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { description, amount } = body;

        if (!description || !amount) {
            return NextResponse.json({ error: 'Descrição e valor são obrigatórios' }, { status: 400 });
        }

        await dbMethods.run(
            'UPDATE limbo_debts SET description = ?, amount = ? WHERE id = ?',
            [description, amount, id]
        );

        return NextResponse.json({ message: 'Dívida atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar dívida:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// DELETE - Deletar dívida do Limbo
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        await dbMethods.run('DELETE FROM limbo_debts WHERE id = ?', [id]);

        return NextResponse.json({ message: 'Dívida deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar dívida:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
