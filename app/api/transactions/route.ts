import { dbMethods } from '@/lib/database';
import { Transaction } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

// GET - Buscar transações
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const type = searchParams.get('type');

        let query = `
      SELECT t.*, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category = c.name
      WHERE 1=1
    `;
        const params: (string | number)[] = [];

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
        const body = await request.json();
        const { description, amount, type, category, date, is_parceled, total_parcels, paid } = body;

        if (!description || !amount || !type || !category || !date) {
            return NextResponse.json({ error: 'Campos obrigatórios não fornecidos' }, { status: 400 });
        }

        // Se for parcelado, criar apenas as parcelas (não a transação principal)
        if (is_parceled && total_parcels > 1) {
            const parcelAmount = amount / total_parcels;
            const transactionDate = new Date(date);

            // Criar a transação principal para referência
            const parentResult = await dbMethods.runWithId(
                `INSERT INTO transactions (description, amount, type, category, date, is_parceled, total_parcels)
            VALUES (?, ?, ?, ?, ?, 0, ?)`,
                description, amount, type, category, date, total_parcels
            );

            const parentId = parentResult.lastID;

            for (let i = 1; i <= total_parcels; i++) {
                const parcelDate = new Date(transactionDate);
                parcelDate.setMonth(parcelDate.getMonth() + (i - 1));

                await dbMethods.runWithId(
                    `INSERT INTO transactions (description, amount, type, category, date, is_parceled, total_parcels, current_parcel, parent_transaction_id, paid)
           VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
                    `${description} (${i}/${total_parcels})`,
                    parcelAmount,
                    type,
                    category,
                    parcelDate.toISOString().split('T')[0],
                    total_parcels,
                    i,
                    parentId,
                    paid
                );
            }

            return NextResponse.json({ id: parentId, message: 'Transação parcelada criada com sucesso' });
        } else {
            // Transação normal (não parcelada)
            const result = await dbMethods.runWithId(
                `INSERT INTO transactions (description, amount, type, category, date, is_parceled, total_parcels, current_parcel, paid)
            VALUES (?, ?, ?, ?, ?, 0, 1, 1, ?)`,
                description, amount, type, category, date, paid
            );

            const transactionId = result.lastID;
            return NextResponse.json({ id: transactionId, message: 'Transação criada com sucesso' });
        }
    } catch (error) {
        console.error('Erro ao criar transação:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
