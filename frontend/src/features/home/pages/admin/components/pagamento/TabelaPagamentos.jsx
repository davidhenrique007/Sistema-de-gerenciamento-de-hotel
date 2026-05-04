import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import './TabelaPagamentos.css';

const TabelaPagamentos = ({ pagamentos, loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const getStatusBadge = (status) => {
    const badges = {
      paid: { label: 'Pago', class: 'statusPaid' },
      pending: { label: 'Pendente', class: 'statusPending' },
      partial: { label: 'Parcial', class: 'statusPartial' }
    };
    return badges[status] || { label: status, class: 'statusPending' };
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' MTn';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const filteredPagamentos = pagamentos.filter(p => 
    p.reservation_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.metodo_pagamento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPagamentos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPagamentos = filteredPagamentos.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return <div className="skeletonTabela"><div className="skeletonLine"></div></div>;
  }

  return (
    <div className="tabelaPagamentos">
      <div className="tabelaHeader">
        <h3>📋 Histórico de Pagamentos</h3>
        <div className="searchBox">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por código, cliente ou método..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="tableWrapper">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Método</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {currentPagamentos.length === 0 ? (
              <tr>
                <td colSpan="6" className="emptyState">Nenhum pagamento encontrado</td>
              </tr>
            ) : (
              currentPagamentos.map(p => {
                const statusBadge = getStatusBadge(p.status);
                return (
                  <tr key={p.id}>
                    <td className="codigo">{p.reservation_code}</td>
                    <td>{p.cliente_nome}<br/><small>{p.cliente_telefone}</small></td>
                    <td>{p.metodo_pagamento === 'mpesa' ? '📱 M-Pesa' : p.metodo_pagamento === 'cartao' ? '💳 Cartão' : p.metodo_pagamento === 'dinheiro' ? '💵 Dinheiro' : '-'}</td>
                    <td className="valor">{formatCurrency(p.valor)}</td>
                    <td><span className={`statusBadge ${statusBadge.class}`}>{statusBadge.label}</span></td>
                    <td>{formatDate(p.data_pagamento) || formatDate(p.check_in)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredPagamentos.length > 0 && (
        <div className="pagination">
          <div className="itemsPerPage">
            <span>Mostrar</span>
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>por página</span>
          </div>
          <div className="paginationControls">
            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
              <ChevronLeft size={16} /> Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
              Próxima <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabelaPagamentos;
