@'
# Guia de Auditoria - Hotel Paradise

## Visão Geral

O sistema de auditoria do Hotel Paradise registra todas as ações críticas do sistema, garantindo rastreabilidade completa e conformidade com normas como LGPD, SOC2 e ISO 27001.

## Eventos Registrados

### Autenticação
- LOGIN_SUCCESS - Login bem-sucedido
- LOGIN_FAILURE - Tentativa de login falha
- LOGOUT - Logout do sistema

### Reservas
- CRIAR_RESERVA - Criação de nova reserva
- ATUALIZAR_RESERVA - Alteração de reserva
- CANCELAR_RESERVA - Cancelamento de reserva

### Utilizadores
- CRIAR_UTILIZADOR - Criação de novo utilizador
- ATUALIZAR_UTILIZADOR - Alteração de dados
- ELIMINAR_UTILIZADOR - Remoção de utilizador

### Pagamentos
- PAYMENT_CREATED - Criação de pagamento
- PAYMENT_CONFIRMED - Confirmação de pagamento

## Consultar Logs

### API Endpoints

```bash
# Listar logs (admin apenas)
GET /api/admin/audit/logs?limit=50&offset=0

# Filtrar por utilizador
GET /api/admin/audit/logs?userId=xxx

# Filtrar por ação
GET /api/admin/audit/logs?acao=CRIAR_RESERVA

# Filtrar por período
GET /api/admin/audit/logs?startDate=2026-01-01&endDate=2026-12-31

# Estatísticas
GET /api/admin/audit/logs/stats

# Exportar CSV
GET /api/admin/audit/logs/export/csv

Estrutura do Log

{
  "id": 1,
  "userId": "uuid",
  "userName": "Admin",
  "userRole": "admin",
  "acao": "CRIAR_RESERVA",
  "entidade": "Reserva",
  "entidadeId": "123",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "status": "SUCCESS",
  "detalhes": {},
  "nivel": "INFO",
  "createdAt": "2026-04-21T10:00:00Z"
}

Política de Retenção

    Tempo de retenção: 90 dias (configurável)

    Limpeza automática: Executada diariamente

    Backup: Logs exportáveis em CSV

Manutenção
Limpeza manual

node backend/scripts/cleanup-logs.js
# Diariamente às 2h
0 2 * * * cd /path/to/project && node backend/scripts/cleanup-logs.js

Compliance
LGPD

    Logs não contêm dados sensíveis

    Retenção limitada a 90 dias

    Possibilidade de exportação
    SOC2 / ISO 27001

    Rastreabilidade completa

    Logs imutáveis

    Acesso restrito a administradores
    Troubleshooting
Logs não estão sendo registrados

    Verificar se a tabela audit_logs existe

    Verificar permissões do banco

    Verificar logs de erro do servidor
    Limpeza automática não funciona

    Verificar se o cron está configurado

    Executar script manualmente para teste

    Verificar permissões de execução
    '@ | Out-File -FilePath "docs/AUDIT_GUIDE.md" -Encoding UTF8


## 1️⃣1️⃣ Modificar `server.js` para adicionar middleware de auditoria

```powershell
# Adicionar import do middleware
$serverContent = Get-Content "server.js" -Raw

# Adicionar import após os outros middlewares
$auditImport = "const auditLogger = require('./middlewares/auditLogger');"
$serverContent = $serverContent -replace "const { performanceLogger } = require\('./middlewares/performanceLogger'\);", "const { performanceLogger } = require('./middlewares/performanceLogger');`n$auditImport"

# Adicionar uso do middleware após os middlewares de segurança
$serverContent = $serverContent -replace "app.use\(validateDataTypes\);", "app.use(validateDataTypes);`n`n// Middleware de auditoria`napp.use(auditLogger);"

Set-Content -Path "server.js" -Value $serverContent -NoNewline
1️⃣2️⃣ Modificar middlewares/auth.js para adicionar logs de login/logout
$authPath = "backend/middlewares/auth.js"
$authContent = Get-Content $authPath -Raw

# Adicionar import do auditService no início
$auditImportAuth = "const auditService = require('../services/auditService');"
$authContent = $authContent -replace "const db = require\('../config/database'\);", "const db = require('../config/database');`n$auditImportAuth"

# Adicionar log de login bem-sucedido após o token gerado
$loginSuccessLog = @'
    
    // Log de auditoria - login bem-sucedido
    await auditService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      acao: 'LOGIN_SUCCESS',
      entidade: 'Autenticacao',
      ip: req.ip,
      userAgent: req.get('user-agent'),
      detalhes: { email: user.email }
    });
'@

$authContent = $authContent -replace "console\.log\('✅ Login bem sucedido, token gerado'\);", "console.log('✅ Login bem sucedido, token gerado');$loginSuccessLog"

# Adicionar log de login falho
$loginFailLog = @'
    
    // Log de auditoria - login falho
    await auditService.log({
      acao: 'LOGIN_FAILURE',
      entidade: 'Autenticacao',
      ip: req.ip,
      userAgent: req.get('user-agent'),
      status: 'ERROR',
      detalhes: { email, motivo: 'Credenciais inválidas' }
    });
'@

$authContent = $authContent -replace "return res\.status\(401\)\.json\(\{ success: false, message: 'Email ou senha inválidos' \}\);", "return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });$loginFailLog"

Set-Content -Path $authPath -Value $authContent -NoNewline
1️⃣3️⃣ Executar migração no banco
# Executar o SQL de criação da tabela
docker exec -i hotel_paradise_db psql -U postgres -d hotel_paradise < database/migrations/001_create_audit_logs.sql

# Verificar se a tabela foi criada
docker exec hotel_paradise_db psql -U postgres -d hotel_paradise -c "\dt audit_logs"
1️⃣4️⃣ Verificar todos os arquivos
Write-Host "=== VERIFICANDO ARQUIVOS DE AUDITORIA ===" -ForegroundColor Cyan

$auditFiles = @(
    "backend/config/audit.config.js",
    "backend/services/auditService.js",
    "backend/middlewares/auditLogger.js",
    "backend/models/AuditLog.js",
    "backend/routes/admin/auditRoutes.js",
    "backend/scripts/cleanup-logs.js",
    "database/migrations/001_create_audit_logs.sql",
    "tests/unit/audit.test.js",
    "docs/AUDIT_GUIDE.md"
)

foreach ($file in $auditFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - FALTANDO" -ForegroundColor Red
    }
}