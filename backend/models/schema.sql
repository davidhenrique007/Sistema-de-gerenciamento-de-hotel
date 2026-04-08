-- =====================================================
-- HOTEL PARADISE - SCHEMA DO BANCO DE DADOS
<<<<<<< HEAD
-- Versão: 2.0.0 (Modelagem Detalhada)
-- Data: 2024
-- Autor: Tech Lead
-- Descrição: Criação de todas as tabelas com constraints,
--            relacionamentos e regras de integridade
=======
-- Versão: 1.0.0
-- Data: 2024
>>>>>>> 6695262e9a338a08013d5f32dc65226f0a27ebc6
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
<<<<<<< HEAD
-- TABELA: users (usuários do sistema)
=======
-- TABELA: users (usuários do sistema - admin/recepcionistas)
>>>>>>> 6695262e9a338a08013d5f32dc65226f0a27ebc6
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'receptionist', 'financial')),
<<<<<<< HEAD
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT name_length CHECK (LENGTH(name) >= 3)
);

COMMENT ON TABLE users IS 'Usuários do sistema (admin, recepcionistas, financeiro)';
COMMENT ON COLUMN users.role IS 'Perfil de acesso: admin (total), receptionist (reservas), financial (relatórios)';
COMMENT ON COLUMN users.is_active IS 'Usuário ativo ou desativado';

=======
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

>>>>>>> 6695262e9a338a08013d5f32dc65226f0a27ebc6
-- =====================================================
-- TABELA: guests (hóspedes/clientes)
-- =====================================================
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20) UNIQUE NOT NULL,
<<<<<<< HEAD
    document VARCHAR(20) UNIQUE,
    birth_date DATE,
    address_street VARCHAR(255),
    address_number VARCHAR(10),
    address_complement VARCHAR(50),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zipcode VARCHAR(10),
    address_country VARCHAR(50) DEFAULT 'Brasil',
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT phone_format CHECK (phone ~* '^[0-9+\-\s()]{10,20}$'),
    CONSTRAINT email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT document_format CHECK (document IS NULL OR document ~* '^[0-9]{11}$|^[0-9]{14}$')
);

COMMENT ON TABLE guests IS 'Hóspedes/clientes do hotel';
COMMENT ON COLUMN guests.phone IS 'Telefone com DDD (formato livre, mas validado)';
COMMENT ON COLUMN guests.document IS 'CPF (11 dígitos) ou CNPJ (14 dígitos)';

=======
    document VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

>>>>>>> 6695262e9a338a08013d5f32dc65226f0a27ebc6
-- =====================================================
-- TABELA: rooms (quartos)
-- =====================================================
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number VARCHAR(10) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('standard', 'deluxe', 'family', 'suite', 'presidential')),
    price_per_night DECIMAL(10,2) NOT NULL,
<<<<<<< HEAD
    capacity_adults INT NOT NULL DEFAULT 2,
    capacity_children INT NOT NULL DEFAULT 0,
    total_capacity INT GENERATED ALWAYS AS (capacity_adults + capacity_children) STORED,
    size_sqm DECIMAL(5,2),
    bed_type VARCHAR(50) CHECK (bed_type IN ('single', 'double', 'queen', 'king', 'twin')),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved', 'cleaning')),
    floor INT,
    description TEXT,
    amenities JSONB,
    images JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT positive_price CHECK (price_per_night > 0),
    CONSTRAINT valid_capacity CHECK (capacity_adults > 0 AND capacity_children >= 0),
    CONSTRAINT valid_floor CHECK (floor >= 0)
);

COMMENT ON TABLE rooms IS 'Quartos do hotel';
COMMENT ON COLUMN rooms.total_capacity IS 'Capacidade total calculada automaticamente';
COMMENT ON COLUMN rooms.amenities IS 'JSON com amenities: wifi, tv, ar, frigobar, etc';
COMMENT ON COLUMN rooms.images IS 'JSON com URLs das imagens do quarto';

=======
    capacity INT NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
    floor INT,
    description TEXT,
    amenities JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

>>>>>>> 6695262e9a338a08013d5f32dc65226f0a27ebc6
-- =====================================================
-- TABELA: reservations (reservas)
-- =====================================================
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
<<<<<<< HEAD
    reservation_code VARCHAR(20) UNIQUE NOT NULL,
=======
>>>>>>> 6695262e9a338a08013d5f32dc65226f0a27ebc6
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
<<<<<<< HEAD
    check_in_real TIMESTAMP,
    check_out_real TIMESTAMP,
    adults_count INT NOT NULL DEFAULT 2,
    children_count INT NOT NULL DEFAULT 0,
    base_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (base_price - discount_amount + tax_amount) STORED,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    cancellation_reason TEXT,
    cancellation_date TIMESTAMP,
    special_requests TEXT,
    source VARCHAR(20) DEFAULT 'website' CHECK (source IN ('website', 'reception', 'phone', 'email', 'booking_platform')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (check_out > check_in),
    CONSTRAINT valid_guests CHECK (adults_count >= 1 AND children_count >= 0),
    CONSTRAINT positive_prices CHECK (base_price > 0 AND discount_amount >= 0 AND tax_amount >= 0),
    CONSTRAINT future_checkin CHECK (check_in >= CURRENT_DATE OR status = 'cancelled'),
    
    -- Foreign keys com nomes explícitos
    CONSTRAINT fk_reservations_guest FOREIGN KEY (guest_id) REFERENCES guests(id),
    CONSTRAINT fk_reservations_room FOREIGN KEY (room_id) REFERENCES rooms(id),
    CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES users(id)
);

COMMENT ON TABLE reservations IS 'Reservas realizadas (core do sistema)';
COMMENT ON COLUMN reservations.reservation_code IS 'Código amigável para o cliente (ex: RES-2024-0001)';
COMMENT ON COLUMN reservations.total_price IS 'Preço final calculado automaticamente';

=======
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (check_out > check_in)
);

>>>>>>> 6695262e9a338a08013d5f32dc65226f0a27ebc6
-- =====================================================
-- TABELA: payments (pagamentos)
-- =====================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
<<<<<<< HEAD
    payment_code VARCHAR(20) UNIQUE NOT NULL,
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(30) NOT NULL CHECK (method IN ('mpesa', 'credit_card', 'debit_card', 'cash', 'bank_transfer', 'pix')),
    installments INT DEFAULT 1 CHECK (installments >= 1),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'failed', 'refunded', 'chargeback')),
    transaction_id VARCHAR(100),
    gateway_response JSONB,
    payment_date TIMESTAMP,
    refund_date TIMESTAMP,
    refund_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT positive_amount CHECK (amount > 0),
    CONSTRAINT fk_payments_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

COMMENT ON TABLE payments IS 'Pagamentos das reservas';
COMMENT ON COLUMN payments.payment_code IS 'Código único do pagamento (PAY-2024-0001)';
COMMENT ON COLUMN payments.gateway_response IS 'Resposta completa do gateway para auditoria';

=======
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(30) NOT NULL CHECK (method IN ('mpesa', 'credit_card', 'debit_card', 'cash', 'bank_transfer')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'failed', 'refunded')),
    transaction_id VARCHAR(100),
    payment_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

>>>>>>> 6695262e9a338a08013d5f32dc65226f0a27ebc6
-- =====================================================
-- TABELA: receipts (recibos)
-- =====================================================
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
<<<<<<< HEAD
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    receipt_type VARCHAR(20) DEFAULT 'payment' CHECK (receipt_type IN ('payment', 'cancellation', 'refund')),
    pdf_url VARCHAR(255),
    xml_content TEXT,
    sent_to_email BOOLEAN DEFAULT false,
    sent_to_whatsapp BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    downloaded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_receipts_payment FOREIGN KEY (payment_id) REFERENCES payments(id)
);

COMMENT ON TABLE receipts IS 'Recibos gerados';
COMMENT ON COLUMN receipts.receipt_number IS 'Número único do recibo (REC-2024-0001)';

-- =====================================================
-- TABELA: audit_logs (logs de auditoria)
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE audit_logs IS 'Logs de auditoria para todas as alterações importantes';

-- =====================================================
-- FUNÇÕES E TRIGGERS
=======
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    pdf_url VARCHAR(255),
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para reservas
CREATE INDEX idx_reservations_dates ON reservations(check_in, check_out);
CREATE INDEX idx_reservations_guest ON reservations(guest_id);
CREATE INDEX idx_reservations_room ON reservations(room_id);
CREATE INDEX idx_reservations_status ON reservations(status);

-- Índices para pagamentos
CREATE INDEX idx_payments_reservation ON payments(reservation_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(method);

-- Índices para quartos
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(type);

-- Índices para hóspedes
CREATE INDEX idx_guests_phone ON guests(phone);
CREATE INDEX idx_guests_email ON guests(email);

-- Índices para usuários
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
>>>>>>> 6695262e9a338a08013d5f32dc65226f0a27ebc6
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

<<<<<<< HEAD
-- Triggers para updated_at
=======
-- Triggers para cada tabela
>>>>>>> 6695262e9a338a08013d5f32dc65226f0a27ebc6
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

<<<<<<< HEAD
-- Função para gerar código de reserva automático
CREATE OR REPLACE FUNCTION generate_reservation_code()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix TEXT;
    next_number INT;
BEGIN
    year_prefix := 'RES-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-';
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(reservation_code FROM LENGTH(year_prefix)+1) AS INTEGER)), 0) + 1
    INTO next_number
    FROM reservations
    WHERE reservation_code LIKE year_prefix || '%';
    
    NEW.reservation_code := year_prefix || LPAD(next_number::TEXT, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_generate_reservation_code
    BEFORE INSERT ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION generate_reservation_code();

-- Função para gerar código de pagamento automático
CREATE OR REPLACE FUNCTION generate_payment_code()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix TEXT;
    next_number INT;
BEGIN
    year_prefix := 'PAY-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-';
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(payment_code FROM LENGTH(year_prefix)+1) AS INTEGER)), 0) + 1
    INTO next_number
    FROM payments
    WHERE payment_code LIKE year_prefix || '%';
    
    NEW.payment_code := year_prefix || LPAD(next_number::TEXT, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_generate_payment_code
    BEFORE INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION generate_payment_code();

-- Função para gerar número de recibo automático
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix TEXT;
    next_number INT;
BEGIN
    year_prefix := 'REC-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-';
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM LENGTH(year_prefix)+1) AS INTEGER)), 0) + 1
    INTO next_number
    FROM receipts
    WHERE receipt_number LIKE year_prefix || '%';
    
    NEW.receipt_number := year_prefix || LPAD(next_number::TEXT, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_generate_receipt_number
    BEFORE INSERT ON receipts
    FOR EACH ROW
    EXECUTE FUNCTION generate_receipt_number();

-- Função para auditoria
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
        VALUES (current_setting('app.current_user_id')::UUID, 'INSERT', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
        VALUES (current_setting('app.current_user_id')::UUID, 'UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data)
        VALUES (current_setting('app.current_user_id')::UUID, 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Aplicar trigger de auditoria nas tabelas principais
CREATE TRIGGER audit_reservations AFTER INSERT OR UPDATE OR DELETE ON reservations
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
=======
-- =====================================================
-- COMENTÁRIOS DAS TABELAS (DOCUMENTAÇÃO)
-- =====================================================
COMMENT ON TABLE users IS 'Usuários do sistema (admin, recepcionistas, financeiro)';
COMMENT ON TABLE guests IS 'Hóspedes/clientes do hotel';
COMMENT ON TABLE rooms IS 'Quartos do hotel';
COMMENT ON TABLE reservations IS 'Reservas realizadas';
COMMENT ON TABLE payments IS 'Pagamentos das reservas';
COMMENT ON TABLE receipts IS 'Recibos gerados';
>>>>>>> 6695262e9a338a08013d5f32dc65226f0a27ebc6
