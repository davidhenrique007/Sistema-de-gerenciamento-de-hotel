

<div align="center">

# 🏨 Hotel Paradise

### Sistema de Gerenciamento Hoteleiro Full-Stack

Reservas online · Pagamentos integrados · Painel administrativo completo

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/Licença-MIT-green?style=flat-square)

</div>

---

## 📋 Índice

- [Sobre o Projecto](#sobre-o-projecto)
- [Screenshots](#screenshots)
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

## Screenshots

### 🏠 Página Inicial

<p align="center">
  <img src="docs/screenshots/client/home/home-1.png" width="700"/>
  <img src="docs/screenshots/client/home/home-2.png" width="700"/>
  <img src="docs/screenshots/client/home/home-3.png" width="700"/>
  <img src="docs/screenshots/client/home/home-4.png" width="700"/>
  <img src="docs/screenshots/client/home/home-5.png" width="700"/>
  <img src="docs/screenshots/client/home/home-6.png" width="700"/>
</p>

---

### 🔐 Autenticação do Cliente

<p align="center">
  <img src="docs/screenshots/client/auth/reserva.png" width="700"/>
</p>

---

### 💳 Checkout e Pagamento

<p align="center">
  <img src="docs/screenshots/client/checkout/checkout-1.png" width="45%"/>
  <img src="docs/screenshots/client/checkout/checkout-2.png" width="45%"/>
  <img src="docs/screenshots/client/checkout/checkout-3.png" width="45%"/>
</p>

---

### 🧾 Recibo de Pagamento

<p align="center">
  <img src="docs/screenshots/client/receipt/Recibo.png" width="600"/>
</p>

---

### 📋 Minhas Reservas

<p align="center">
  <img src="docs/screenshots/client/my-reservations/Minha-Reserva-cliente-1.png" width="45%"/>
  <img src="docs/screenshots/client/my-reservations/Minha-Reserva-cliente-2.png" width="45%"/>
  <img src="docs/screenshots/client/my-reservations/Minha-Reserva-cliente.png" width="45%"/>
</p>

---

### 🔑 Autenticação do Administrador

<p align="center">
  <img src="docs/screenshots/admin/autenticacao admin/autenticacao admin.png" width="700"/>
</p>

---

### 📊 Dashboard Administrativo

<p align="center">
  <img src="docs/screenshots/admin/dashboard/admin-dashboard.png" width="700"/>
</p>

---

### 📈 Análise e Relatórios

<p align="center">
  <img src="docs/screenshots/admin/analytics/admin-analise.png" width="700"/>
</p>

<p align="center">
  <img src="docs/screenshots/admin/reports/admin-relatorio-1.png" width="30%"/>
  <img src="docs/screenshots/admin/reports/admin-relatorio-2.png" width="30%"/>
  <img src="docs/screenshots/admin/reports/admin-relatorio-3.png" width="30%"/>
</p>

---

### 🛏️ Gestão de Quartos

<p align="center">
  <img src="docs/screenshots/admin/rooms/admin-quarto-1.png" width="45%"/>
  <img src="docs/screenshots/admin/rooms/admin-quarto-2.png" width="45%"/>
</p>

---

### 📅 Gestão de Reservas

<p align="center">
  <img src="docs/screenshots/admin/bookings/admin-reserva-1.png" width="45%"/>
  <img src="docs/screenshots/admin/bookings/admin-reserva-2.png" width="45%"/>
</p>

---

### 👥 Utilizadores · 💰 Financeiro · 🧾 Auditoria · 🗑️ Lixeira

<p align="center">
  <img src="docs/screenshots/admin/users/admin-utilizador.png" width="45%"/>
  <img src="docs/screenshots/admin/finance/admin-financeiro.png" width="45%"/>
</p>
<p align="center">
  <img src="docs/screenshots/admin/audit/admin-auditorio.png" width="45%"/>
  <img src="docs/screenshots/admin/trash/admin-lixeira.png" width="45%"/>
</p>

---

## Funcionalidades

### 👤 Área do Cliente (Experiência Completa de Reservas)

* **Visualização dinâmica de quartos** com galeria de imagens, filtros avançados e detalhes completos (preço, capacidade, comodidades e disponibilidade em tempo real)
* **Sistema inteligente de pesquisa** com verificação automática de conflitos de datas e disponibilidade instantânea
* **Motor de cálculo de preços** com regras de negócio (período de estadia, tipo de quarto, sazonalidade)
* **Fluxo completo de reserva multi-etapas** com validação de dados, confirmação e controlo de integridade
* **Sistema de pagamentos integrado e flexível:**

  * 💳 Cartões internacionais via Stripe
  * 📱 Pagamentos móveis via M-Pesa
  * 💵 Pagamento presencial (cash on arrival)
* **Geração automática de recibos em PDF** com identificador único e estrutura profissional
* **Notificações automáticas por e-mail** com confirmação e detalhes completos da reserva
* **Área pessoal do cliente** com autenticação segura baseada em JWT
* **Gestão completa de reservas:**

  * Visualização de histórico (pendente, confirmado, cancelado, concluído)
  * Cancelamento com regras configuráveis
  * Alteração de datas com validação de disponibilidade
* **Interface responsiva (mobile-first)** adaptada a smartphone, tablet e desktop
* **Experiência de utilizador optimizada** com feedback em tempo real (loading states, alerts e validações dinâmicas)

---

### ⚙️ Painel Administrativo (Sistema de Gestão Hoteleira Profissional)

* **Dashboard analítico em tempo real** com KPIs estratégicos:

  * Taxa de ocupação
  * Receita diária, mensal e acumulada
  * Reservas activas, concluídas e canceladas
  * Indicadores de performance operacional
* **Visualização avançada de dados** com gráficos interactivos (tendências, distribuição por tipo de quarto e comportamento de reservas)
* **Gestão avançada de quartos (CRUD completo):**

  * Criação, edição e eliminação lógica (soft delete)
  * Recuperação de registos via lixeira
  * Controlo de disponibilidade em tempo real
* **Sistema robusto de gestão de reservas:**

  * Check-in e check-out (manual ou automático)
  * Monitorização de estadias activas
  * Actualização de estados em tempo real
* **Gestão de utilizadores e permissões (RBAC):**

  * Perfis: Admin, Staff e Cliente
  * Controlo granular de acesso por nível
* **Módulo financeiro integrado:**

  * Registo e rastreio de pagamentos
  * Reconciliação de transacções
  * Análise de receitas por período
* **Geração de relatórios exportáveis (PDF/Excel):**

  * Reservas
  * Receita
  * Ocupação
  * Actividade do sistema
* **Sistema completo de auditoria:**

  * Logs detalhados de acções dos utilizadores
  * Rastreabilidade de alterações críticas
  * Histórico de operações administrativas
* **Camada de segurança e monitorização:**

  * Autenticação JWT com refresh token
  * Validação e sanitização de dados (proteção contra XSS e SQL Injection)
  * Proteção contra acessos não autorizados
  * Controlo de sessões e integridade de dados
* **Painel optimizado para operações reais de hotel**, garantindo eficiência, controlo e tomada de decisão baseada em dados

---


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
| JWT + Bcrypt | — | Autenticação e hashing |
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

> **Backend:** `http://localhost:5000` · **Frontend:** `http://localhost:5173`

---

### Sem Docker (manual)

```bash
# Backend
cd backend
npm install
cp .env.example .env
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
| `NODE_ENV` | Ambiente (`development` / `production`) | ✅ |
| `PORT` | Porta do servidor (padrão: `5000`) | ✅ |
| `DB_HOST` | Host da base de dados | ✅ |
| `DB_PORT` | Porta da base de dados (padrão: `5432`) | ✅ |
| `DB_USER` | Utilizador PostgreSQL | ✅ |
| `DB_PASSWORD` | Password PostgreSQL | ✅ |
| `DB_NAME` | Nome da base de dados | ✅ |
| `JWT_SECRET` | Chave secreta JWT | ✅ |
| `JWT_REFRESH_SECRET` | Chave para refresh token | ✅ |
| `MPESA_CONSUMER_KEY` | Credenciais M-Pesa | Pagamentos M-Pesa |
| `MPESA_CONSUMER_SECRET` | Credenciais M-Pesa | Pagamentos M-Pesa |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe | Pagamentos com cartão |
| `STRIPE_WEBHOOK_SECRET` | Webhook Stripe | Pagamentos com cartão |
| `SMTP_HOST` | Servidor SMTP | Envio de e-mails |
| `SMTP_USER` | Utilizador SMTP | Envio de e-mails |
| `SMTP_PASS` | Password SMTP | Envio de e-mails |
| `REDIS_HOST` | Host do Redis | Filas de tarefas |
| `FRONTEND_URL` | URL do frontend | ✅ |

---

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
│   └── index.js
├── frontend/
│   └── src/
│       ├── features/    # Funcionalidades por domínio
│       │   ├── home/    # Página principal e reservas
│       │   └── payment/ # Componentes de pagamento
│       ├── shared/      # Componentes, hooks e utils partilhados
│       ├── contexts/    # Contextos React (Auth, Cart, Cliente)
│       ├── core/        # Domínio, use-cases e repositórios
│       └── di/          # Injecção de dependências
├── docs/
│   └── screenshots/     # Screenshots do sistema
│       ├── client/      # Área do cliente
│       └── admin/       # Área administrativa
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
