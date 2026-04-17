// frontend/src/features/home/pages/admin/components/relatorio/RankingQuartos.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, TrendingUp, Award, Medal } from 'lucide-react';
import './RankingQuartos.css';

const RankingQuartos = ({ filtros }) => {
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState([]);
  const [stats, setStats] = useState({
    totalReservas: 0,
    mediaReservas: 0,
    quartoTop: null
  });

  const carregarRanking = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch('http://localhost:5000/api/admin/reservas?limit=500', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      let reservas = data.success && data.data ? data.data : [];
      
      // Filtrar apenas reservas confirmadas
      reservas = reservas.filter(r => r.status_reserva === 'confirmed');
      
      // Agrupar por quarto
      const quartoMap = new Map();
      reservas.forEach(r => {
        const quartoId = r.quarto_numero;
        const quartoNome = `${r.quarto_numero} - ${r.quarto_tipo}`;
        if (!quartoMap.has(quartoId)) {
          quartoMap.set(quartoId, {
            id: quartoId,
            nome: quartoNome,
            tipo: r.quarto_tipo,
            reservas: 0,
            receita: 0
          });
        }
        const q = quartoMap.get(quartoId);
        q.reservas++;
        q.receita += parseFloat(r.valor_total) || 0;
      });
      
      // Converter para array e ordenar
      const rankingArray = Array.from(quartoMap.values())
        .map(q => ({
          ...q,
          taxaOcupacao: Math.min(Math.round((q.reservas / 30) * 100), 100)
        }))
        .sort((a, b) => b.reservas - a.reservas)
        .slice(0, 10);
      
      const totalReservas = rankingArray.reduce((sum, q) => sum + q.reservas, 0);
      const mediaReservas = rankingArray.length > 0 ? Math.round(totalReservas / rankingArray.length) : 0;
      
      setRanking(rankingArray);
      setStats({
        totalReservas,
        mediaReservas,
        quartoTop: rankingArray[0] || null
      });
      
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRanking();
  }, [filtros]);

  const getMedalIcon = (posicao) => {
    if (posicao === 0) return <Trophy size={20} className="medal gold" />;
    if (posicao === 1) return <Medal size={20} className="medal silver" />;
    if (posicao === 2) return <Medal size={20} className="medal bronze" />;
    return <span className="position">{posicao + 1}º</span>;
  };

  const getPerformanceBadge = (taxa) => {
    if (taxa >= 70) return { text: 'Excelente', class: 'excelente' };
    if (taxa >= 50) return { text: 'Bom', class: 'bom' };
    if (taxa >= 30) return { text: 'Regular', class: 'regular' };
    return { text: 'Baixo', class: 'baixo' };
  };

  if (loading) {
    return <div className="skeletonRanking"><div className="skeletonLine"></div></div>;
  }

  return (
    <div className="rankingQuartos">
      <div className="rankingHeader">
        <h3>🏆 Top Quartos Mais Reservados</h3>
        <div className="rankingStats">
          <div className="statBadge">
            <span>Total Reservas</span>
            <strong>{stats.totalReservas}</strong>
          </div>
          <div className="statBadge">
            <span>Média por Quarto</span>
            <strong>{stats.mediaReservas}</strong>
          </div>
        </div>
      </div>

      {stats.quartoTop && (
        <div className="topQuartoCard">
          <div className="topQuartoIcon">🏆</div>
          <div className="topQuartoInfo">
            <h4>Quarto Mais Reservado</h4>
            <div className="topQuartoNome">{stats.quartoTop.nome}</div>
            <div className="topQuartoStats">
              <span>{stats.quartoTop.reservas} reservas</span>
              <span>{stats.quartoTop.taxaOcupacao}% ocupação</span>
            </div>
          </div>
        </div>
      )}

      <div className="rankingTable">
        <table>
          <thead>
            <tr>
              <th>Posição</th>
              <th>Quarto</th>
              <th>Tipo</th>
              <th>Reservas</th>
              <th>Taxa Ocupação</th>
              <th>Desempenho</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((quarto, idx) => {
              const performance = getPerformanceBadge(quarto.taxaOcupacao);
              return (
                <tr key={quarto.id} className={idx < 3 ? 'topRow' : ''}>
                  <td className="positionCell">{getMedalIcon(idx)}</td>
                  <td className="quartoCell">{quarto.nome}</td>
                  <td>{quarto.tipo}</td>
                  <td className="reservasCell">{quarto.reservas}</td>
                  <td className="ocupacaoCell">
                    <div className="progressBar">
                      <div className="progressFill" style={{ width: `${quarto.taxaOcupacao}%` }}></div>
                      <span>{quarto.taxaOcupacao}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`performanceBadge ${performance.class}`}>{performance.text}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingQuartos;