// =====================================================
// COMPONENTE - TABELA DE QUARTOS (COM MÚLTIPLA SELEÇÃO)
// =====================================================

import React from 'react';
import StatusBadge from './StatusBadge';

const TabelaQuartosModal = ({ quartos, quartosTemp, onToggle }) => {
  const isQuartoDisponivel = (status) => {
    return status === 'disponível' || status === 'available';
  };

  const isQuartoSelecionado = (quartoId) => {
    return quartosTemp.some(q => q.id === quartoId);
  };

  const handleRowClick = (quarto) => {
    if (isQuartoDisponivel(quarto.status)) {
      onToggle(quarto);
    }
  };

  const styles = {
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.9rem'
    },
    th: {
      textAlign: 'left',
      padding: '12px 8px',
      backgroundColor: '#f8f9fa',
      fontWeight: '600',
      color: '#495057',
      borderBottom: '2px solid #dee2e6'
    },
    td: {
      padding: '12px 8px',
      borderBottom: '1px solid #eaeaea'
    },
    trDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
      backgroundColor: '#f5f5f5'
    },
    trAvailable: {
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    trSelected: {
      backgroundColor: '#e3f2fd'
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Selecionar</th>
            <th style={styles.th}>Nº Quarto</th>
            <th style={styles.th}>Tipo</th>
            <th style={styles.th}>Andar</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {quartos.map((quarto) => {
            const disponivel = isQuartoDisponivel(quarto.status);
            const selecionado = isQuartoSelecionado(quarto.id);

            const rowStyle = {
              ...styles.td,
              ...(!disponivel ? styles.trDisabled : styles.trAvailable),
              ...(selecionado ? styles.trSelected : {})
            };

            return (
              <tr
                key={quarto.id}
                onClick={() => handleRowClick(quarto)}
                style={rowStyle}
                onMouseEnter={(e) => {
                  if (disponivel && !selecionado) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (disponivel && !selecionado) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {/* CORRIGIDO: Combinando os estilos em um único objeto */}
                <td style={{ 
                  ...styles.td, 
                  textAlign: 'center', 
                  width: '50px' 
                }}>
                  {disponivel ? (
                    selecionado ? (
                      <span style={{ color: '#28a745', fontSize: '1.2rem' }}>✅</span>
                    ) : (
                      <span style={{ color: '#6c757d', fontSize: '1rem' }}>○</span>
                    )
                  ) : (
                    <span style={{ color: '#dc3545', fontSize: '1rem' }}>❌</span>
                  )}
                </td>
                <td style={styles.td}>
                  <strong>{quarto.numero}</strong>
                </td>
                <td style={styles.td}>{quarto.tipo}</td>
                <td style={styles.td}>{quarto.andar || '-'}</td>
                <td style={styles.td}>
                  <StatusBadge status={quarto.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaQuartosModal;