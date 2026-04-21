#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔄 Verificando necessidade de renovação de certificados...${NC}"

CERT_PATH="ssl/certificate.crt"
KEY_PATH="ssl/private.key"

# Verificar se certificados existem
if [ ! -f "$CERT_PATH" ] || [ ! -f "$KEY_PATH" ]; then
    echo -e "${RED}❌ Certificados não encontrados. Execute 'npm run ssl:generate' primeiro.${NC}"
    exit 1
fi

# Obter data de expiração do certificado
EXPIRY_DATE=$(openssl x509 -enddate -noout -in ${CERT_PATH} | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "${EXPIRY_DATE}" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))

echo -e "${YELLOW}📅 Dias restantes: ${DAYS_LEFT} dias${NC}"

# Se expirar em menos de 30 dias, renovar
if [ ${DAYS_LEFT} -lt 30 ]; then
    echo -e "${YELLOW}⚠️ Certificado expirando em ${DAYS_LEFT} dias. Renovando...${NC}"
    
    # Backup do certificado antigo
    BACKUP_DIR="ssl/backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p ${BACKUP_DIR}
    cp ${CERT_PATH} ${BACKUP_DIR}/
    cp ${KEY_PATH} ${BACKUP_DIR}/
    
    echo -e "${GREEN}📦 Backup salvo em: ${BACKUP_DIR}${NC}"
    
    # Regenerar certificado
    DOMAIN=$(openssl x509 -in ${CERT_PATH} -text -noout | grep "Subject: CN=" | sed 's/.*CN=//')
    ./backend/scripts/generate-cert.sh ${DOMAIN} 365
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Certificado renovado com sucesso!${NC}"
        
        # Reiniciar servidor (se usando PM2)
        if command -v pm2 &> /dev/null; then
            pm2 reload hotel-paradise
            echo -e "${GREEN}🔄 Servidor reiniciado${NC}"
        fi
    else
        echo -e "${RED}❌ Falha na renovação do certificado${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Certificado ainda válido por ${DAYS_LEFT} dias${NC}"
fi