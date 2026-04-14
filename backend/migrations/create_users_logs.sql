-- backend/migrations/create_users_logs.sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'receptionist',
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    must_change_password BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS logs_sistema (
    id SERIAL PRIMARY KEY,
    usuario_id UUID,
    usuario_nome VARCHAR(255),
    usuario_role VARCHAR(50),
    acao VARCHAR(100) NOT NULL,
    recurso VARCHAR(100),
    recurso_id VARCHAR(255),
    dados_antigos JSONB,
    dados_novos JSONB,
    ip VARCHAR(45),
    user_agent TEXT,
    sucesso BOOLEAN DEFAULT true,
    mensagem_erro TEXT,
    data_hora TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_logs_usuario ON logs_sistema(usuario_id);
CREATE INDEX idx_logs_acao ON logs_sistema(acao);
CREATE INDEX idx_logs_data ON logs_sistema(data_hora DESC);