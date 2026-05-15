// frontend/src/features/home/pages/admin/components/pagamento/AlertasPagamento.jsx
import React from 'react';
import { AlertTriangle, Clock, DollarSign } from 'lucide-react';
import './AlertasPagamento.css';

const AlertasPagamento = ({ alertas }) => {
  const formatCurrency = (value) => {
    return value.toLocaleString('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' MTn';
  };

  const totalAtraso = alertas.reduce((sum, a) => sum + parseFloat(a.total_price || 0), 0);
  const maiorAtraso = alertas.length > 0 ? Math.max(...alertas.map(a => parseInt(a.dias_atraso) || 0)) : 0;

  return (
    <div className="alertasPagamento">
      <div className="alertasHeader">
        <h3>⚠️ Alertas de Pagamento</h3>
        <div className="alertasStats">
          <div className="alertStat">
            <span className="statValue">{alertas.length}</span>
            <span className="statLabel">Pagamentos Atrasados</span>
          </div>
          <div className="alertStat">
            <span className="statValue">{formatCurrency(totalAtraso)}</span>
            <span className="statLabel">Valor em Atraso</span>
          </div>
          <div className="alertStat">
            <span className="statValue">{maiorAtraso} dias</span>
            <span className="statLabel">Maior Atraso</span>
          </div>
        </div>
      </div>

      {alertas.length === 0 ? (
        <div className="noAlerts">
          <span>✅</span>
          <p>Nenhum pagamento em atraso no momento</p>
        </div>
      ) : (
        <div className="alertasList">
          {alertas.map(alerta => (
            <div key={alerta.id} className={`alertaItem ${alerta.dias_atraso > 30 ? 'critical' : alerta.dias_atraso > 15 ? 'high' : 'medium'}`}>
              <div className="alertaIcon">
                <AlertTriangle size={20} />
              </div>
              <div className="alertaContent">
                <div className="alertaTitle">
                  <strong>{alerta.cliente_nome}</strong>
                  <span className="alertaCodigo">{alerta.reservation_code}</span>
                </div>
                <div className="alertaDetails">
                  <span><Clock size={12} /> {alerta.dias_atraso} dias em atraso</span>
                  <span><DollarSign size={12} /> {formatCurrency(alerta.total_price)}</span>
                  <span>📞 {alerta.cliente_telefone || '-'}</span>
                </div>
              </div>
              <div className="alertaAction">
                <button className="btnNotificar">Notificar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertasPagamento;