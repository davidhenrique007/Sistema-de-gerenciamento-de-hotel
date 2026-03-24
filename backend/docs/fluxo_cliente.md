# Fluxo do Cliente - Sistema de Reservas

## Visão Geral
O sistema garante integridade de reservas mesmo sob alta concorrência, utilizando locks otimistas e pessimistas, filas de processamento e Redis para controle distribuído.

## Passo a Passo

### 1. Página Inicial
![Home Page](./screenshots/home.png)
- Visualização de quartos disponíveis
- Seleção de datas
- Filtros por tipo e preço

### 2. Seleção de Quarto
![Modal Quartos](./screenshots/modal-quartos.png)
- Visualização detalhada do quarto
- Seleção de múltiplos quartos
- Verificação em tempo real de disponibilidade

### 3. Checkout
![Checkout](./screenshots/checkout.png)
- Layout de duas colunas:
  - Esquerda: Seleção de quartos e pagamento
  - Direita: Dados do hóspede e resumo
- Serviços adicionais
- Cálculo automático de impostos

### 4. Processamento de Pagamento
![Pagamento](./screenshots/pagamento.png)
- Múltiplas formas de pagamento
- Fila de processamento
- Feedback em tempo real

### 5. Confirmação
![Confirmação](./screenshots/confirmacao.png)
- Número de reserva
- Detalhes da estadia
- Opções de cancelamento

## Tratamento de Conflitos

Quando dois clientes tentam reservar o mesmo quarto:

![Erro Concorrência](./screenshots/erro-concorrencia.png)

**Mensagem amigável:**
> "Este quarto foi reservado por outro cliente. Por favor, selecione outro quarto."

## Arquitetura Técnica

### Controle de Concorrência
- **Lock Otimista**: Versão no banco de dados
- **Lock Pessimista**: `SELECT FOR UPDATE`
- **Lock Distribuído**: Redis com TTL

### Fila de Processamento
- Bull + Redis
- 3 tentativas com backoff exponencial
- Processamento assíncrono

### Banco de Dados
- Transações ACID
- Índices otimizados
- Isolamento `REPEATABLE READ`

## Testes Realizados

- ✅ 10 requisições simultâneas → 1 sucesso, 9 conflitos
- ✅ 50 requisições em burst → 1 sucesso, 49 conflitos
- ✅ Datas diferentes → 5 reservas independentes
- ✅ Fluxo completo end-to-end
- ✅ Responsividade mobile (320px, 375px, 768px)

## Métricas de Performance

| Métrica | Valor |
|---------|-------|
| Tempo médio de reserva | 1.2s |
| Concorrência suportada | 500 req/s |
| Lock timeout | 10s |
| Redis hit rate | 99.5% |