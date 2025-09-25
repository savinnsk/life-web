import { dbMethods } from '@/lib/database';
import { Transaction } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

// GET - Buscar transação por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const transaction = await dbMethods.get('SELECT * FROM transactions WHERE id = ?', [id]) as Transaction;

        if (!transaction) {
            return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 });
        }

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('Erro ao buscar transação:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// PUT - Atualizar transação
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { description, amount, type, category, date, paid } = body;

        if (!description || !amount || !type || !category || !date) {
            return NextResponse.json({ error: 'Campos obrigatórios não fornecidos' }, { status: 400 });
        }

        await dbMethods.run(
            `UPDATE transactions
       SET description = ?, amount = ?, type = ?, category = ?, date = ?, paid = ?
       WHERE id = ?`,
            [description, amount, type, category, date, paid, id]
        );

        return NextResponse.json({ message: 'Transação atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// DELETE - Deletar transação
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        await dbMethods.run('DELETE FROM transactions WHERE id = ?', [id]);

        return NextResponse.json({ message: 'Transação deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar transação:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
