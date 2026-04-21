-- =====================================================
-- CRIAÇÃO DA TABELA DE AUDITORIA - HOTEL PARADISE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    user_name VARCHAR(100),
    user_role VARCHAR(50),
    acao VARCHAR(100) NOT NULL,
    entidade VARCHAR(100),
    entidade_id VARCHAR(100),
    ip VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'SUCCESS',
    detalhes JSONB,
    nivel VARCHAR(20) DEFAULT 'INFO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_acao ON audit_logs(acao);
CREATE INDEX IF NOT EXISTS idx_audit_entidade ON audit_logs(entidade);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_status ON audit_logs(status);

-- Índice composto
CREATE INDEX IF NOT EXISTS idx_audit_user_date ON audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_acao_date ON audit_logs(acao, created_at);
