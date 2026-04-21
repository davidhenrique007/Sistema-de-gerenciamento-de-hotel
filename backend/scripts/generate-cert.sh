#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔐 Gerando certificado SSL para desenvolvimento${NC}"

# Criar pasta ssl se não existir
mkdir -p ssl

# Configurações do certificado
DOMAIN=${1:-localhost}
DAYS_VALID=${2:-365}
COUNTRY="MZ"
STATE="Maputo"
CITY="Maputo"
ORG="Hotel Paradise"
UNIT="IT Department"
CN="${DOMAIN}"

# Caminhos dos arquivos
KEY_PATH="ssl/private.key"
CERT_PATH="ssl/certificate.crt"
CSR_PATH="ssl/request.csr"

echo -e "${YELLOW}📋 Configurações:${NC}"
echo "   Domínio: ${DOMAIN}"
echo "   Validade: ${DAYS_VALID} dias"
echo "   País: ${COUNTRY}"
echo "   Estado: ${STATE}"
echo "   Cidade: ${CITY}"

# Gerar chave privada
echo -e "${GREEN}🔑 Gerando chave privada...${NC}"
openssl genrsa -out ${KEY_PATH} 2048

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao gerar chave privada${NC}"
    exit 1
fi

# Gerar CSR (Certificate Signing Request)
echo -e "${GREEN}📝 Gerando CSR...${NC}"
openssl req -new -key ${KEY_PATH} -out ${CSR_PATH} -subj "/C=${COUNTRY}/ST=${STATE}/L=${CITY}/O=${ORG}/OU=${UNIT}/CN=${CN}"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao gerar CSR${NC}"
    exit 1
fi

# Gerar certificado auto-assinado
echo -e "${GREEN}📜 Gerando certificado auto-assinado...${NC}"
openssl x509 -req -days ${DAYS_VALID} -in ${CSR_PATH} -signkey ${KEY_PATH} -out ${CERT_PATH}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao gerar certificado${NC}"
    exit 1
fi

# Ajustar permissões
chmod 600 ${KEY_PATH}
chmod 644 ${CERT_PATH}

# Limpar CSR
rm ${CSR_PATH}

echo -e "${GREEN}✅ Certificados gerados com sucesso!${NC}"
echo -e "${YELLOW}📂 Localização dos arquivos:${NC}"
echo "   Chave privada: ${KEY_PATH}"
echo "   Certificado: ${CERT_PATH}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   Este certificado é auto-assinado e NÃO é válido para produção real."
echo "   Para produção, use Let's Encrypt ou certificados de autoridades confiáveis."
echo ""
echo -e "${GREEN}🚀 Para iniciar o servidor com HTTPS:${NC}"
echo "   npm run prod"