import { dbMethods } from '@/lib/database';
import { Transaction } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const query = `
            SELECT * FROM transactions
            WHERE is_parceled = 1
            ORDER BY date ASC
        `;

        const parcels = await dbMethods.all(query) as Transaction[];

        return NextResponse.json(parcels);
    } catch (error) {
        console.error('Erro ao buscar parcelas:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
