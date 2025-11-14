# Estuda.AI

Sistema de educação inteligente com IA para auxiliar professores e alunos no processo de ensino-aprendizagem, onde o aluno possui um professor socrático que sempre o incentiva a ter pensamentos críticos e o professor terá um relatório de dificuldades que os alunos possuem.

## 🎯 Funcionalidades

### Para Alunos
- Chat com IA (método socrático) que estimula pensamento crítico
- Histórico de conversas organizadas por turmas
- Aceitar convites de turmas

### Para Professores
- Criar e gerenciar turmas
- Convidar alunos via código de convite
- Visualizar relatórios de dificuldades dos alunos
- Acompanhar progresso individual

## 🛠️ Tecnologias

### Backend
- Node.js 20 + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Google Gemini AI
- JWT Authentication
- Jest (testes unitários)
- SSE (Server-Sent Events)

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- React Query (TanStack Query)
- React Hook Form + Zod
- Axios

### DevOps
- Docker + Docker Compose
- Biome (linter/formatter)

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (versão 20.10 ou superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (geralmente já vem incluído no Docker Desktop)

## 🚀 Como executar o projeto


#### Backend

Crie um arquivo `.env` dentro da pasta `backend` com as seguintes variáveis:

```env
#DATABASE
DATABASE_URL="CONNECT_YOUR_DATABASE"

#APICHATBOT
GOOGLE_API_KEY="CONNECT_YOUR_GOOGLE_API_KEY"

#JWT_SECRET
SECRET_JWT="INSERT_YOUR_SECRET_JWT"

#BCRYPTSALT
SALT_ROUNDS=8

#PORT
PORT=8080

```

#### Frontend

Crie um arquivo `.env` dentro da pasta `frontend` com as seguintes variáveis:

```env
#BACKENDURL
NEXT_PUBLIC_API_URL=http://localhost:8080

# JWT Secret (mesmo do backend, usado apenas no server-side/middleware)
SECRET_JWT="SAME_BACKEND_JWT"

### Inicie com Docker
```bash
docker-compose up --build -d
```

Aguarde 1-2 minutos para:
- Build das imagens
- Instalação de dependências
- Migrações do Prisma
- Seed do banco (usuários de teste)

### 4. Acesse

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432

### Acesse a aplicação

Após a inicialização completa (aguarde cerca de 1-2 minutos):

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Banco de dados**: localhost:5432

### Credenciais de teste (seed)

Após o seed, você pode fazer login com:

**Professor:**
- Email: `professor@teste.com`
- Senha: `testeteste`

**Aluno:**
- Email: `aluno@teste.com`
- Senha: `testeteste`

## 📦 Estrutura do Projeto

```
estuda.ai/
├── backend/
│   ├── src/
│   │   ├── config/         # Configurações (env)
│   │   ├── controllers/    # Controladores HTTP
│   │   ├── services/       # Lógica de negócio
│   │   ├── schemas/        # Validações Zod
│   │   ├── handlers/       # Middlewares (auth)
│   │   ├── events/         # Event emitter (SSE)
│   │   └── http/           # Server e rotas
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── tests/              # Testes Jest
│   └── Dockerfile
├── frontend/
│   ├── app/                # App Router
│   ├── components/         # Componentes React
│   │   ├── auth/           # Login/Registro
│   │   ├── chat/           # Interface de chat
│   │   ├── classes/        # Gestão de turmas
│   │   └── ui/             # Componentes base
│   ├── services/           # API calls
│   ├── contexts/           # React Context
│   ├── hooks/              # Custom hooks
│   └── Dockerfile
└── docker-compose.yml
```

## 🛠️ Comandos Úteis

```bash
# Logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Parar
docker-compose down

# Rebuild
docker-compose up --build

# Acessar containers
docker exec -it estuda-ai-backend sh
docker exec -it estuda-ai-frontend sh

# Migrations
docker exec -it estuda-ai-backend npx prisma migrate dev

# Seed
docker exec -it estuda-ai-backend npm run seed
```


### Ver logs dos contêineres

```bash
# Todos os serviços
docker-compose logs -f

# Apenas o backend
docker-compose logs -f backend

# Apenas o frontend
docker-compose logs -f frontend
```

### Parar os contêineres

```bash
docker-compose down
```

### Parar e remover volumes (apaga os dados do banco)

```bash
docker-compose down -v
```

### Reconstruir as imagens

```bash
docker-compose up --build
```

### Acessar o terminal de um contêiner

```bash
# Backend
docker exec -it estuda-ai-backend sh

# Frontend
docker exec -it estuda-ai-frontend sh

# Banco de dados
docker exec -it estuda-ai-postgres psql -U admin -d estuda_ai
```

### Executar migrations do Prisma

```bash
docker exec -it estuda-ai-backend npx prisma migrate dev
```

### Executar seed do banco de dados

```bash
docker exec -it estuda-ai-backend npm run seed
```



### Porta já em uso

Se alguma porta estiver em uso, você pode alterá-las no arquivo `.env` na raiz do projeto:

```env
BACKEND_PORT=8080
FRONTEND_PORT=3000
POSTGRES_PORT=5432
```

### Problemas de conexão com o banco de dados

1. Verifique se o contêiner do PostgreSQL está rodando:
   ```bash
   docker ps
   ```

2. Verifique os logs do banco de dados:
   ```bash
   docker-compose logs postgres
   ```


## 📸 Screenshots
![Imagem do chat](https://i.imgur.com/tEkUcr5.png)

![Imagem do relatório](https://i.imgur.com/yRc14Y3.png)

![Imagem dos alunos](https://i.imgur.com/PpIJWln.png)




## 🎓 Aprendizados

Este projeto foi desenvolvido como TCC e permitiu aprender:
- Arquitetura de microsserviços com Docker
- Integração com IA (Google Gemini)
- Streaming com SSE
- Autenticação JWT
- Testes automatizados
- TypeScript full-stack

## 📄 Licença

Este projeto é parte de um Trabalho de Conclusão de Curso (TCC).

## 👨‍💻 Autor

Diego - 2025


