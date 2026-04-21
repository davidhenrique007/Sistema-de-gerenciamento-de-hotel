# Configuração HTTPS - Hotel Paradise

## Visão Geral

O Hotel Paradise utiliza HTTPS obrigatório em produção para garantir:
- Criptografia de dados em trânsito
- Autenticidade do servidor
- Integridade das informações
- Conformidade com LGPD e boas práticas de segurança

## Estrutura dos Certificados

sl/
├── private.key # Chave privada (NUNCA compartilhar)
├── certificate.crt # Certificado público
└── backup/ # Backups automáticos

## Ambientes

### Desenvolvimento (localhost)

**Certificado auto-assinado** (apenas para testes):

```bash
# Gerar certificado
npm run ssl:generate

# Iniciar servidor
npm run dev
Produção (domínio real)

Opção 1: Let's Encrypt (recomendado)

# Instalar certbot
sudo apt-get install certbot

# Obter certificado
sudo certbot certonly --standalone -d hotelparadise.com -d www.hotelparadise.com

# Os certificados ficam em:
# /etc/letsencrypt/live/hotelparadise.com/
Opção 2: Certificado comercial

Compre certificado de autoridade confiável (DigiCert, GlobalSign, etc.)
Docker Production
# Gerar certificados primeiro
npm run ssl:generate

# Subir ambiente completo
docker-compose -f docker-compose.prod.yml up -d

# Verificar logs
docker-compose -f docker-compose.prod.yml logs -f

Scripts Disponíveis
Comando	Descrição
npm run ssl:generate	Gerar certificado self-signed
npm run ssl:renew	Verificar e renovar certificado
npm run prod	Iniciar servidor com HTTPS
npm run docker:prod	Subir ambiente Docker completo
Verificação de Segurança
# Testar configuração SSL
curl -I https://hotelparadise.com

# Verificar certificado
openssl s_client -connect hotelparadise.com:443 -servername hotelparadise.com

# Testar HSTS
curl -I https://hotelparadise.com | grep -i "strict-transport-security"
Troubleshooting
Erro: "Certificados SSL não encontrados"
npm run ssl:generate
Erro: "Certificado expirado"
npm run ssl:renew

Porta 443 já em uso
sudo lsof -i :443
sudo kill -9 <PID>

Renovação Automática (Let's Encrypt)
# Adicionar ao crontab
0 0 * * * /usr/bin/certbot renew --quiet && docker-compose -f docker-compose.prod.yml restart nginx

Referências

    Let's Encrypt

    SSL Labs Test

    Mozilla SSL Configuration Generator


## 1️⃣1️⃣ Atualizar package.json

Adicione ao `package.json`:

```json
{
  "scripts": {
    "ssl:generate": "chmod +x backend/scripts/generate-cert.sh && ./backend/scripts/generate-cert.sh",
    "ssl:renew": "chmod +x backend/scripts/renew-cert.sh && ./backend/scripts/renew-cert.sh",
    "prod": "NODE_ENV=production node server.js",
    "docker:prod": "docker-compose -f docker-compose.prod.yml up -d",
    "docker:prod:down": "docker-compose -f docker-compose.prod.yml down"
  }
}

1️⃣2️⃣ Dar permissão aos scripts
# No PowerShell (WSL ou Git Bash)
wsl chmod +x backend/scripts/generate-cert.sh
wsl chmod +x backend/scripts/renew-cert.sh