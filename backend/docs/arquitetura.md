# 🏗️ ARQUITETURA DO SISTEMA - HOTEL PARADISE

## 1. VISÃO GERAL DA ARQUITETURA


┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (BROWSER)                        │
│  ┌──────────────────────────────────────────────────── ─────┐   │
│  │                    REACT APP (VITE)                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐          │   │
│  │  │   PÁGINAS  │  │COMPONENTES │  │   HOOKS    │          │   │
│  │  │   Home     │  │   Card     │  │ useRooms   │          │   │
│  │  │   Checkout │  │   Modal    │  │ useAuth    │          │   │
│  │  │   Admin    │  │   Button   │  │            │          │   │
│  │  └────────────┘  └────────────┘  └────────────┘          │   │
│  └────────────────────────────────────────────────── ───────┘   │
│                           │                                     │
│                        HTTPS/JSON                               │
│                           ▼                                     │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│                     API GATEWAY (EXPRESS)                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │ RATE       │  │   CORS     │  │  HELMET    │                 │
│  │ LIMITING   │  │            │  │            │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND - CAMADA DE APLICAÇÃO                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                        ROTAS                             │   │
│  │  /api/auth  /api/rooms  /api/reservations  /api/payments │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      CONTROLLERS                          │   │
│  │  • Recebem requisições HTTP                               │   │
│  │  • Validam entrada (Joi/Zod)                              │   │
│  │  • Chamam serviços                                        │   │
│  │  • Retornam respostas                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                        SERVICES                           │   │
│  │  • REGRAS DE NEGÓCIO                                      │   │
│  │  • Calcular preços                                        │   │
│  │  • Verificar disponibilidade                              │   │
│  │  • Processar pagamentos                                   │   │
│  │  • Enviar e-mails                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      REPOSITORIES                         │   │
│  │  • Acesso ao banco de dados                               │   │
│  │  • Consultas SQL                                          │   │
│  │  • CRUD operations                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│                     POSTGRESQL DATABASE                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │  users   │  │  guests  │  │  rooms   │  │reservations│ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │   │
│  │  ┌──────────┐  ┌──────────┐                               │   │
│  │  │ payments │  │ receipts │                               │   │
│  │  └──────────┘  └──────────┘                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

📦 SERVIÇOS EXTERNOS

• M-Pesa API (pagamentos)
• Stripe (cartão de crédito)
• Nodemailer (envio de e-mails)
• AWS S3 (imagens dos quartos)


2. STACK TECNOLÓGICA

Frontend

| Tecnologia   | Versão | Justificativa                       |
| ------------ | ------ | ----------------------------------- |
| React        | 18.2+  | Componentização e performance       |
| Vite         | 4+     | Build rápido e desenvolvimento ágil |
| React Router | 6+     | Roteamento                          |
| Context API  | -      | Gerenciamento de estado             |
| Axios        | 1+     | Comunicação com API                 |


Backend

| Tecnologia | Versão | Justificativa             |
| ---------- | ------ | ------------------------- |
| Node.js    | 18+    | Runtime JavaScript        |
| Express    | 4.18+  | Framework backend         |
| PostgreSQL | 14+    | Banco de dados relacional |
| JWT        | 8+     | Autenticação              |
| Bcrypt     | 5+     | Criptografia de senhas    |
| Joi/Zod    | -      | Validação de dados        |


Ferramentas de Desenvolvimento

| Ferramenta | Uso                    |
| ---------- | ---------------------- |
| ESLint     | Padronização de código |
| Prettier   | Formatação automática  |
| Jest       | Testes                 |
| Supertest  | Testes de API          |
| Git        | Controle de versão     |

---

3. ESTRUTURA DE MÓDULOS

📦 Módulo de Usuários

* Gerenciar administradores
* Autenticação (login)
* Permissões

📦 Módulo de Hóspedes

* Cadastro de clientes
* Histórico de estadias
* Documentos

📦 Módulo de Quartos

* CRUD de quartos
* Controle de status
* Tipos e preços

📦 Módulo de Reservas

* Criar reservas
* Verificar disponibilidade
* Cancelamentos
* Check-in / Check-out

📦 Módulo de Pagamentos

* Integração M-Pesa
* Integração Stripe
* Pagamento na chegada
* Histórico

📦 Módulo de Recibos

* Gerar PDF
* Enviar por e-mail
* Compartilhar WhatsApp

---

4. FLUXOS PRINCIPAIS

Fluxo do Cliente

1. Acessa página inicial
2. Visualiza quartos
3. Seleciona datas
4. Escolhe quarto
5. Faz login
6. Confirma reserva
7. Efetua pagamento
8. Recebe recibo

---

Fluxo do Admin

1. Login no painel
2. Visualiza dashboard
3. Gerencia quartos
4. Visualiza reservas
5. Cancela ou edita reservas
6. Gera relatórios
7. Gerencia usuários


5. PADRÕES DE PROJETO

| Padrão               | Uso                     |
| -------------------- | ----------------------- |
| MVC                  | Controllers / Models    |
| Repository           | Acesso ao banco         |
| Service Layer        | Regras de negócio       |
| Dependency Injection | Injeção de dependências |
| Factory              | Criação de objetos      |
| Observer             | Eventos do sistema      |
| DTO                  | Transferência de dados  |

6. SEGURANÇA

* JWT para autenticação
* Bcrypt para senhas
* Helmet para headers HTTP seguros
* CORS configurado
* Rate limiting
* Sanitização contra XSS
* Prevenção de SQL Injection
* HTTPS em produção