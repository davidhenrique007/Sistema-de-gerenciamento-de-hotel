import React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatDateOnly } from '@/shared/utils/timezone';
import { useI18n } from '@/contexts/I18nContext';
import styles from '../styles/Checkout.module.css';

const ResumoReserva = ({ 
  tipoQuarto, 
  checkIn, 
  checkOut, 
  nights, 
  pricePerNight, 
  quantidadeQuartos = 1,
  servicosAdicionais = [],
  taxaImposto = 0.05,
  t: translate 
}) => {
  const { t, language } = useI18n();
  const { formatCurrency, currency } = useCurrency();
  
  const getTranslation = (key, defaultValue) => {
    const result = t(key);
    return typeof result === 'string' ? result : defaultValue;
  };

  const subtotalQuartos = (pricePerNight || 0) * (nights || 1) * quantidadeQuartos;
  const subtotalServicos = servicosAdicionais.reduce((total, servico) => {
    const preco = servico.tipo === 'por_noite' ? (servico.preco || 0) * (nights || 1) : (servico.preco || 0);
    return total + preco;
  }, 0);
  const subtotal = subtotalQuartos + subtotalServicos;
  const taxas = subtotal * (taxaImposto || 0);
  const total = subtotal + taxas;

  const getLocaleDate = (date) => {
    if (!date) return '-';
    return formatDateOnly(date, null, language === 'en' ? 'en-US' : 'pt-PT');
  };

  return (
    <div className={styles.resumoCard}>
      <div className={styles.resumoHeader}>
        <h3 className={styles.resumoTitle}>📋 {getTranslation('checkout.reservation_summary')}</h3>
      </div>
      
      <div className={styles.resumoContent}>
        <div className={styles.resumoLinha}>
          <span className={styles.resumoIcon}>🏨</span>
          <div className={styles.resumoInfo}>
            <span className={styles.resumoLabel}>{getTranslation('resumo.room_label')}</span>
            <span className={styles.resumoValor}>{tipoQuarto || 'Standard'}</span>
          </div>
        </div>

        <div className={styles.resumoLinha}>
          <span className={styles.resumoIcon}>📅</span>
          <div className={styles.resumoInfo}>
            <span className={styles.resumoLabel}>{getTranslation('resumo.checkin_label')}</span>
            <span className={styles.resumoValor}>{getLocaleDate(checkIn)}</span>
          </div>
        </div>

        <div className={styles.resumoLinha}>
          <span className={styles.resumoIcon}>📅</span>
          <div className={styles.resumoInfo}>
            <span className={styles.resumoLabel}>{getTranslation('resumo.checkout_label')}</span>
            <span className={styles.resumoValor}>{getLocaleDate(checkOut)}</span>
          </div>
        </div>

        <div className={styles.resumoLinha}>
          <span className={styles.resumoIcon}>🌙</span>
          <div className={styles.resumoInfo}>
            <span className={styles.resumoLabel}>{getTranslation('resumo.nights_label')}</span>
            <span className={styles.resumoValor}>{nights || 1}</span>
          </div>
        </div>

        <div className={styles.resumoLinha}>
          <span className={styles.resumoIcon}>🛏️</span>
          <div className={styles.resumoInfo}>
            <span className={styles.resumoLabel}>{getTranslation('resumo.rooms_label')}</span>
            <span className={styles.resumoValor}>{quantidadeQuartos}</span>
          </div>
        </div>

        <div className={styles.resumoLinha}>
          <span className={styles.resumoIcon}>💰</span>
          <div className={styles.resumoInfo}>
            <span className={styles.resumoLabel}>{getTranslation('resumo.price_per_night')}</span>
            <span className={styles.resumoValor}>{formatCurrency(pricePerNight)}</span>
          </div>
        </div>

        <div className={styles.resumoDivisor}></div>

        <div className={styles.resumoLinhaTotal}>
          <span className={styles.resumoIcon}>🏷️</span>
          <div className={styles.resumoInfo}>
            <span className={styles.resumoLabel}>{getTranslation('resumo.subtotal_rooms')}</span>
            <span className={styles.resumoValor}>{formatCurrency(subtotalQuartos)}</span>
          </div>
        </div>

        {servicosAdicionais.length > 0 && (
          <div className={styles.resumoLinhaServico}>
            <span className={styles.resumoIcon}>✨</span>
            <div className={styles.resumoInfo}>
              <span className={styles.resumoLabel}>{getTranslation('resumo.services')}</span>
              <span className={styles.resumoValor}>{formatCurrency(subtotalServicos)}</span>
            </div>
          </div>
        )}

        <div className={styles.resumoLinhaGrandeTotal}>
          <span className={styles.resumoIcon}>🎯</span>
          <div className={styles.resumoInfo}>
            <span className={styles.resumoLabelTotal}>{getTranslation('resumo.total')}</span>
            <span className={styles.resumoValorTotal}>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumoReserva;
