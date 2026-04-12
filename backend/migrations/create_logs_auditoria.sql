-- backend/migrations/create_logs_auditoria.sql
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id VARCHAR(255),
    usuario_nome VARCHAR(255),
    usuario_role VARCHAR(100),
    acao VARCHAR(100) NOT NULL,
    reserva_id INTEGER,
    dados_antigos JSONB,
    dados_novos JSONB,
    motivo TEXT,
    ip VARCHAR(45),
    data_hora TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_logs_reserva ON logs_auditoria(reserva_id);
CREATE INDEX idx_logs_usuario ON logs_auditoria(usuario_id);
CREATE INDEX idx_logs_data ON logs_auditoria(data_hora DESC);
CREATE INDEX idx_logs_acao ON logs_auditoria(acao);