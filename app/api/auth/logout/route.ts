import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const response = NextResponse.json({ message: 'Logout realizado com sucesso' });

        // Remover cookie de autenticação
        response.cookies.set('auth-token', '', {
            path: '/',
            expires: new Date(0)
        });

        return response;
    } catch (error) {
        console.error('Erro no logout:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
