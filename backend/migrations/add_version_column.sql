-- backend/migrations/add_version_column.sql
-- Adicionar campo version para lock otimista
ALTER TABLE quartos ADD COLUMN IF NOT EXISTS version INT DEFAULT 0;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS version INT DEFAULT 0;

-- Adicionar índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_quartos_status ON quartos(status);
CREATE INDEX IF NOT EXISTS idx_quartos_id_version ON quartos(id, version);
CREATE INDEX IF NOT EXISTS idx_reservas_quarto_datas ON reservas(quarto_id, check_in, check_out);

-- Criar função para atualizar versão automaticamente
CREATE OR REPLACE FUNCTION update_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar versão automaticamente
DROP TRIGGER IF EXISTS update_quarto_version ON quartos;
CREATE TRIGGER update_quarto_version
    BEFORE UPDATE ON quartos
    FOR EACH ROW
    EXECUTE FUNCTION update_version();