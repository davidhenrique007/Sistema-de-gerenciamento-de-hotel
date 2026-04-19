-- backend/migrations/create_exportacoes_tables.sql
CREATE TABLE IF NOT EXISTS historico_exportacoes (
    id UUID PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL,
    formato VARCHAR(10) NOT NULL,
    destinatario VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pendente',
    erro TEXT,
    data_exportacao TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS relatorios_agendados (
    id UUID PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL,
    frequencia VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    parametros JSONB,
    criado_em TIMESTAMP DEFAULT NOW(),
    ultima_execucao TIMESTAMP
);

CREATE INDEX idx_historico_data ON historico_exportacoes(data_exportacao DESC);
CREATE INDEX idx_historico_tipo ON historico_exportacoes(tipo);