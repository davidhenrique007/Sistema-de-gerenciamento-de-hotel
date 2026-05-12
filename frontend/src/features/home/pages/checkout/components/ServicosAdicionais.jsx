import React, { useState, useEffect } from 'react';
import styles from '../styles/Checkout.module.css';

const getServicosDisponiveis = (t) => [
  {
    id: 'cafe_manha',
    nome: t('services.breakfast'),
    descricao: t('services.breakfast_desc'),
    preco: 300,
    tipo: 'por_noite',
    icone: '🍳'
  },
  {
    id: 'spa',
    nome: t('services.spa'),
    descricao: t('services.spa_desc'),
    preco: 2000,
    tipo: 'por_noite',
    icone: '💆'
  },
  {
    id: 'piscina',
    nome: t('services.pool'),
    descricao: t('services.pool_desc'),
    preco: 1000,
    tipo: 'por_noite',
    icone: '🏊'
  },
  {
    id: 'academia',
    nome: t('services.gym'),
    descricao: t('services.gym_desc'),
    preco: 1500,
    tipo: 'por_noite',
    icone: '💪'
  },
  {
    id: 'translado',
    nome: t('services.airport_shuttle'),
    descricao: t('services.airport_shuttle_desc'),
    preco: 1000,
    tipo: 'unico',
    icone: '🚗'
  },
  {
    id: 'wifi_premium',
    nome: t('services.wifi_premium'),
    descricao: t('services.wifi_premium_desc'),
    preco: 500,
    tipo: 'por_noite',
    icone: '📶'
  }
];

const ServicosAdicionais = ({ nights, servicosSelecionados, onServicosChange, t }) => {
  const [servicosTemp, setServicosTemp] = useState([]);
  const servicosDisponiveis = getServicosDisponiveis(t);

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
      <div className={styles.servicosHeader}>
        <h3 className={styles.servicosTitle}>
          ✨ {t('checkout.additional_services')}
        </h3>
        <p className={styles.servicosSubtitle}>
          {t('checkout.personalize_your_stay')}
        </p>
      </div>

      <div className={styles.servicosGrid}>
        {servicosDisponiveis.map(servico => {
          const precoExibido = servico.tipo === 'por_noite' 
            ? `${formatCurrency(servico.preco)} ${t('services.per_night')}`
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
                      {t('common.total')}: {formatCurrency(precoTotal)}
                    </span>
                  )}
                </div>
              </div>
              <button
                className={`${styles.servicoButton} ${isSelecionado(servico.id) ? styles.buttonRemover : styles.buttonAdicionar}`}
                onClick={() => handleToggleServico(servico)}
              >
                {isSelecionado(servico.id) ? t('common.remove') : t('common.add')}
              </button>
            </div>
          );
        })}
      </div>

      {servicosTemp.length > 0 && (
        <div className={styles.servicosResumo}>
          <div className={styles.resumoHeader}>
            <span>📋 {t('services.selected_services')} ({servicosTemp.length})</span>
            <span className={styles.resumoTotal}>{t('services.total_services')}: {formatCurrency(totalServicos)}</span>
          </div>
          <div className={styles.resumoLista}>
            {servicosTemp.map(servico => (
              <div key={servico.id} className={styles.resumoItem}>
                <span>{servico.icone} {servico.nome}</span>
                <span>
                  {servico.tipo === 'por_noite' 
                    ? `${formatCurrency(servico.preco)} x ${nights} ${t('reservation.nights')}`
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