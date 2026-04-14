# 🏨 Hotel Paradise — Sistema de Gerenciamento de Hotel

Sistema completo de gerenciamento hoteleiro com painel administrativo, reservas online, pagamentos integrados e geração de recibos digitais.

---

## 📋 Índice

- [Sobre o Projecto](#sobre-o-projecto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitectura](#arquitectura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Testes](#testes)
- [Estrutura do Projecto](#estrutura-do-projecto)
- [API — Principais Endpoints](#api--principais-endpoints)
- [Contribuição](#contribuição)
- [Licença](#licença)

---

## Sobre o Projecto

O **Hotel Paradise** é uma plataforma full-stack para gestão hoteleira que permite ao cliente fazer reservas online e ao administrador gerir quartos, reservas, pagamentos e utilizadores através de um painel dedicado.

O sistema suporta múltiplos métodos de pagamento (M-Pesa, cartão via Stripe e dinheiro na chegada), emite recibos em PDF enviados por e-mail, e disponibiliza um dashboard com análises de ocupação e receita.

---

## Funcionalidades

### Área do Cliente
- Visualização de quartos disponíveis com imagens e detalhes
- Seleção de datas e cálculo automático de preço
- Processo de reserva com checkout completo
- Pagamento via M-Pesa, Stripe (cartão) ou dinheiro
- Recibo digital em PDF enviado por e-mail
- Área de perfil com histórico de reservas
- Cancelamento e alteração de reservas

### Painel Administrativo
- Dashboard com métricas em tempo real (ocupação, receita, reservas)
- Gráficos de análise (ocupação, receita, distribuição por tipo de quarto)
- Gestão completa de quartos (CRUD + lixeira com recuperação)
- Gestão de reservas com check-in / check-out
- Gestão de utilizadores e permissões
- Relatórios exportáveis
- Logs de auditoria

### Segurança
- Autenticação JWT com refresh token
- Rate limiting por IP
- Sanitização contra XSS
- Headers HTTP seguros com Helmet
- CORS configurado
- Protecção contra SQL Injection

---

## Tecnologias

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 18+ | Interface do utilizador |
| Vite | 4+ | Build e servidor de desenvolvimento |
| React Router | 6+ | Roteamento |
| Context API | — | Gestão de estado |
| CSS Modules | — | Estilização isolada |

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 4.18+ | Framework HTTP |
| PostgreSQL | 15+ | Base de dados |
| Knex / Objection.js | — | Query builder e ORM |
| JWT | — | Autenticação |
| Bcrypt | — | Hashing de senhas |
| Bull + Redis | — | Filas de tarefas |
| PDFKit | — | Geração de recibos |
| Nodemailer | — | Envio de e-mails |
| Stripe | — | Pagamentos com cartão |
| M-Pesa API | — | Pagamentos móveis |

### DevOps
| Ferramenta | Uso |
|---|---|
| Docker + Docker Compose | Containerização |
| Jest + Supertest | Testes |
| ESLint + Prettier | Qualidade de código |

---

## Arquitectura

O projecto segue uma arquitectura em camadas no backend:

```
Cliente (Browser)
       │
       ▼ HTTPS/JSON
API Gateway (Express)
  Rate Limiting · CORS · Helmet
       │
       ▼
  Routes → Controllers → Services → Repositories
                                        │
                                        ▼
                               PostgreSQL Database
```

**Padrões utilizados:** MVC, Repository, Service Layer, Dependency Injection, DTO.

Consulte [`docs/arquitetura.md`](docs/arquitetura.md) para o diagrama completo.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- [Docker](https://www.docker.com/) e Docker Compose (recomendado)
- PostgreSQL 15+ (se executar sem Docker)
- Redis (para filas de tarefas)

---

## Instalação e Execução

### Com Docker (recomendado)

```bash
# 1. Clonar o repositório
git clone https://github.com/davidhenrique007/Sistema-de-gerenciamento-de-hotel.git
cd Sistema-de-gerenciamento-de-hotel

# 2. Copiar e configurar variáveis de ambiente
cp backend/.env.example backend/.env
# Editar backend/.env com as suas credenciais

# 3. Iniciar todos os serviços
docker compose up -d

# 4. Executar migrations e seeds
docker compose exec backend npm run db:setup

# 5. Iniciar o frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

O backend estará disponível em `http://localhost:5000` e o frontend em `http://localhost:5173`.

---

### Sem Docker (manual)

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Editar .env com as suas credenciais

npm run db:migrate   # Executar migrations
npm run db:seed      # Popular dados iniciais
npm run dev          # Iniciar servidor (porta 5000)

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev          # Iniciar (porta 5173)
```

---

## Variáveis de Ambiente

Copie `backend/.env.example` para `backend/.env` e preencha as seguintes variáveis:

| Variável | Descrição | Obrigatória |
|---|---|---|
| `NODE_ENV` | Ambiente (`development` / `production`) | Sim |
| `PORT` | Porta do servidor (padrão: `5000`) | Sim |
| `DB_HOST` | Host da base de dados | Sim |
| `DB_PORT` | Porta da base de dados (padrão: `5432`) | Sim |
| `DB_USER` | Utilizador PostgreSQL | Sim |
| `DB_PASSWORD` | Password PostgreSQL | Sim |
| `DB_NAME` | Nome da base de dados | Sim |
| `JWT_SECRET` | Chave secreta JWT | Sim |
| `JWT_REFRESH_SECRET` | Chave para refresh token | Sim |
| `MPESA_CONSUMER_KEY` | Credenciais M-Pesa | Para pagamentos M-Pesa |
| `MPESA_CONSUMER_SECRET` | Credenciais M-Pesa | Para pagamentos M-Pesa |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe | Para pagamentos com cartão |
| `STRIPE_WEBHOOK_SECRET` | Webhook Stripe | Para pagamentos com cartão |
| `SMTP_HOST` | Servidor SMTP | Para envio de e-mails |
| `SMTP_USER` | Utilizador SMTP | Para envio de e-mails |
| `SMTP_PASS` | Password SMTP | Para envio de e-mails |
| `REDIS_HOST` | Host do Redis | Para filas de tarefas |
| `FRONTEND_URL` | URL do frontend | Sim |


## Testes

```bash
cd backend

npm test                 # Executar todos os testes
npm run test:watch       # Modo watch (re-executa ao salvar)
npm run test:coverage    # Gerar relatório de cobertura
```

O projecto inclui:
- **Testes unitários** — lógica de negócio e utilitários
- **Testes de integração** — fluxos completos de API (auth, reservas, pagamentos)
- **Testes de segurança** — injecção SQL e XSS
- **Testes de stress** — concorrência e carga

---

## Estrutura do Projecto

```
Sistema-de-gerenciamento-de-hotel/
├── backend/
│   ├── config/          # Configurações (DB, Auth, Stripe, M-Pesa)
│   ├── controllers/     # Controladores HTTP
│   │   └── admin/       # Controladores do painel admin
│   ├── middlewares/     # Autenticação, rate limit, sanitização
│   ├── models/          # Modelos Objection.js e migrations
│   │   └── migrations/  # Migrations da base de dados
│   ├── routes/          # Definição de rotas
│   │   └── admin/       # Rotas do painel admin
│   ├── services/        # Regras de negócio
│   │   └── jobs/        # Jobs agendados (cron)
│   ├── templates/       # Templates de e-mail (HTML)
│   ├── tests/           # Testes (unit, integration, security, stress)
│   ├── utils/           # Utilitários e helpers
│   ├── seeds/           # Dados iniciais da base de dados
│   ├── docs/            # Documentação técnica
│   ├── .env.example     # Exemplo de variáveis de ambiente
│   ├── Dockerfile
│   └── index.js         # Ponto de entrada do servidor
├── frontend/
│   └── src/
│       ├── features/    # Funcionalidades por domínio
│       │   ├── home/    # Página principal e reservas
│       │   └── payment/ # Componentes de pagamento
│       ├── shared/      # Componentes, hooks e utils partilhados
│       ├── contexts/    # Contextos React (Auth, Cart, Cliente)
│       ├── core/        # Domínio, use-cases e repositórios
│       └── di/          # Injecção de dependências
├── docs/                # Documentação geral do projecto
├── docker-compose.yml
└── README.md
```

---

## API — Principais Endpoints

### Autenticação
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/auth/login` | Login de utilizador |
| `POST` | `/api/auth/refresh` | Renovar token |
| `POST` | `/api/auth/logout` | Logout |

### Quartos
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/rooms` | Listar quartos disponíveis |
| `GET` | `/api/rooms/:id` | Detalhes de um quarto |
| `POST` | `/api/admin/rooms` | Criar quarto (admin) |
| `PUT` | `/api/admin/rooms/:id` | Actualizar quarto (admin) |
| `DELETE` | `/api/admin/rooms/:id` | Eliminar quarto (admin) |

### Reservas
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/reservations` | Criar reserva |
| `GET` | `/api/reservations/:id` | Ver reserva |
| `PUT` | `/api/reservations/:id/cancel` | Cancelar reserva |
| `GET` | `/api/admin/reservations` | Listar todas (admin) |
| `PUT` | `/api/admin/reservations/:id/checkin` | Check-in (admin) |
| `PUT` | `/api/admin/reservations/:id/checkout` | Check-out (admin) |

### Pagamentos
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/payments/mpesa` | Iniciar pagamento M-Pesa |
| `POST` | `/api/payments/stripe` | Iniciar pagamento Stripe |
| `POST` | `/api/payments/cash` | Registar pagamento em dinheiro |

---

## Contribuição

1. Faça um fork do projecto
2. Crie uma branch para a sua feature (`git checkout -b feat/nome-da-feature`)
3. Faça commit das suas alterações (`git commit -m 'feat: adiciona funcionalidade X'`)
4. Faça push para a branch (`git push origin feat/nome-da-feature`)
5. Abra um Pull Request

**Convenção de commits** (Conventional Commits):
- `feat:` nova funcionalidade
- `fix:` correcção de bug
- `docs:` alterações na documentação
- `refactor:` refatoração de código
- `test:` adição ou alteração de testes
- `chore:` tarefas de manutenção

---

## Licença

Este projecto está sob a licença MIT. Veja o ficheiro [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">Desenvolvido por <a href="https://github.com/davidhenrique007">David Henrique</a></p>
