import { authenticateRequest } from '@/lib/auth';
import { dbMethods } from '@/lib/database';
import { Transaction } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

// Função para criar transações fixas para os próximos meses
async function createFixedTransactions(userId: number, parentId: number, description: string, amount: number, type: string, category: string, startDate: string) {
    const start = new Date(startDate);

    for (let i = 1; i <= 12; i++) {
        const nextMonth = new Date(start);
        nextMonth.setMonth(nextMonth.getMonth() + i);

        await dbMethods.runWithId(
            `INSERT INTO transactions (user_id, description, amount, type, category, date, is_parceled, total_parcels, current_parcel, parent_transaction_id, is_fixed, paid)
         VALUES (?, ?, ?, ?, ?, ?, 0, 1, 1, ?, 1, 0)`,
            userId,
            description,
            amount,
            type,
            category,
            nextMonth.toISOString().split('T')[0],
            parentId
        );
    }
}

// GET - Buscar transação por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const { id } = params;
        const transaction = await dbMethods.get('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, user.id]) as Transaction;

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
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { description, amount, type, category, date, paid, is_fixed } = body;

        if (!description || !amount || !type || !category || !date) {
            return NextResponse.json({ error: 'Campos obrigatórios não fornecidos' }, { status: 400 });
        }

        // Buscar a transação atual para verificar se é fixa
        const currentTransaction = await dbMethods.get('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, user.id]) as Transaction;

        if (!currentTransaction) {
            return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 });
        }

        // Se for uma transação fixa, atualizar todas as instâncias futuras
        if (currentTransaction.is_fixed) {
            await dbMethods.run(
                `UPDATE transactions
           SET description = ?, amount = ?, type = ?, category = ?, paid = ?
           WHERE user_id = ? AND (parent_transaction_id = ? OR id = ?)`,
                [description, amount, type, category, paid, user.id, currentTransaction.parent_transaction_id || id, id]
            );
        } else {
            // Transação normal
            await dbMethods.run(
                `UPDATE transactions
           SET description = ?, amount = ?, type = ?, category = ?, date = ?, paid = ?, is_fixed = ?
           WHERE id = ? AND user_id = ?`,
                [description, amount, type, category, date, paid, is_fixed || 0, id, user.id]
            );

            // Se foi marcado como fixo agora, criar para os próximos meses
            if (is_fixed && !currentTransaction.is_fixed) {
                await createFixedTransactions(user.id, id, description, amount, type, category, date);
            }
        }

        return NextResponse.json({ message: 'Transação atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// DELETE - Deletar transação
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const { id } = params;

        // Primeiro, verificar se é uma transação parcelada ou fixa
        const transaction = await dbMethods.get('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, user.id]) as Transaction;

        if (transaction) {
            // Se for uma transação fixa, deletar todas as instâncias futuras
            if (transaction.is_fixed) {
                const parentId = transaction.parent_transaction_id || id;
                await dbMethods.run('DELETE FROM transactions WHERE user_id = ? AND (parent_transaction_id = ? OR id = ?)', [user.id, parentId, parentId]);
            }
            // Se for uma transação principal parcelada (não parcelada), deletar todas as parcelas vinculadas
            else if (!transaction.is_parceled) {
                await dbMethods.run('DELETE FROM transactions WHERE user_id = ? AND parent_transaction_id = ?', [user.id, id]);
            }
            // Se for uma parcela, deletar apenas ela
            else if (transaction.parent_transaction_id) {
                // Verificar se é a última parcela restante
                const remainingParcels = await dbMethods.get(
                    'SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND parent_transaction_id = ? AND id != ?',
                    [user.id, transaction.parent_transaction_id, id]
                );

                // Se for a última parcela, deletar também a transação principal
                if (remainingParcels.count === 0) {
                    await dbMethods.run('DELETE FROM transactions WHERE user_id = ? AND id = ?', [user.id, transaction.parent_transaction_id]);
                }
            }
        }

        // Deletar a transação atual
        await dbMethods.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, user.id]);

        return NextResponse.json({ message: 'Transação deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar transação:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
