import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { dbMethods } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface User {
    id: number;
    username: string;
    name: string;
    created_at: string;
}

export interface AuthToken {
    userId: number;
    username: string;
}

// Gerar token JWT
export function generateToken(user: User): string {
    const payload: AuthToken = {
        userId: user.id,
        username: user.username
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verificar token JWT
export function verifyToken(token: string): AuthToken | null {
    try {
        return jwt.verify(token, JWT_SECRET) as AuthToken;
    } catch (error) {
        return null;
    }
}

// Hash da senha
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

// Verificar senha
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// Criar usuário
export async function createUser(username: string, password: string, name: string): Promise<User> {
    const hashedPassword = await hashPassword(password);

    const result = await dbMethods.runWithId(
        'INSERT INTO users (username, password, name) VALUES (?, ?, ?)',
        username,
        hashedPassword,
        name
    );

    return {
        id: result.lastID,
        username,
        name,
        created_at: new Date().toISOString()
    };
}

// Buscar usuário por username
export async function getUserByUsername(username: string): Promise<(User & { password: string }) | null> {
    const user = await dbMethods.get(
        'SELECT * FROM users WHERE username = ?',
        [username]
    );

    return user || null;
}

// Buscar usuário por ID
export async function getUserById(id: number): Promise<User | null> {
    const user = await dbMethods.get(
        'SELECT id, username, name, created_at FROM users WHERE id = ?',
        [id]
    );

    return user || null;
}

// Middleware para verificar autenticação
export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
        return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
        return null;
    }

    return getUserById(payload.userId);
}

// Middleware para verificar autenticação em API routes
export async function authenticateRequest(request: NextRequest): Promise<User | null> {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value;

    if (!token) {
        return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
        return null;
    }

    return getUserById(payload.userId);
}
