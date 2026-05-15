// frontend/src/features/home/pages/admin/components/relatorio/PrevisaoOcupacao.jsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import './PrevisaoOcupacao.css';

const PrevisaoOcupacao = ({ filtros }) => {
  const [loading, setLoading] = useState(true);
  const [dadosPrevisao, setDadosPrevisao] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [tendencia, setTendencia] = useState({ direcao: 'estavel', percentual: 0 });

  const carregarPrevisao = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch('http://localhost:5000/api/admin/reservas?limit=500', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      let reservas = data.success && data.data ? data.data : [];
      reservas = reservas.filter(r => r.status_reserva === 'confirmed');
      
      // Calcular média de ocupação por dia da semana
      const ocupacaoPorDia = new Array(7).fill(0);
      const totalPorDia = new Array(7).fill(0);
      
      reservas.forEach(r => {
        const data = new Date(r.data_checkin);
        const diaSemana = data.getDay();
        ocupacaoPorDia[diaSemana]++;
        totalPorDia[diaSemana]++;
      });
      
      const mediaPorDia = ocupacaoPorDia.map((total, i) => ({
        dia: i,
        media: totalPorDia[i] > 0 ? Math.min(Math.round((total / (totalPorDia[i] || 1)) * 5), 100) : 0
      }));
      
      // Gerar previsão para próximos 30 dias
      const previsao = [];
      const hoje = new Date();
      const alertasTemp = [];
      
      for (let i = 1; i <= 30; i++) {
        const data = new Date();
        data.setDate(hoje.getDate() + i);
        const diaSemana = data.getDay();
        const ocupacaoBase = mediaPorDia[diaSemana]?.media || 20;
        const variacao = Math.sin(i * 0.3) * 10;
        let ocupacaoPrevista = Math.min(Math.max(ocupacaoBase + variacao, 10), 95);
        
        // Ajuste para fins de semana
        if (diaSemana === 0 || diaSemana === 6) {
          ocupacaoPrevista = Math.min(ocupacaoPrevista + 15, 95);
        }
        
        previsao.push({
          data: `${data.getDate()}/${data.getMonth() + 1}`,
          dataCompleta: data,
          ocupacao: Math.round(ocupacaoPrevista),
          diaSemana: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'][diaSemana],
          isFuturo: true
        });
        
        if (ocupacaoPrevista < 40) {
          alertasTemp.push({
            data: `${data.getDate()}/${data.getMonth() + 1}`,
            ocupacao: Math.round(ocupacaoPrevista),
            diaSemana: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][diaSemana]
          });
        }
      }
      
      // Calcular tendência
      const ultimos5 = previsao.slice(-5);
      const mediaInicio = ultimos5.slice(0, 3).reduce((s, d) => s + d.ocupacao, 0) / 3;
      const mediaFim = ultimos5.slice(-3).reduce((s, d) => s + d.ocupacao, 0) / 3;
      const variacaoTendencia = ((mediaFim - mediaInicio) / mediaInicio) * 100;
      
      setDadosPrevisao(previsao);
      setAlertas(alertasTemp);
      setTendencia({
        direcao: variacaoTendencia > 2 ? 'crescimento' : variacaoTendencia < -2 ? 'queda' : 'estavel',
        percentual: Math.abs(Math.round(variacaoTendencia))
      });
      
    } catch (error) {
      console.error('Erro ao carregar previsão:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPrevisao();
  }, [filtros]);

  if (loading) {
    return <div className="skeletonPrevisao"><div className="skeletonLine"></div></div>;
  }

  return (
    <div className="previsaoOcupacao">
      <div className="previsaoHeader">
        <h3>🔮 Previsão de Ocupação - Próximos 30 Dias</h3>
        <div className={`tendenciaBadge ${tendencia.direcao}`}>
          {tendencia.direcao === 'crescimento' && <TrendingUp size={16} />}
          {tendencia.direcao === 'queda' && <TrendingDown size={16} />}
          <span>
            {tendencia.direcao === 'crescimento' && `+${tendencia.percentual}% tendência`}
            {tendencia.direcao === 'queda' && `${tendencia.percentual}% queda prevista`}
            {tendencia.direcao === 'estavel' && 'Estável'}
          </span>
        </div>
      </div>

      {alertas.length > 0 && (
        <div className="alertasContainer">
          <div className="alertaCard">
            <AlertTriangle size={20} />
            <div className="alertaContent">
              <strong>⚠️ Atenção: Baixa Ocupação Prevista</strong>
              <p>{alertas.length} dias com ocupação abaixo de 40% nos próximos 30 dias</p>
              <div className="alertasLista">
                {alertas.slice(0, 5).map((alerta, idx) => (
                  <span key={idx} className="alertaDia">{alerta.diaSemana}, {alerta.data} ({alerta.ocupacao}%)</span>
                ))}
                {alertas.length > 5 && <span className="alertaMais">+{alertas.length - 5} dias</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="chartCard">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dadosPrevisao}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="data" stroke="#64748b" fontSize={11} interval={6} />
            <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}%`, 'Ocupação Prevista']} labelFormatter={(label) => `Data: ${label}`} />
            <Legend />
            <Line type="monotone" dataKey="ocupacao" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} name="Ocupação Prevista" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="previsaoStats">
        <div className="statCard">
          <div className="statIcon">📈</div>
          <div className="statInfo">
            <span className="statValue">Média Prevista</span>
            <span className="statNumber">{Math.round(dadosPrevisao.reduce((s, d) => s + d.ocupacao, 0) / dadosPrevisao.length)}%</span>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon">📊</div>
          <div className="statInfo">
            <span className="statValue">Pico Previsto</span>
            <span className="statNumber">{Math.max(...dadosPrevisao.map(d => d.ocupacao))}%</span>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon">📉</div>
          <div className="statInfo">
            <span className="statValue">Mínimo Previsto</span>
            <span className="statNumber">{Math.min(...dadosPrevisao.map(d => d.ocupacao))}%</span>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon">📅</div>
          <div className="statInfo">
            <span className="statValue">Dias Críticos</span>
            <span className="statNumber">{alertas.length}</span>
          </div>
        </div>
      </div>

      {alertas.length > 0 && (
        <div className="recomendacaoCard">
          <div className="recomendacaoIcon">💡</div>
          <div className="recomendacaoContent">
            <strong>Recomendação Comercial</strong>
            <p>Considere lançar promoções especiais para os períodos de baixa ocupação identificados. Ofertas de último minuto podem ajudar a aumentar a taxa de ocupação.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrevisaoOcupacao;