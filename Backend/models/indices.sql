-- =====================================================
-- HOTEL PARADISE - ÍNDICES PARA PERFORMANCE
-- Versão: 2.0.0
-- Data: 2024
-- Descrição: Índices estratégicos para consultas frequentes
-- =====================================================

-- =====================================================
-- ÍNDICES PARA TABELA users
-- =====================================================
CREATE INDEX idx_users_email ON users(email);                    -- Login rápido
CREATE INDEX idx_users_role ON users(role);                      -- Filtro por perfil
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true; -- Usuários ativos

-- =====================================================
-- ÍNDICES PARA TABELA guests
-- =====================================================
CREATE INDEX idx_guests_phone ON guests(phone);                   -- Busca por telefone (único)
CREATE INDEX idx_guests_email ON guests(email) WHERE email IS NOT NULL; -- Busca por email
CREATE INDEX idx_guests_document ON guests(document) WHERE document IS NOT NULL; -- Busca por CPF/CNPJ
CREATE INDEX idx_guests_name_trgm ON guests USING gin(name gin_trgm_ops); -- Busca textual por nome
CREATE INDEX idx_guests_city ON guests(address_city) WHERE address_city IS NOT NULL; -- Filtro por cidade

-- =====================================================
-- ÍNDICES PARA TABELA rooms
-- =====================================================
CREATE INDEX idx_rooms_number ON rooms(room_number);              -- Busca por número
CREATE INDEX idx_rooms_type ON rooms(type);                       -- Filtro por tipo
CREATE INDEX idx_rooms_status ON rooms(status);                   -- Filtro por status
CREATE INDEX idx_rooms_price ON rooms(price_per_night);           -- Ordenação por preço
CREATE INDEX idx_rooms_capacity ON rooms(total_capacity);         -- Filtro por capacidade
CREATE INDEX idx_rooms_available ON rooms(id) WHERE status = 'available'; -- Quartos disponíveis
CREATE INDEX idx_rooms_floor_status ON rooms(floor, status);      -- Relatório por andar

-- Índice composto para consultas comuns
CREATE INDEX idx_rooms_type_status ON rooms(type, status);        -- Quartos disponíveis por tipo
CREATE INDEX idx_rooms_price_status ON rooms(price_per_night, status); -- Disponíveis por faixa de preço

-- =====================================================
-- ÍNDICES PARA TABELA reservations (MUITO IMPORTANTE)
-- =====================================================

-- Índices para buscas por data (consultas mais comuns)
CREATE INDEX idx_reservations_dates ON reservations(check_in, check_out);
CREATE INDEX idx_reservations_checkin ON reservations(check_in) WHERE status NOT IN ('cancelled', 'completed');
CREATE INDEX idx_reservations_checkout ON reservations(check_out) WHERE status = 'checked_in';

-- Índices para relacionamentos
CREATE INDEX idx_reservations_guest ON reservations(guest_id);
CREATE INDEX idx_reservations_room ON reservations(room_id);
CREATE INDEX idx_reservations_user ON reservations(user_id);

-- Índices para status
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_payment_status ON reservations(payment_status);
CREATE INDEX idx_reservations_code ON reservations(reservation_code); -- Busca por código amigável

-- Índices compostos para relatórios
CREATE INDEX idx_reservations_status_dates ON reservations(status, check_in, check_out);
CREATE INDEX idx_reservations_payment_status_dates ON reservations(payment_status, created_at);
CREATE INDEX idx_reservations_source_created ON reservations(source, created_at);

-- Índice para ocupação atual
CREATE INDEX idx_reservations_current ON reservations(room_id, status) 
    WHERE status IN ('confirmed', 'checked_in');

-- =====================================================
-- ÍNDICES PARA TABELA payments
-- =====================================================
CREATE INDEX idx_payments_reservation ON payments(reservation_id);
CREATE INDEX idx_payments_code ON payments(payment_code);         -- Busca por código
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_date ON payments(payment_date) WHERE payment_date IS NOT NULL;
CREATE INDEX idx_payments_transaction ON payments(transaction_id) WHERE transaction_id IS NOT NULL;

-- Índices compostos
CREATE INDEX idx_payments_status_method ON payments(status, method);
CREATE INDEX idx_payments_reservation_status ON payments(reservation_id, status);

-- =====================================================
-- ÍNDICES PARA TABELA receipts
-- =====================================================
CREATE INDEX idx_receipts_payment ON receipts(payment_id);
CREATE INDEX idx_receipts_number ON receipts(receipt_number);
CREATE INDEX idx_receipts_type ON receipts(receipt_type);
CREATE INDEX idx_receipts_sent ON receipts(sent_at) WHERE sent_at IS NOT NULL;

-- =====================================================
-- ÍNDICES PARA TABELA audit_logs
-- =====================================================
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- =====================================================
-- EXTENSÕES NECESSÁRIAS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- Para busca textual (LIKE, ILIKE)

-- =====================================================
-- RELATÓRIO DE ÍNDICES CRIADOS
-- =====================================================
/*
TOTAL DE ÍNDICES: 35+

Tabela users: 3 índices
Tabela guests: 5 índices
Tabela rooms: 8 índices
Tabela reservations: 9 índices
Tabela payments: 6 índices
Tabela receipts: 4 índices
*/