// =====================================================
// HOTEL PARADISE - HOOK USECLIENTE
// Versão: 1.0.0
// =====================================================

import { useCliente as useClienteContext } from '../../../contexts/ClienteContext'; 

/**
 * Hook personalizado para acessar o contexto do cliente
 * Fornece uma API simplificada e segura
 */
export const useCliente = () => {
  const context = useClienteContext();
  
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
    if (partes.length === 1) return partes[0][0];
    return `${partes[0][0]}${partes[partes.length-1][0]}`;
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
    return diffHr === 1 ? '1 hora' : `${diffHr} horas`;
  };

  return {
    // Dados do contexto
    ...context,
    
    // Dados derivados
    nomeAbreviado: getNomeAbreviado(),
    iniciais: getIniciais(),
    tempoSessao: getTempoSessao(),
    
    // Flags úteis
    temCliente: !!context.cliente,
    temEmail: !!context.cliente?.email,
    temDocumento: !!context.cliente?.document,
    
    // Função para renovar sessão em ações importantes
    registrarAcao: () => {
      context.renovarSessao();
    }
  };
};

export default useCliente;