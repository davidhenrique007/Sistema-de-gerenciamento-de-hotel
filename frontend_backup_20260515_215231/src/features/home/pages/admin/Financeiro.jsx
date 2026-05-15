import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutAdmin from './components/LayoutAdmin';
import TabelaPagamentos from './components/pagamento/TabelaPagamentos';
import ResumoFinanceiro from './components/pagamento/ResumoFinanceiro';
import AlertasPagamento from './components/pagamento/AlertasPagamento';
import { Calendar, RefreshCw, AlertTriangle } from 'lucide-react';
import './Financeiro.css';

const Financeiro = () => {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState(null);
  const [filtros, setFiltros] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'todos',
    metodo: 'todos'
  });
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  const carregarDados = async () => {
    setLoading(true);
    setErro(null);
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams(filtros);
      const response = await fetch(`http://localhost:5000/api/admin/financeiro/dashboard?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      console.log('📊 Dados recebidos da API:', data);
      
      if (data.success) {
        // Mapear os dados da API para a estrutura esperada pelos componentes
        const dadosMapeados = {
          resumo: {
            receitaBruta: data.totalReservas?.receitaRealizada + data.totalReservas?.receitaPendente || 0,
            descontos: 0,
            receitaLiquida: data.totalReservas?.receitaRealizada || 0,
            totalRecebido: data.totalReservas?.receitaRealizada || 0,
            totalPendente: data.totalReservas?.receitaPendente || 0
          },
          pagamentosPorMetodo: [
            { metodo: 'mpesa', valor: data.paymentMethods?.mpesa?.valor || 0, quantidade: data.paymentMethods?.mpesa?.quantidade || 0 },
            { metodo: 'cartao', valor: data.paymentMethods?.card?.valor || 0, quantidade: data.paymentMethods?.card?.quantidade || 0 },
            { metodo: 'dinheiro', valor: data.paymentMethods?.cash?.valor || 0, quantidade: data.paymentMethods?.cash?.quantidade || 0 }
          ].filter(m => m.valor > 0),
          alertas: [],
          pagamentos: [],
          conciliacao: {
            totalPagamentos: (data.totalReservas?.total || 0),
            valorTotal: (data.totalReservas?.receitaRealizada || 0) + (data.totalReservas?.receitaPendente || 0),
            pagos: data.totalReservas?.total || 0,
            valorPago: data.totalReservas?.receitaRealizada || 0,
            pendentes: data.summary?.totalPendingReservations || 0,
            valorPendente: data.summary?.pendingPayments || 0,
            taxaConciliacao: data.totalReservas?.total > 0 
              ? (data.totalReservas?.receitaRealizada / (data.totalReservas?.receitaRealizada + data.totalReservas?.receitaPendente)) * 100 
              : 0
          }
        };
        setDados(dadosMapeados);
      } else if (data.message === 'Acesso negado') {
        navigate('/admin/dashboard');
      } else {
        setErro(data.message || 'Erro ao carregar dados');
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      setErro('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' MTn';
  };

  if (loading) {
    return (
      <LayoutAdmin>
        <div className="loadingContainer">
          <div className="spinner"></div>
          <p>Carregando dados financeiros...</p>
        </div>
      </LayoutAdmin>
    );
  }

  if (erro) {
    return (
      <LayoutAdmin>
        <div className="errorContainer">
          <AlertTriangle size={48} />
          <h2>Erro ao carregar dados</h2>
          <p>{erro}</p>
          <button onClick={carregarDados} className="btnRefresh">Tentar novamente</button>
        </div>
      </LayoutAdmin>
    );
  }

  if (!dados) {
    return (
      <LayoutAdmin>
        <div className="emptyContainer">
          <p>Nenhum dado disponível</p>
        </div>
      </LayoutAdmin>
    );
  }

  const taxaConciliacao = dados.conciliacao?.taxaConciliacao || 0;

  return (
    <LayoutAdmin>
      <div className="financeiroContainer">
        <div className="header">
          <h1 className="title">Dashboard Financeiro</h1>
          <p className="subtitle">Visão completa das operações financeiras do hotel</p>
        </div>

        <div className="filtersCard">
          <div className="filtersTitle">
            <Calendar size={16} /> Filtros
          </div>
          <div className="filtersGrid">
            <div className="filterGroup">
              <label>Data Início</label>
              <input type="date" value={filtros.startDate} onChange={(e) => handleFiltroChange('startDate', e.target.value)} className="filterInput" />
            </div>
            <div className="filterGroup">
              <label>Data Fim</label>
              <input type="date" value={filtros.endDate} onChange={(e) => handleFiltroChange('endDate', e.target.value)} className="filterInput" />
            </div>
            <div className="filterGroup">
              <label>Status</label>
              <select value={filtros.status} onChange={(e) => handleFiltroChange('status', e.target.value)} className="filterSelect">
                <option value="todos">Todos</option>
                <option value="paid">Pagos</option>
                <option value="pending">Pendentes</option>
                <option value="partial">Parcial</option>
              </select>
            </div>
            <div className="filterGroup">
              <label>Método</label>
              <select value={filtros.metodo} onChange={(e) => handleFiltroChange('metodo', e.target.value)} className="filterSelect">
                <option value="todos">Todos</option>
                <option value="mpesa">M-Pesa</option>
                <option value="cartao">Cartão</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </div>
            <div className="filterActions">
              <button onClick={carregarDados} className="btnRefresh">
                <RefreshCw size={16} /> Atualizar
              </button>
            </div>
          </div>
        </div>

        <ResumoFinanceiro resumo={dados.resumo} />

        <div className="alertasConciliacaoRow">
          <AlertasPagamento alertas={dados.alertas || []} />
          
          <div className="conciliacaoCard">
            <h3>🏦 Conciliação Bancária</h3>
            <div className="conciliacaoStats">
              <div className="conciliacaoItem">
                <span className="label">Pagamentos Registados</span>
                <span className="value">{dados.conciliacao?.totalPagamentos || 0}</span>
                <span className="sub">{formatCurrency(dados.conciliacao?.valorTotal || 0)}</span>
              </div>
              <div className="conciliacaoItem success">
                <span className="label">✓ Pagamentos Recebidos</span>
                <span className="value">{dados.conciliacao?.pagos || 0}</span>
                <span className="sub">{formatCurrency(dados.conciliacao?.valorPago || 0)}</span>
              </div>
              <div className="conciliacaoItem warning">
                <span className="label">⚠️ Pendentes</span>
                <span className="value">{dados.conciliacao?.pendentes || 0}</span>
                <span className="sub">{formatCurrency(dados.conciliacao?.valorPendente || 0)}</span>
              </div>
            </div>
            <div className="conciliacaoTaxa">
              <div className="taxaBar">
                <div className="taxaFill" style={{ width: `${taxaConciliacao}%` }}></div>
              </div>
              <span>Taxa de Conciliação: {taxaConciliacao.toFixed(1)}%</span>
            </div>
            {taxaConciliacao < 90 && (
              <div className="conciliacaoAlerta">
                <AlertTriangle size={16} />
                <span>Taxa de conciliação abaixo do esperado. Verifique pagamentos pendentes.</span>
              </div>
            )}
          </div>
        </div>

        <div className="metodosCard">
          <h3>📊 Pagamentos por Método</h3>
          <div className="metodosGrid">
            {dados.pagamentosPorMetodo && dados.pagamentosPorMetodo.length > 0 ? (
              dados.pagamentosPorMetodo.map((metodo, idx) => (
                <div key={idx} className="metodoItem">
                  <div className="metodoIcon">
                    {metodo.metodo === 'mpesa' && '📱'}
                    {metodo.metodo === 'cartao' && '💳'}
                    {metodo.metodo === 'dinheiro' && '💵'}
                  </div>
                  <div className="metodoInfo">
                    <span className="metodoNome">
                      {metodo.metodo === 'mpesa' ? 'M-Pesa' : 
                       metodo.metodo === 'cartao' ? 'Cartão' : 
                       metodo.metodo === 'dinheiro' ? 'Dinheiro' : 'Outros'}
                    </span>
                    <span className="metodoValor">{formatCurrency(metodo.valor)}</span>
                    <span className="metodoQuantidade">{metodo.quantidade} transações</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="emptyState">Nenhum dado disponível</div>
            )}
          </div>
        </div>

        <TabelaPagamentos 
          pagamentos={dados.pagamentos || []} 
          loading={loading}
          onRefresh={carregarDados}
        />
      </div>
    </LayoutAdmin>
  );
};

export default Financeiro;
