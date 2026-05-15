// =====================================================
// HOTEL PARADISE - HOOK USECLIENTE
// Versão: 1.0.0
// Localização: src/features/home/hooks/useCliente.js
// =====================================================

import { useCliente as useClienteContext } from '../../../contexts/ClienteContext'; // ✅ CORRIGIDO: 3 níveis para cima

/**
 * Hook personalizado para acessar o contexto do cliente
 * Fornece uma API simplificada e segura
 */
export const useCliente = () => {
  const context = useClienteContext();
  
  // Validação de segurança
  if (!context) {
    throw new Error('useCliente must be used within ClienteProvider');
  }
  
  // Funções auxiliares para uso comum
  const getNomeAbreviado = () => {
    if (!context.cliente?.name) return '';
    const partes = context.cliente.name.split(' ');
    return partes.length > 1 
      ? `${partes[0]} ${partes[partes.length-1]}`
      : partes[0];
  };

  const getIniciais = () => {
    if (!context.cliente?.name) return '';
    const partes = context.cliente.name.split(' ');
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return `${partes[0][0]}${partes[partes.length-1][0]}`.toUpperCase();
  };

  const getTempoSessao = () => {
    if (!context.ultimaAtualizacao) return null;
    const agora = new Date();
    const diffMs = agora - context.ultimaAtualizacao;
    const diffMin = Math.floor(diffMs / 60000);
    
    if (diffMin < 1) return 'agora';
    if (diffMin === 1) return '1 minuto';
    if (diffMin < 60) return `${diffMin} minutos`;
    
    const diffHr = Math.floor(diffMin / 60);
    const diffRestoMin = diffMin % 60;
    
    if (diffHr === 1) {
      return diffRestoMin > 0 ? `1 hora e ${diffRestoMin} minutos` : '1 hora';
    }
    return diffRestoMin > 0 ? `${diffHr} horas e ${diffRestoMin} minutos` : `${diffHr} horas`;
  };

  return {
    // Dados do contexto (espalhamento)
    ...context,
    
    // Dados derivados
    nomeAbreviado: getNomeAbreviado(),
    iniciais: getIniciais(),
    tempoSessao: getTempoSessao(),
    
    // Flags úteis
    temCliente: !!context.cliente,
    temEmail: !!context.cliente?.email,
    temDocumento: !!context.cliente?.document,
    temTelefone: !!context.cliente?.phone,
    
    // Função para renovar sessão em ações importantes
    registrarAcao: () => {
      if (context.renovarSessao) {
        context.renovarSessao();
      }
    },
    
    // Função para logout rápido
    sair: () => {
      if (context.logoutCliente) {
        context.logoutCliente();
      }
    }
  };
};

export default useCliente;