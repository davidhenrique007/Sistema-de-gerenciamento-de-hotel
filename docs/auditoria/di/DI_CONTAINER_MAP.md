## PATH ALIASES CONFIGURADOS

| Alias | Path | Status |
|-------|------|--------|
| `@/*` | `./src/*` | ✅ |
| `@components/*` | `./src/components/*` | ✅ |
| `@contexts/*` | `./src/contexts/*` | ✅ |
| `@hooks/*` | `./src/features/home/hooks/*` | ⚠️ Limitado |
| `@services/*` | `./src/services/*` | ✅ |
| `@utils/*` | `./src/utils/*` | ⚠️ Pasta não existe? |
| `@styles/*` | `./src/styles/*` | ✅ |
| `@assets/*` | `./src/assets/*` | ✅ |

### Problemas
- `vite.config.js` e `vite.config.ts` duplicados
- `@hooks/*` não cobre todos os hooks do sistema
- `@utils/*` aponta para pasta que pode não existir (verificar)



## 1. Serviços Globais Identificados

### 1.1 Clientes HTTP

| Arquivo | Localização | Tipo | Risco |
|---------|-------------|------|-------|
| `api.js` | `src/services/` | Cliente HTTP Global | 🟢 Baixo |
| `api.js` | `src/features/home/pages/checkout/` | Cliente HTTP Local | 🟡 Médio (duplicado) |

### 1.2 Serviços Admin

| Arquivo | Localização | Tipo | Risco |
|---------|-------------|------|-------|
| `quartoAdminService.js` | `src/services/admin/` | Admin Quartos | 🟢 Baixo |
| `widgetService.js` | `src/services/admin/` | Widgets | 🟢 Baixo |
| `logService.js` | `src/services/admin/` | Logs | 🟢 Baixo |
| `autoUpdateService.js` | `src/services/admin/` | Auto-update | 🟢 Baixo |

### 1.3 Domain Services (Core)

| Arquivo | Localização | Tipo | Risco |
|---------|-------------|------|-------|
| `DefaultAvailabilityService.js` | `src/core/infrastructure/services/availability/` | Disponibilidade | 🟢 Baixo |
| `DefaultPricingService.js` | `src/core/infrastructure/services/pricing/` | Preços | 🟢 Baixo |

### 1.4 Repositórios (Core)

| Arquivo | Local 1 | Local 2 | Risco |
|---------|---------|---------|-------|
| `LocalStorageServiceRepository.js` | `src/core/domain/interfaces/repositories/localStorage/` | `src/core/infrastructure/repositories/localStorage/` | 🟡 Médio (duplicado) |

### 1.5 Use Cases (Core)

| Arquivo | Localização | Tipo | Risco |
|---------|-------------|------|-------|
| `CalculateServicesPriceUseCase.js` | `src/core/application/use-cases/services/` | Use-case | 🟢 Baixo |
| `ListServicesUseCase.js` | `src/core/application/use-cases/services/` | Use-case | 🟢 Baixo |

### 1.6 Serviços de Features

| Arquivo | Localização | Tipo | Risco |
|---------|-------------|------|-------|
| `reservaService.js` | `src/features/home/pages/cliente/services/` | Serviço de reservas | 🟢 Baixo |
| `ServicesContext.jsx` | `src/contexts/` | Contexto React | 🟢 Baixo |

### 1.7 Utilitários

| Arquivo | Localização | Tipo | Risco |
|---------|-------------|------|-------|
| `utils.js` | `src/core/` | Utilitários Core | 🟢 Baixo |
| `dateUtils.js`, `errorUtils.js`, etc. | `src/shared/utils/` | Utilitários Shared | 🟢 Baixo |
| `api.types.ts` | `src/types/` | Tipos API | 🟢 Baixo |

---

### Problemas Encontrados

1. **Duplicado:** `api.js` em 2 lugares (global + checkout) → 🟡 Médio
2. **Duplicado:** `LocalStorageServiceRepository.js` em 2 lugares → 🟡 Médio
3. **Mistura:** Serviços espalhados entre `src/services/`, `src/core/` e `src/features/` → 🟡 Médio





## 2. Contextos React

### 2.1 Contextos Globais (src/contexts/)

| Contexto | Tamanho | Provider | Risco |
|----------|---------|----------|-------|
| AuthContext.jsx | 3.8 KB | ✅ | 🟢 Baixo |
| CartContext.jsx | 3.8 KB | ✅ | 🟢 Baixo |
| ClienteContext.jsx | 6.2 KB | ✅ | 🟢 Baixo |
| CurrencyContext.jsx | 2.6 KB | ✅ | 🟢 Baixo |
| I18nContext.jsx | 3.1 KB | ✅ | 🟢 Baixo |
| NotificationContext.jsx | 3.1 KB | ✅ | 🔴 **Duplicado** |
| ServicesContext.jsx | 2.0 KB | ✅ | 🟢 Baixo |
| TestCartContext.jsx | 0.8 KB | ❌ | 🟡 Médio (lixo) |
| ThemeContext.jsx | 1.4 KB | ✅ | 🟢 Baixo |
| WidgetContext.jsx | 2.4 KB | ✅ | 🟢 Baixo |

### 2.2 Contextos Locais/Feature

| Contexto | Localização | Tamanho | Risco |
|----------|-------------|---------|-------|
| ExportacaoContext.jsx | `admin/components/relatorio/` | 0.6 KB | 🟢 Baixo |
| ToastContext.jsx | `shared/components/contexts/` | 3.3 KB | 🟢 Baixo |
| NotificationContext.jsx | `shared/components/ui/Notification/` | 7.9 KB | 🔴 **Duplicado** |

### 2.3 Problemas Encontrados

1. **NotificationContext duplicado** (🔴 Alto)
   - `src/contexts/NotificationContext.jsx` (3.1 KB)
   - `src/shared/components/ui/Notification/NotificationContext.jsx` (7.9 KB)
   - **Impacto:** Qual é o oficial? Qual é usado?

2. **TestCartContext.jsx** (🟡 Médio)
   - Provavelmente lixo de teste
   - Verificar se é importado em algum lugar

3. **ToastContext vs NotificationContext**
   - Dois sistemas de notificação diferentes
   - Possível duplicação de responsabilidades





   ## 3. Hooks Customizados

### 3.1 Hooks da Feature Home (14 hooks)

| Hook | Responsabilidade | Risco |
|------|------------------|-------|
| `useCliente.js` | Gestão de cliente | 🟢 Baixo |
| `useDatePicker.js` | Seleção de datas | 🟢 Baixo |
| `useGuestCounter.js` | Contador de hóspedes | 🟢 Baixo |
| `useHomeData.js` | Dados da home | 🟢 Baixo |
| `useHomeReservation.js` | Reservas na home | 🟢 Baixo |
| `useMpesaPayment.js` | Pagamento M-Pesa | 🟢 Baixo |
| `usePriceCalculation.js` | Cálculo de preços | 🟢 Baixo |
| `useReservationForm.js` | Formulário de reserva | 🟢 Baixo |
| `useReservationValidation.js` | Validação de reserva | 🟢 Baixo |
| `useRoomOccupancy.js` | Ocupação de quartos | 🟢 Baixo |
| `useRooms.js` | Listagem de quartos | 🟢 Baixo |
| `useRoomSelection.js` | Seleção de quartos | 🟢 Baixo |
| `useScrollToForm.js` | Scroll para formulário | 🟢 Baixo |
| `useServices.js` | Serviços adicionais | 🟢 Baixo |

### 3.2 Hooks de Features Específicas

| Hook | Localização | Responsabilidade | Risco |
|------|-------------|------------------|-------|
| `useSessionTracking.js` | `admin/components/` | Tracking de sessão | 🟢 Baixo |
| `useModalQuarto.js` | `checkout/hooks/` | Modal de quarto | 🟢 Baixo |
| `useMpesaPayment.js` | `checkout/hooks/` | Pagamento M-Pesa | 🟡 Médio (duplicado) |
| `useValidacaoCheckout.js` | `checkout/hooks/` | Validação checkout | 🟢 Baixo |
| `useMinhasReservas.js` | `cliente/hooks/` | Minhas reservas | 🟢 Baixo |

### 3.3 Hooks Globais/Shared

| Hook | Localização | Responsabilidade | Risco |
|------|-------------|------------------|-------|
| `useNotificationSettings.js` | `src/hooks/` | Configurações de notificação | 🟢 Baixo |
| `usePermissions.js` | `src/hooks/` | Permissões | 🟢 Baixo |
| `useWidgetSettings.js` | `src/hooks/` | Configurações de widgets | 🟢 Baixo |
| `useNotification.js` | `shared/ui/Notification/` | Notificações | 🟢 Baixo |
| `useDependency.js` | `shared/hooks/` | **⚠️ Vazio** | 🟡 Médio |
| `useLocalStorage.js` | `shared/hooks/` | LocalStorage | 🟢 Baixo |

### 3.4 Problemas Encontrados

1. **Duplicado:** `useMpesaPayment.js` em 2 lugares
   - `features/home/hooks/useMpesaPayment.js` (4.6 KB)
   - `checkout/hooks/useMpesaPayment.js` (4.0 KB)
   - **Impacto:** Qual é o oficial? Lógica duplicada?

2. **Hook vazio:** `useDependency.js` (0 KB)
   - Provavelmente lixo ou em desenvolvimento

3. **Hooks espalhados:** 5 pastas diferentes
   - Dificulta a manutenção e migração



   ## 4. Estado Global Fora do React

### 4.1 State Management Libraries
❌ Nenhuma biblioteca externa (Redux/Zustand/Recoil/Jotai/MobX)

### 4.2 localStorage: Chaves Identificadas

| Chave | Uso | Localização | Risco |
|-------|-----|-------------|-------|
| `token` | Autenticação | `AuthContext` | 🟢 Baixo |
| `@HotelParadise:token` | Autenticação | `api.js`, `ClienteContext` | 🟢 Baixo |
| `admin_token` | Admin Auth | 30+ arquivos admin | 🔴 Alto |
| `@HotelParadise:cliente` | Cliente | `ClienteContext` | 🟢 Baixo |
| `@HotelParadise:cart` | Carrinho | `CartContext` | 🟢 Baixo |
| `@HotelParadise:pending_reservation` | Reserva pendente | `HomePage` | 🟢 Baixo |
| `pending_reservation_data` | Dados da reserva | `HomePage` | 🟢 Baixo |
| `admin_user` | Admin User | Admin | 🟡 Médio |
| `@HotelParadise:user` | User | `api.js` | 🟢 Baixo |
| `hotel_theme` | Tema | `ThemeContext` | 🟢 Baixo |
| `hotel_timezone` | Timezone | `SistemaTab`, `timezone.js` | 🟢 Baixo |
| `servicos_selecionados` | Serviços | `ServicesContext` | 🟢 Baixo |
| `auto_update_enabled` | Auto-update | `autoUpdateService` | 🟢 Baixo |
| `auto_update_interval` | Intervalo | `autoUpdateService` | 🟢 Baixo |

### 4.3 Problemas Encontrados

1. **Chaves duplicadas para autenticação** (🔴 Alto)
   - `token` vs `@HotelParadise:token`
   - `admin_user` vs `@HotelParadise:user`
   - **Impacto:** Confusão e possível perda de estado

2. **Admin localStorage espalhado** (🟡 Médio)
   - `admin_token` aparece em 30+ arquivos
   - **Impacto:** Dificulta refatoração

3. **Duas abstrações de storage** (🟡 Médio)
   - `shared/utils/storage.js` (abstração)
   - `shared/hooks/useLocalStorage.js` (hook)
   - **Impacto:** Código inconsistente

4. **Abstração de storage não é usada consistentemente**
   - Muitos arquivos acedem diretamente ao `localStorage`
   - **Impacto:** Mudança futura (ex: migrar para API) será difícil


## 5. Acoplamento entre Módulos

### 5.1 Formas de Importar `api.js`

| Forma | Exemplo | Onde é usado | Risco |
|-------|---------|--------------|-------|
| Relativo | `../services/api` | Contextos | 🟢 Baixo |
| Caminho longo | `../../../../../../services/api` | Vários | 🟡 Médio |
| Alias (com @) | `@services/api` | Admin, Checkout | 🟢 Baixo |
| Alias (com @/) | `@/services/api` | Checkout, Recibo | 🟢 Baixo |

### 5.2 Pontos de Acoplamento

| Módulo | Depende de | Nível de acoplamento |
|--------|------------|---------------------|
| `di/container.js` | Repositórios, UseCases, Services | 🟡 Médio (central) |
| `AuthContext.jsx` | `api.js` | 🟢 Baixo |
| `ClienteContext.jsx` | `api.js` | 🟢 Baixo |
| `Checkout.jsx` | `api.js` | 🟢 Baixo |

### 5.3 Problemas Encontrados

1. **Importação inconsistente de `api.js`** (🟡 Médio)
   - 3 formas diferentes no código
   - Dificulta migração para TypeScript

2. **Caminhos relativos excessivamente longos** (🟡 Médio)
   - Exemplo: `../../../../../../services/api`
   - Propenso a erros ao mover arquivos

3. **Alias não padronizado** (🟡 Médio)
   - `@services/api` vs `@/services/api`
   - Deveria ser padronizado

4. **`di/container.js` é o coração do sistema** (🟢 Bom)
   - Centraliza dependências
   - Facilita migração futura


## 6. Singletons e Exports Default

### 6.1 Total de Exports Default: 199

### 6.2 Clientes HTTP (api.js)

| Arquivo | Localização | Tipo | Singleton? | Risco |
|---------|-------------|------|------------|-------|
| `api.js` | `src/services/` | Cliente HTTP | ✅ Sim | 🟢 Baixo |
| `api.js` | `src/features/home/pages/checkout/` | Wrapper de API | ❌ Não | 🟡 Médio |

### 6.3 Análise do checkout/api.js

- **Propósito:** Wrapper para funções de checkout
- **Dependência:** Usa o `api` global de `src/services/api.js`
- **Não é singleton** — é apenas um conjunto de funções exportadas

### 6.4 Problemas Encontrados

1. **Duplicado:** `api.js` em 2 lugares (🟡 Médio)
   - `src/services/api.js` (singleton global)
   - `src/features/home/pages/checkout/api.js` (wrapper)

2. **199 `export default`** — muitos singletons potenciais
   - A maioria são componentes React, não singletons de estado global
   - Necessário distinguir entre:
     - Componentes React (não são singletons)
     - Instâncias de serviços/classes (são singletons)

## ⚠️ ACHADO CRÍTICO (Dia 0.3) — Arquitetura DDD paralela nunca ativada

Existem DUAS implementações de acesso a dados de quartos/reservas coexistindo:

1. **Caminho ativo (produção real):** `useRooms.js` → importa `features/home/data/roomsData.js`
   diretamente. Sem persistência, sem repositório, dados sempre estáticos/mock.

2. **Caminho construído mas DESLIGADO:** DI Container completo (`di/container.js`,
   `di/providers.jsx`, `di/homeDependencies.jsx`) com repositórios, use-cases e
   Value Objects seguindo DDD. NUNCA importado em `App.jsx` — zero consumidores
   confirmados via busca no código.

**Bug latente:** o caminho 2 importa `src/data/roomsData.js` e `src/data/servicesData.js`,
que NÃO EXISTEM no projeto (confirmado via Test-Path). Se este caminho for ativado no
futuro sem correção, a aplicação quebra imediatamente ao montar o DI.

**Decisão:** não resolver agora (fora do escopo de auditoria/fusão). Registar como
item de decisão arquitetural para o Dia 0.4+ ou backlog: (a) ligar o DI real à
HomePage e criar os dados em falta, ou (b) descartar o caminho 2 como código morto.

**Status dos repositórios fundidos (Room/Reservation/Service):** corrigidos e
funcionais quando/se o DI for ativado — mas o import de roomsData/servicesData
continua quebrado até essa decisão ser tomada.


## 2026-07-19 — Dia 0.3: Fusão de repositórios divergentes

### LocalStorageRoomRepository
- Duas versões encontradas (domain/interfaces vs infrastructure), hashes diferentes
- Bug crítico corrigido: versão ativa sobrescrevia SEMPRE os dados com mock ao
  instanciar (risco de perda de dados reais a cada reload da app)
- Fundido: contrato IRoomRepository + inicialização condicional + typeLabel/fallback
  de moeda (melhorias da versão ativa) + bulkUpdateStatus (recuperado da órfã)
- Testado: OK (npm run dev sem erros, 6 quartos carregam corretamente)
- Órfã arquivada: src/_archive/LocalStorageRoomRepository.orphan.js

### LocalStorageReservationRepository
- Achado CRÍTICO: versão ativa não verificava conflito de datas em save() nem
  update(), e não impedia remoção de reserva ativa em delete() — risco real de
  overbooking e perda de reservas ativas
- Fundido: contrato IReservationRepository + todas as validações de segurança
  restauradas + métodos ausentes recuperados (findByStatus, findActive,
  findUpcoming, getStatistics, cancel, confirm, checkIn, checkOut, etc.)
- Removido import morto de roomsData/servicesData (dead code, também corrigia
  um import quebrado)
- Testado: OK (compila sem erros; caminho ainda não exercitado em runtime —
  ver achado sobre DI Container abaixo)
- Órfã arquivada: src/_archive/LocalStorageReservationRepository.orphan.js

### LocalStorageServiceRepository
- Divergência mínima: versão ativa já superior (fallback _createDefaultServices)
- Nenhuma fusão necessária
- Órfã arquivada: src/_archive/LocalStorageServiceRepository.orphan.js

### Achado arquitetural (não resolvido, ver docs/CORE_MAP.md)
- DI Container completo (repositórios, use-cases, Value Objects) nunca foi
  ligado ao App.jsx. HomePage usa caminho paralelo simplificado (useRooms.js +
  mock direto, sem persistência). Import quebrado de src/data/roomsData.js e
  src/data/servicesData.js (arquivos não existem) fica latente até decisão
  futura de ativar ou descartar o DI Container real.

  