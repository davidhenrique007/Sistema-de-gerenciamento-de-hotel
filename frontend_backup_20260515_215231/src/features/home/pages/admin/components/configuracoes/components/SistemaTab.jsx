import React, { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { startAutoUpdate, stopAutoUpdate, getUpdateStatus, setUpdateInterval } from '@/services/admin/autoUpdateService';
import { getSystemTimezone, getAvailableTimezones } from '@/shared/utils/timezone';
import styles from './SistemaTab.module.css';

const SistemaTab = () => {
  const { t } = useI18n();
  const { currency, setCurrency, formatCurrency, availableCurrencies = [] } = useCurrency();
  const [timezone, setTimezone] = useState(getSystemTimezone());
  const [autoUpdate, setAutoUpdate] = useState(getUpdateStatus());
  const [updateInterval, setUpdateIntervalState] = useState(30);
  const [availableTimezones] = useState(getAvailableTimezones());

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
  };

  const handleTimezoneChange = (newTimezone) => {
    setTimezone(newTimezone);
    localStorage.setItem('hotel_timezone', newTimezone);
  };

  const handleAutoUpdateToggle = () => {
    if (autoUpdate) {
      stopAutoUpdate();
      setAutoUpdate(false);
    } else {
      startAutoUpdate();
      setAutoUpdate(true);
    }
  };

  const handleIntervalChange = (seconds) => {
    setUpdateIntervalState(seconds);
    setUpdateInterval(seconds);
    if (autoUpdate) {
      stopAutoUpdate();
      startAutoUpdate();
    }
  };

  const exampleValue = 1234567.89;

  if (!availableCurrencies || availableCurrencies.length === 0) {
    return <div className={styles.loading}>Carregando configurações...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {t('configuracoes.sistema', 'Sistema')}
        </h2>
        <p className={styles.description}>
          {t('configuracoes.sistema_desc', 'Configure preferências globais do sistema')}
        </p>
      </div>

      <div className={styles.settingsGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>💱</span>
            <div>
              <h3 className={styles.cardTitle}>
                {t('sistema.moeda_sistema', 'Moeda do Sistema')}
              </h3>
              <p className={styles.cardDescription}>
                {t('sistema.moeda_desc', 'Define a moeda padrão para todos os valores do sistema')}
              </p>
            </div>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.currencySelector}>
              {availableCurrencies.map((curr) => (
                <button
                  key={curr.code}
                  className={`${styles.currencyButton} ${currency === curr.code ? styles.active : ''}`}
                  onClick={() => handleCurrencyChange(curr.code)}
                >
                  <span className={styles.currencySymbol}>{curr.symbol}</span>
                  <span className={styles.currencyCode}>{curr.code}</span>
                  <span className={styles.currencyName}>{curr.name}</span>
                </button>
              ))}
            </div>
            <div className={styles.previewBox}>
              <span className={styles.previewLabel}>{t('sistema.exemplo', 'Exemplo')}:</span>
              <span className={styles.previewValue}>{formatCurrency(exampleValue)}</span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>🌍</span>
            <div>
              <h3 className={styles.cardTitle}>
                {t('sistema.timezone', 'Fuso Horário')}
              </h3>
              <p className={styles.cardDescription}>
                {t('sistema.timezone_desc', 'Define o fuso horário padrão do sistema')}
              </p>
            </div>
          </div>
          <div className={styles.cardContent}>
            <select
              value={timezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className={styles.selectInput}
            >
              {availableTimezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <div className={styles.currentTimeBox}>
              <span className={styles.currentTimeLabel}>{t('sistema.hora_atual', 'Hora atual')}:</span>
              <span className={styles.currentTimeValue}>
                {new Date().toLocaleString('pt-PT', { timeZone: timezone })}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>🔄</span>
            <div>
              <h3 className={styles.cardTitle}>
                {t('sistema.atualizacao_automatica', 'Atualização Automática')}
              </h3>
              <p className={styles.cardDescription}>
                {t('sistema.atualizacao_desc', 'Mantenha os dados sempre atualizados automaticamente')}
              </p>
            </div>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleTitle}>{t('sistema.auto_atualizar', 'Auto-atualizar')}</span>
                <span className={styles.toggleDesc}>{t('sistema.auto_atualizar_desc', 'Atualiza dados automaticamente em segundo plano')}</span>
              </div>
              <button
                className={`${styles.toggle} ${autoUpdate ? styles.toggleActive : ''}`}
                onClick={handleAutoUpdateToggle}
              >
                <span className={styles.toggleSlider}>
                  <span className={styles.toggleKnob} />
                </span>
              </button>
            </div>

            {autoUpdate && (
              <div className={styles.intervalSelector}>
                <label className={styles.intervalLabel}>{t('sistema.intervalo', 'Intervalo de atualização')}:</label>
                <select
                  value={updateInterval}
                  onChange={(e) => handleIntervalChange(Number(e.target.value))}
                  className={styles.selectInput}
                >
                  <option value={15}>15 {t('sistema.segundos', 'segundos')}</option>
                  <option value={30}>30 {t('sistema.segundos', 'segundos')}</option>
                  <option value={60}>1 {t('sistema.minuto', 'minuto')}</option>
                  <option value={300}>5 {t('sistema.minutos', 'minutos')}</option>
                  <option value={600}>10 {t('sistema.minutos', 'minutos')}</option>
                </select>
              </div>
            )}

            <div className={styles.statusBox}>
              <span className={styles.statusLabel}>{t('sistema.status', 'Status')}:</span>
              <span className={`${styles.statusValue} ${autoUpdate ? styles.statusActive : styles.statusInactive}`}>
                {autoUpdate ? t('sistema.ativo', 'Ativo') : t('sistema.inativo', 'Inativo')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SistemaTab;