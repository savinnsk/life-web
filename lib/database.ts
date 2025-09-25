import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const dbPath = path.join(process.cwd(), 'data', 'finance.db');

// Garantir que o diretório existe
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Promisificar métodos do sqlite3
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));
const dbExec = promisify(db.exec.bind(db));

// Função customizada para db.run que retorna lastID
const dbRunWithId = (sql: string, ...params: any[]): Promise<{ lastID: number; changes: number }> => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
};

// Inicializar banco de dados
const initDatabase = async () => {
    try {
        await dbExec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        is_parceled BOOLEAN DEFAULT 0,
        total_parcels INTEGER,
        current_parcel INTEGER,
        parent_transaction_id INTEGER,
        paid BOOLEAN DEFAULT 0,
        paid_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_transaction_id) REFERENCES transactions(id)
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        color TEXT DEFAULT '#3b82f6',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Inserir categorias padrão
      INSERT OR IGNORE INTO categories (name, type, color) VALUES
        ('Salário', 'income', '#22c55e'),
        ('Freelance', 'income', '#22c55e'),
        ('Investimentos', 'income', '#22c55e'),
        ('Alimentação', 'expense', '#ef4444'),
        ('Transporte', 'expense', '#ef4444'),
        ('Moradia', 'expense', '#ef4444'),
        ('Saúde', 'expense', '#ef4444'),
        ('Educação', 'expense', '#ef4444'),
        ('Lazer', 'expense', '#ef4444'),
        ('Outros', 'expense', '#6b7280');
    `);
    } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
    }
};

// Inicializar o banco
initDatabase();

// Adicionar campos se não existirem
const addMissingColumns = async () => {
    try {
        await dbExec(`ALTER TABLE transactions ADD COLUMN paid BOOLEAN DEFAULT 0`);
    } catch (error) {
        // Campo já existe, ignorar erro
    }

    try {
        await dbExec(`ALTER TABLE transactions ADD COLUMN paid_at DATETIME`);
    } catch (error) {
        // Campo já existe, ignorar erro
    }
};

addMissingColumns();

// Função wrapper para db.all que aceita array de parâmetros
const dbAllWithParams = (sql: string, params: any[] = []) => {
    if (params.length === 0) {
        return dbAll(sql);
    }
    return (dbAll as any)(sql, ...params);
};

// Função wrapper para db.get que aceita array de parâmetros
const dbGetWithParams = (sql: string, params: any[] = []) => {
    if (params.length === 0) {
        return dbGet(sql);
    }
    return (dbGet as any)(sql, ...params);
};

// Função wrapper para db.run que aceita array de parâmetros
const dbRunWithParams = (sql: string, params: any[] = []) => {
    if (params.length === 0) {
        return dbRun(sql);
    }
    return (dbRun as any)(sql, ...params);
};

// Exportar métodos promisificados
export const dbMethods = {
    run: dbRunWithParams,
    runWithId: dbRunWithId,
    get: dbGetWithParams,
    all: dbAllWithParams,
    exec: dbExec
};

export default db;
