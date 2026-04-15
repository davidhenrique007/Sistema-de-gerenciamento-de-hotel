<!-- docs/manual_admin.md -->
# Manual do Painel Administrativo - Hotel Paradise

## Índice

1. [Visão Geral](#visão-geral)
2. [Perfis de Acesso](#perfis-de-acesso)
3. [Dashboard](#dashboard)
4. [Gestão de Reservas](#gestão-de-reservas)
5. [Gestão de Quartos](#gestão-de-quartos)
6. [Pagamentos](#pagamentos)
7. [Gestão de Utilizadores](#gestão-de-utilizadores)
8. [Auditoria](#auditoria)
9. [Check-in/Check-out](#check-incheck-out)
10. [Resolução de Problemas](#resolução-de-problemas)

---

## Visão Geral

O Painel Administrativo do Hotel Paradise é uma ferramenta completa para gestão hoteleira, permitindo:

- 📅 Gestão de reservas
- 🏨 Controlo de quartos
- 💰 Processamento de pagamentos
- 👥 Gestão de utilizadores
- 📊 Análise de métricas
- 🔒 Auditoria de ações

**Acesso:** `http://localhost:3000/login-admin`

---

## Perfis de Acesso

### 👑 Administrador
**Acesso:** Total ao sistema

| Módulo | Permissão |
|--------|-----------|
| Dashboard | ✅ Visualizar |
| Reservas | ✅ Criar, Editar, Cancelar, Check-in/out |
| Quartos | ✅ Criar, Editar, Status |
| Pagamentos | ✅ Visualizar, Confirmar |
| Utilizadores | ✅ Criar, Editar, Desativar |
| Auditoria | ✅ Visualizar todos os logs |

### 🛎️ Rececionista
**Acesso:** Operações diárias do hotel

| Módulo | Permissão |
|--------|-----------|
| Dashboard | ✅ Visualizar |
| Reservas | ✅ Criar, Editar, Check-in/out |
| Quartos | ✅ Visualizar, Editar status |
| Pagamentos | ❌ Sem acesso |
| Utilizadores | ❌ Sem acesso |
| Auditoria | ❌ Sem acesso |

### 💳 Financeiro
**Acesso:** Gestão financeira

| Módulo | Permissão |
|--------|-----------|
| Dashboard | ✅ Visualizar (limitado) |
| Reservas | ❌ Sem acesso |
| Quartos | ❌ Sem acesso |
| Pagamentos | ✅ Visualizar, Confirmar |
| Utilizadores | ❌ Sem acesso |
| Auditoria | ✅ Visualizar logs financeiros |

---

## Dashboard

O Dashboard apresenta métricas em tempo real:

- **Reservas Hoje:** Total de reservas para o dia atual
- **Check-ins Pendentes:** Hóspedes aguardando chegada
- **Pagamentos Atrasados:** Pagamentos em atraso
- **Taxa de Ocupação:** Percentual de quartos ocupados
- **Receita do Mês:** Faturamento acumulado

**Atualização:** Dados atualizados a cada 30 segundos

---

## Gestão de Reservas

### Ações disponíveis por reserva:

| Ação | Admin | Rececionista | Financeiro |
|------|-------|--------------|------------|
| Visualizar | ✅ | ✅ | ❌ |
| Editar | ✅ | ✅ | ❌ |
| Cancelar | ✅ | ✅ | ❌ |
| Check-in | ✅ | ✅ | ❌ |
| Check-out | ✅ | ✅ | ❌ |
| Confirmar Pagamento | ✅ | ❌ | ✅ |

### Como editar uma reserva:

1. Clique nos 3 pontinhos (⋮) na linha da reserva
2. Selecione "Editar"
3. Altere os dados necessários
4. Clique em "Salvar Alterações"

### Como cancelar uma reserva:

1. Clique nos 3 pontinhos (⋮)
2. Selecione "Cancelar"
3. Informe o motivo (mínimo 10 caracteres)
4. Confirme o cancelamento

---

## Gestão de Quartos

### Estados dos quartos:

- 🟢 **Disponível:** Quarto livre para reserva
- 🟡 **Ocupado:** Hóspede hospedado
- 🔴 **Manutenção:** Quarto em reparo

### Como adicionar um quarto:

1. Aceda a "Quartos" no menu lateral
2. Clique em "+ Novo Quarto"
3. Preencha os dados (número, tipo, andar, preço)
4. Clique em "Salvar"

---

## Pagamentos

### Como confirmar um pagamento:

1. Aceda a "Reservas"
2. Localize a reserva com status "Pendente"
3. Clique nos 3 pontinhos (⋮)
4. Selecione "Confirmar Pagamento"
5. O status muda para "Pago"

**Nota:** Apenas Admin e Financeiro podem confirmar pagamentos.

---

## Gestão de Utilizadores

### Criar novo utilizador:

1. Aceda a "Utilizadores"
2. Clique em "+ Novo Utilizador"
3. Preencha:
   - Nome completo
   - Email
   - Telefone
   - Perfil (Admin/Rececionista/Financeiro)
   - Senha inicial
4. Clique em "Criar Utilizador"

### Redefinir senha:

1. Localize o utilizador na tabela
2. Clique no ícone de atualização (🔄)
3. Confirme a ação
4. Uma nova senha será enviada por email

---

## Auditoria

A página de Auditoria regista todas as ações importantes:

| Ação registrada | Descrição |
|-----------------|-----------|
| LOGIN_SUCCESS | Login bem sucedido |
| LOGIN_FAILURE | Tentativa de login falhada |
| CREATE_USER | Criação de utilizador |
| UPDATE_USER | Edição de utilizador |
| EDIT_RESERVATION | Edição de reserva |
| CANCEL_RESERVATION | Cancelamento de reserva |
| CHECKIN | Realização de check-in |
| CHECKOUT | Realização de check-out |
| CONFIRM_PAYMENT | Confirmação de pagamento |
| ACL_DENIED | Tentativa de acesso negado |

### Como usar os filtros:

1. Selecione uma ação no dropdown
2. Defina um intervalo de datas
3. Clique em "Buscar"

---

## Check-in/Check-out

### Realizar Check-in:

1. Localize a reserva confirmada
2. Clique nos 3 pontinhos (⋮)
3. Selecione "Check-in"
4. O sistema regista a hora de entrada
5. O quarto fica marcado como ocupado

### Realizar Check-out:

1. Localize a reserva com status "Hospedado"
2. Clique nos 3 pontinhos (⋮)
3. Selecione "Check-out"
4. O sistema regista a hora de saída
5. O quarto é libertado

---

## Resolução de Problemas

### Erro 403 - Acesso Negado

**Causa:** O seu perfil não tem permissão para aceder a este recurso.

**Solução:** Contacte o administrador para ajustar as permissões.

### Erro 401 - Não Autenticado

**Causa:** Sessão expirada ou token inválido.

**Solução:** Faça logout e login novamente.

### Dados não atualizam

**Causa:** Cache do dashboard.

**Solução:** Clique no botão "Atualizar" ou aguarde 30 segundos.

### Não consigo cancelar reserva

**Causa:** Motivo do cancelamento muito curto.

**Solução:** Forneça um motivo com pelo menos 10 caracteres.

---

## Suporte

Em caso de dúvidas ou problemas:

- 📧 Email: suporte@hotelparadise.com
- 📞 Telefone: (+258) 84 123 4567

---

**Versão do Manual:** 1.0
**Última Atualização:** Abril 2026