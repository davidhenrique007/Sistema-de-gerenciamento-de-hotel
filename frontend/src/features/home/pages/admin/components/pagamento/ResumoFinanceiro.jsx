// frontend/src/features/home/pages/admin/components/pagamento/ResumoFinanceiro.jsx
import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import './ResumoFinanceiro.css';

const ResumoFinanceiro = ({ resumo }) => {
  const formatCurrency = (value) => {
    return value.toLocaleString('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' MTn';
  };

  const cards = [
    {
      titulo: 'Receita Bruta',
      valor: resumo.receitaBruta || 0,
      icon: <DollarSign size={24} />,
      cor: 'blue'
    },
    {
      titulo: 'Descontos',
      valor: resumo.descontos || 0,
      icon: <TrendingDown size={24} />,
      cor: 'orange'
    },
    {
      titulo: 'Receita Líquida',
      valor: resumo.receitaLiquida || 0,
      icon: <TrendingUp size={24} />,
      cor: 'green'
    },
    {
      titulo: 'Total Recebido',
      valor: resumo.totalRecebido || 0,
      icon: <DollarSign size={24} />,
      cor: 'green'
    },
    {
      titulo: 'Total Pendente',
      valor: resumo.totalPendente || 0,
      icon: <AlertCircle size={24} />,
      cor: 'red'
    }
  ];

  return (
    <div className="resumoFinanceiro">
      <div className="resumoGrid">
        {cards.map((card, idx) => (
          <div key={idx} className={`resumoCard ${card.cor}`}>
            <div className="resumoIcon">{card.icon}</div>
            <div className="resumoInfo">
              <span className="resumoValor">{formatCurrency(card.valor)}</span>
              <span className="resumoLabel">{card.titulo}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumoFinanceiro;