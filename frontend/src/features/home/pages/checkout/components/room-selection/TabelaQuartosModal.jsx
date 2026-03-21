import React from 'react';
import StatusBadge from './StatusBadge';

const TabelaQuartosModal = ({ quartos, quartoTemp, onSelect }) => {
  const isQuartoDisponivel = (status) => status === 'disponível';

  const handleRowClick = (quarto) => {
    if (isQuartoDisponivel(quarto.status)) {
      onSelect(quarto);
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Selecionar</th>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Nº Quarto</th>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Tipo</th>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {quartos.map((quarto) => {
            const disponivel = isQuartoDisponivel(quarto.status);
            const selecionado = quartoTemp?.id === quarto.id;

            return (
              <tr
                key={quarto.id}
                onClick={() => handleRowClick(quarto)}
                style={{
                  cursor: disponivel ? 'pointer' : 'not-allowed',
                  opacity: disponivel ? 1 : 0.5,
                  backgroundColor: selecionado ? '#e3f2fd' : 'transparent',
                  borderBottom: '1px solid #eaeaea'
                }}
                onMouseEnter={(e) => {
                  if (disponivel) e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  if (disponivel) e.currentTarget.style.backgroundColor = selecionado ? '#e3f2fd' : 'transparent';
                }}
              >
                <td style={{ padding: '12px 8px' }}>
                  {disponivel ? (
                    selecionado ? '✅' : '○'
                  ) : '❌'}
                </td>
                <td style={{ padding: '12px 8px' }}>{quarto.numero}</td>
                <td style={{ padding: '12px 8px' }}>{quarto.tipo}</td>
                <td style={{ padding: '12px 8px' }}>
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
