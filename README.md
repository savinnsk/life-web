# 💰 Controle Financeiro Mobile

Um aplicativo mobile-first para controle de finanças pessoais, construído com Next.js e SQLite.

## ✨ Funcionalidades

- 📱 **Interface Mobile-First**: Otimizado para celular com design responsivo
- 💳 **Controle de Transações**: Adicione receitas e despesas facilmente
- 📊 **Resumos Mensais**: Visualize seu saldo e gastos por mês
- 🔄 **Sistema de Parcelas**: Controle compras parceladas automaticamente
- 📈 **Relatórios**: Acompanhe sua evolução financeira ao longo do tempo
- 🏷️ **Categorias**: Organize suas transações por categorias
- 💾 **Banco Local**: Dados salvos localmente com SQLite

## 🚀 Como Executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar em desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Abrir no navegador:**
   ```
   http://localhost:3000
   ```

## 📱 Como Usar

### Adicionando Transações
1. Clique no botão "+" na tela inicial
2. Preencha os dados da transação
3. Marque "Esta transação é parcelada" se necessário
4. Salve a transação

### Visualizando Resumos
1. Acesse a aba "Resumos"
2. Navegue entre os meses usando as setas
3. Veja gráficos e estatísticas detalhadas

### Controlando Parcelas
1. Acesse a aba "Parcelas"
2. Veja todas as parcelas pendentes e vencidas
3. Filtre por status (todas, pendentes, vencidas)

## 🛠️ Tecnologias Utilizadas

- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização utilitária
- **SQLite**: Banco de dados local
- **Lucide React**: Ícones
- **date-fns**: Manipulação de datas

## 📁 Estrutura do Projeto

```
├── app/                    # Páginas da aplicação
│   ├── api/               # API Routes
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes reutilizáveis
├── lib/                   # Utilitários e configurações
│   ├── database.ts        # Configuração do SQLite
│   └── types.ts           # Tipos TypeScript
└── public/                # Arquivos estáticos
```

## 🎨 Design System

O app utiliza um design system consistente com:
- Cores primárias: Azul (#3b82f6)
- Cores de sucesso: Verde (#22c55e)
- Cores de perigo: Vermelho (#ef4444)
- Tipografia: Sistema nativo do dispositivo
- Componentes touch-friendly (mínimo 44px)

## 📊 Banco de Dados

O SQLite é configurado automaticamente com as seguintes tabelas:
- `transactions`: Transações financeiras
- `categories`: Categorias de receitas e despesas

## 🔧 Configuração

O banco de dados é criado automaticamente na pasta `data/` na primeira execução.

## 📱 PWA

O app é configurado como PWA (Progressive Web App) e pode ser instalado no dispositivo móvel.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
