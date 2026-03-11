#!/bin/bash
# =====================================================
# SCRIPT: backup.sh
# DESCRIÇÃO: Script de backup automático do banco PostgreSQL
# USO: ./backup.sh
# AGENDAR: crontab -e (0 2 * * * /caminho/backup.sh)
# =====================================================

# Configurações
DB_USER="hotel_user"
DB_NAME="hotel_paradise"
BACKUP_DIR="/c/Users/Dell/Desktop/Code 01/Versão Profissional 01/Sistema P1/Hotel-Paradise/backups"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/backup_log.txt"

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Nome do arquivo
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Executar backup
echo "[$(date)] Iniciando backup..." >> "$LOG_FILE"
pg_dump -U $DB_USER -d $DB_NAME > "$BACKUP_FILE"

# Verificar se backup foi bem sucedido
if [ $? -eq 0 ]; then
    echo "[$(date)] Backup concluído: $BACKUP_FILE" >> "$LOG_FILE"
    
    # Comprimir
    gzip "$BACKUP_FILE"
    echo "[$(date)] Arquivo comprimido: $BACKUP_FILE.gz" >> "$LOG_FILE"
    
    # Manter apenas últimos 7 backups
    find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete
    echo "[$(date)] Backups antigos removidos" >> "$LOG_FILE"
else
    echo "[$(date)] ERRO: Falha no backup!" >> "$LOG_FILE"
fi

echo "[$(date)] Processo finalizado" >> "$LOG_FILE"
echo "----------------------------------------" >> "$LOG_FILE"