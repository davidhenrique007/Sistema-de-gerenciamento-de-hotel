// frontend/src/features/home/pages/admin/components/relatorio/ComparativoPeriodo.jsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';
import './ComparativoPeriodo.css';

const ComparativoPeriodo = ({ filtros }) => {
  const [loading, setLoading] = useState(true);
  const [comparativo, setComparativo] = useState(null);

  const carregarComparativo = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams(filtros);
      const response = await fetch(`http://localhost:5000/api/admin/relatorios/comparativo?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();

      if (result.success) {
        setComparativo(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar comparativo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarComparativo();
  }, [filtros]);

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' MTn';
  };

  if (loading) {
    return <div className="comparativoSkeleton"><div className="skeletonCard"></div></div>;
  }

  if (!comparativo) return null;

  const isPositive = comparativo.comparativo.deltaPercentual >= 0;

  return (
    <div className="comparativoContainer">
      <div className="comparativoHeader">
        <h3>📊 Comparativo com Período Anterior</h3>
      </div>

      <div className="comparativoGrid">
        <div className="comparativoCard current">
          <div className="cardLabel">Período Atual</div>
          <div className="cardValue">{formatCurrency(comparativo.current.receita)}</div>
          <div className="cardDetails">
            <span>{comparativo.current.quantidade} reservas</span>
            <span>Ticket: {formatCurrency(comparativo.current.ticketMedio)}</span>
          </div>
        </div>

        <div className={`comparativoCard previous ${isPositive ? 'positive' : 'negative'}`}>
          <div className="cardLabel">Período Anterior</div>
          <div className="cardValue">{formatCurrency(comparativo.previous.receita)}</div>
          <div className="cardDetails">
            <span>{comparativo.previous.quantidade} reservas</span>
            <span>Ticket: {formatCurrency(comparativo.previous.ticketMedio)}</span>
          </div>
        </div>

        <div className="comparativoDelta">
          <div className={`deltaIcon ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
          </div>
          <div className="deltaValue">
            <span className={`deltaPercent ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}{comparativo.comparativo.deltaPercentual}%
            </span>
            <span className="deltaAbsoluto">
              {formatCurrency(Math.abs(comparativo.comparativo.deltaAbsoluto))}
            </span>
          </div>
          <div className="deltaLabel">
            {isPositive ? 'Crescimento' : 'Queda'} em relação ao período anterior
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparativoPeriodo;