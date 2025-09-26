import { authenticateRequest } from '@/lib/auth';
import { dbMethods } from '@/lib/database';
import { Transaction } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

// GET - Buscar transações
export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const type = searchParams.get('type');

        let query = `
      SELECT t.*, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category = c.name AND c.user_id = t.user_id
      WHERE t.user_id = ?
    `;
        const params: (string | number)[] = [user.id];

        if (month && year) {
            query += ` AND strftime('%m', t.date) = ? AND strftime('%Y', t.date) = ?`;
            params.push(month.padStart(2, '0'), year);
        }

        if (type) {
            query += ` AND t.type = ?`;
            params.push(type);
        }

        query += ` AND (t.is_parceled = 0 OR t.is_parceled IS NULL) ORDER BY t.date DESC, t.created_at DESC`;

        const transactions = await dbMethods.all(query, params) as Transaction[];

        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// POST - Criar transação
export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const body = await request.json();
        const { description, amount, type, category, date, is_parceled, total_parcels, paid, is_fixed } = body;

        if (!description || !amount || !type || !category || !date) {
            return NextResponse.json({ error: 'Campos obrigatórios não fornecidos' }, { status: 400 });
        }

        // Validação: não pode ser fixo e parcelado ao mesmo tempo
        if (is_fixed && is_parceled) {
            return NextResponse.json({ error: 'Um item não pode ser fixo e parcelado ao mesmo tempo' }, { status: 400 });
        }

        // Se for parcelado, criar apenas as parcelas (não a transação principal)
        if (is_parceled && total_parcels > 1) {
            const parcelAmount = amount / total_parcels;
            const transactionDate = new Date(date);

            // Criar a transação principal para referência
            const parentResult = await dbMethods.runWithId(
                `INSERT INTO transactions (user_id, description, amount, type, category, date, is_parceled, total_parcels, is_fixed)
            VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
                user.id, description, amount, type, category, date, total_parcels, is_fixed || 0
            );

            const parentId = parentResult.lastID;

            for (let i = 1; i <= total_parcels; i++) {
                const parcelDate = new Date(transactionDate);
                parcelDate.setMonth(parcelDate.getMonth() + (i - 1));

                await dbMethods.runWithId(
                    `INSERT INTO transactions (user_id, description, amount, type, category, date, is_parceled, total_parcels, current_parcel, parent_transaction_id, is_fixed, paid)
           VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)`,
                    user.id,
                    `${description} (${i}/${total_parcels})`,
                    parcelAmount,
                    type,
                    category,
                    parcelDate.toISOString().split('T')[0],
                    total_parcels,
                    i,
                    parentId,
                    is_fixed || 0,
                    paid
                );
            }

            return NextResponse.json({ id: parentId, message: 'Transação parcelada criada com sucesso' });
        } else {
            // Transação normal (não parcelada)
            const result = await dbMethods.runWithId(
                `INSERT INTO transactions (user_id, description, amount, type, category, date, is_parceled, total_parcels, current_parcel, is_fixed, paid)
            VALUES (?, ?, ?, ?, ?, ?, 0, 1, 1, ?, ?)`,
                user.id, description, amount, type, category, date, is_fixed || 0, paid
            );

            const transactionId = result.lastID;

            // Se for fixo, criar para os próximos 12 meses
            if (is_fixed) {
                await createFixedTransactions(user.id, transactionId, description, amount, type, category, date);
            }

            return NextResponse.json({ id: transactionId, message: 'Transação criada com sucesso' });
        }
    } catch (error) {
        console.error('Erro ao criar transação:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

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
