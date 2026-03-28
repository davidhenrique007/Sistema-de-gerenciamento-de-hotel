# 📊 MODELAGEM DE DADOS - HOTEL PARADISE

## Versão: 2.0.0
## Data: 2024
## Autor: Tech Lead

---

## 1. VISÃO GERAL

Este documento descreve a modelagem completa do banco de dados do **Hotel Paradise**, incluindo:

- Entidades e relacionamentos
- Normalização (3ª Forma Normal)
- Constraints e regras de integridade
- Índices estratégicos
- Triggers e funções
- Exemplos de consultas otimizadas

---

## 2. DIAGRAMA ENTIDADE-RELACIONAMENTO (DER)

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ users │ │ guests │ │ rooms │
├─────────────┤ ├─────────────┤ ├─────────────┤
│ id (PK) │ │ id (PK) │ │ id (PK) │
│ name │ │ name │ │ room_number │
│ email │ │ phone │ │ type │
│ password │ │ document │ │ price │
│ role │ │ address │ │ capacity │
└──────┬──────┘ └──────┬──────┘ │ status │
│ │ └──────┬──────┘
│ │ │
│ ┌─────▼───────────────────────▼─────┐
│ │ reservations │
│ ├───────────────────────────────────┤
└──────────────►│ id (PK) │
│ guest_id (FK) │
│ room_id (FK) │
│ user_id (FK) │
│ check_in │
│ check_out │
│ total_price │
│ status │
└───────────────┬───────────────────┘
│
┌────────────┴────────────┐
│ │
┌─────▼─────┐ ┌─────▼─────┐
│ payments │ │ receipts │
├───────────┤ ├───────────┤
│ id (PK) │ │ id (PK) │
│ reservation_id (FK)────►│ payment_id│
│ amount │ │ number │
│ method │ │ pdf_url │
│ status │ └───────────┘
└───────────┘


---

## 3. NORMALIZAÇÃO (3ª FORMA NORMAL)

### 3.1 Verificação da 1ª Forma Normal (1NF)
| Tabela | Atributos Atômicos | OK |
|--------|-------------------|-----|
| users | ✅ Sim | ✔️ |
| guests | ✅ Sim (endereço quebrado em partes) | ✔️ |
| rooms | ✅ Sim (amenities como JSON) | ✔️ |
| reservations | ✅ Sim | ✔️ |

### 3.2 Verificação da 2ª Forma Normal (2NF)
| Tabela | Chave | Dependência Total | OK |
|--------|-------|-------------------|-----|
| users | id | ✅ Sim | ✔️ |
| guests | id | ✅ Sim | ✔️ |
| rooms | id | ✅ Sim | ✔️ |
| reservations | id | ✅ Sim | ✔️ |

### 3.3 Verificação da 3ª Forma Normal (3NF)
| Tabela | Dependências Transitivas | OK |
|--------|-------------------------|-----|
| users | Nenhuma | ✔️ |
| guests | Nenhuma (endereço atômico) | ✔️ |
| rooms | Nenhuma | ✔️ |
| reservations | Nenhuma | ✔️ |

---

## 4. ENTIDADES E RELACIONAMENTOS

### 4.1 users (Usuários do Sistema)
| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| id | UUID | Chave primária | PK, DEFAULT uuid_generate_v4() |
| name | VARCHAR(100) | Nome completo | NOT NULL |
| email | VARCHAR(100) | Email | UNIQUE, NOT NULL, formato email |
| password_hash | VARCHAR(255) | Hash da senha | NOT NULL |
| role | VARCHAR(20) | Perfil | CHECK IN ('admin','receptionist','financial') |
| is_active | BOOLEAN | Ativo? | DEFAULT true |
| last_login | TIMESTAMP | Último login | |
| created_at | TIMESTAMP | Data criação | DEFAULT CURRENT_TIMESTAMP |

### 4.2 guests (Hóspedes)
| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| id | UUID | Chave primária | PK, DEFAULT uuid_generate_v4() |
| name | VARCHAR(100) | Nome completo | NOT NULL |
| phone | VARCHAR(20) | Telefone | UNIQUE, NOT NULL, formato telefone |
| document | VARCHAR(20) | CPF/CNPJ | UNIQUE, formato documento |
| address_street | VARCHAR(255) | Logradouro | |
| address_city | VARCHAR(100) | Cidade | |
| ... | ... | ... | ... |

### 4.3 rooms (Quartos)
| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| id | UUID | Chave primária | PK |
| room_number | VARCHAR(10) | Número | UNIQUE, NOT NULL |
| type | VARCHAR(50) | Tipo | CHECK IN tipos |
| price_per_night | DECIMAL(10,2) | Preço | > 0 |
| capacity_adults | INT | Capacidade adultos | > 0 |
| status | VARCHAR(20) | Status | CHECK IN status |
| amenities | JSONB | Comodidades | |

### 4.4 reservations (Reservas) - TABELA CENTRAL
| Campo | Tipo | Descrição | FK |
|-------|------|-----------|-----|
| id | UUID | Chave primária | PK |
| guest_id | UUID | Hóspede | → guests.id |
| room_id | UUID | Quarto | → rooms.id |
| user_id | UUID | Usuário | → users.id |
| check_in | DATE | Check-in | NOT NULL |
| check_out | DATE | Check-out | NOT NULL, > check_in |
| total_price | DECIMAL | Preço total | GENERATED |
| status | VARCHAR | Status | CHECK |

### 4.5 payments (Pagamentos)
| Campo | Tipo | Descrição | FK |
|-------|------|-----------|-----|
| id | UUID | Chave primária | PK |
| reservation_id | UUID | Reserva | → reservations.id |
| amount | DECIMAL | Valor | > 0 |
| method | VARCHAR | Método | CHECK |
| status | VARCHAR | Status | CHECK |
| transaction_id | VARCHAR | ID transação | |
| gateway_response | JSONB | Resposta API | |

### 4.6 receipts (Recibos)
| Campo | Tipo | Descrição | FK |
|-------|------|-----------|-----|
| id | UUID | Chave primária | PK |
| payment_id | UUID | Pagamento | → payments.id |
| receipt_number | VARCHAR | Número | UNIQUE |
| pdf_url | VARCHAR | URL do PDF | |
| sent_at | TIMESTAMP | Data envio | |

---

## 5. ÍNDICES E CONSULTAS OTIMIZADAS

### 5.1 Consulta: Buscar disponibilidade de quartos
```sql
-- Consulta frequente: Quartos disponíveis em um período
EXPLAIN ANALYZE
SELECT r.* 
FROM rooms r
WHERE r.status = 'available'
AND r.id NOT IN (
    SELECT room_id 
    FROM reservations 
    WHERE status IN ('confirmed', 'checked_in')
    AND check_in <= '2024-12-20'
    AND check_out >= '2024-12-15'
);

-- Índices usados:
-- - idx_rooms_status (filtra disponíveis)
-- - idx_reservations_dates (busca por data)
-- - idx_reservations_status (filtra status)