import React, { useState, useEffect } from 'react';
import styles from '../styles/Checkout.module.css';

const servicosDisponiveis = [
  {
    id: 'cafe_manha',
    nome: 'Café da manhã',
    descricao: 'Café da manhã completo com opções regionais',
    preco: 300,
    tipo: 'por_noite',
    icone: '🍳'
  },
  {
    id: 'spa',
    nome: 'Spa & Bem-estar',
    descricao: 'Sessão de massagem relaxante',
    preco: 2000,
    tipo: 'por_noite',
    icone: '💆'
  },
  {
    id: 'piscina',
    nome: 'Piscina aquecida',
    descricao: 'Acesso à piscina aquecida',
    preco: 1000,
    tipo: 'por_noite',
    icone: '🏊'
  },
  {
    id: 'academia',
    nome: 'Academia moderna',
    descricao: 'Equipamentos modernos e acompanhamento',
    preco: 1500,
    tipo: 'por_noite',
    icone: '💪'
  },
  {
    id: 'translado',
    nome: 'Translado aeroporto',
    descricao: 'Ida e volta ao aeroporto',
    preco: 1000,
    tipo: 'unico',
    icone: '🚗'
  },
  {
    id: 'wifi_premium',
    nome: 'Wi-Fi Premium',
    descricao: 'Internet de alta velocidade',
    preco: 500,
    tipo: 'por_noite',
    icone: '📶'
  }
];

const ServicosAdicionais = ({ nights, servicosSelecionados, onServicosChange }) => {
  const [servicosTemp, setServicosTemp] = useState([]);

  useEffect(() => {
    setServicosTemp(servicosSelecionados || []);
  }, [servicosSelecionados]);

  const handleToggleServico = (servico) => {
    const novosServicos = servicosTemp.some(s => s.id === servico.id)
      ? servicosTemp.filter(s => s.id !== servico.id)
      : [...servicosTemp, servico];
    
    setServicosTemp(novosServicos);
    onServicosChange(novosServicos);
  };

  const isSelecionado = (servicoId) => {
    return servicosTemp.some(s => s.id === servicoId);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(value);
  };

  const totalServicos = servicosTemp.reduce((total, servico) => {
    const preco = servico.tipo === 'por_noite' 
      ? servico.preco * nights 
      : servico.preco;
    return total + preco;
  }, 0);

  return (
    <div className={styles.servicosContainer}>
      {/* Cabeçalho simplificado - apenas título e subtítulo */}
      <div className={styles.servicosHeader}>
        <h3 className={styles.servicosTitle}>
          ✨ Serviços Adicionais
        </h3>
        <p className={styles.servicosSubtitle}>
          Personalize sua estadia com serviços exclusivos
        </p>
      </div>

      {/* Grid de Serviços - sem filtros de categoria */}
      <div className={styles.servicosGrid}>
        {servicosDisponiveis.map(servico => {
          const precoExibido = servico.tipo === 'por_noite' 
            ? `${formatCurrency(servico.preco)} / noite`
            : formatCurrency(servico.preco);
          
          const precoTotal = servico.tipo === 'por_noite' 
            ? servico.preco * nights
            : servico.preco;

          return (
            <div 
              key={servico.id} 
              className={`${styles.servicoCard} ${isSelecionado(servico.id) ? styles.servicoSelecionado : ''}`}
            >
              <div className={styles.servicoIcon}>{servico.icone}</div>
              <div className={styles.servicoInfo}>
                <h4 className={styles.servicoNome}>{servico.nome}</h4>
                <p className={styles.servicoDescricao}>{servico.descricao}</p>
                <div className={styles.servicoPreco}>
                  <span className={styles.precoPorNoite}>{precoExibido}</span>
                  {isSelecionado(servico.id) && (
                    <span className={styles.precoTotal}>
                      Total: {formatCurrency(precoTotal)}
                    </span>
                  )}
                </div>
              </div>
              <button
                className={`${styles.servicoButton} ${isSelecionado(servico.id) ? styles.buttonRemover : styles.buttonAdicionar}`}
                onClick={() => handleToggleServico(servico)}
              >
                {isSelecionado(servico.id) ? 'Remover' : 'Adicionar'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Resumo dos Serviços Selecionados */}
      {servicosTemp.length > 0 && (
        <div className={styles.servicosResumo}>
          <div className={styles.resumoHeader}>
            <span>📋 Serviços selecionados ({servicosTemp.length})</span>
            <span className={styles.resumoTotal}>Total: {formatCurrency(totalServicos)}</span>
          </div>
          <div className={styles.resumoLista}>
            {servicosTemp.map(servico => (
              <div key={servico.id} className={styles.resumoItem}>
                <span>{servico.icone} {servico.nome}</span>
                <span>
                  {servico.tipo === 'por_noite' 
                    ? `${formatCurrency(servico.preco)} x ${nights} noites`
                    : formatCurrency(servico.preco)}
                  = {formatCurrency(servico.tipo === 'por_noite' ? servico.preco * nights : servico.preco)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicosAdicionais;
