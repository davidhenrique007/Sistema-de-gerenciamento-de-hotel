import React, { useEffect, useState } from 'react';
import styles from './HotelSplash.module.css';

const HotelSplash = () => {
  const [show, setShow] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setShow(false), 800);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className={`${styles.splash} ${!isVisible ? styles.fadeOut : ''}`}>
      <div className={styles.container}>
        
        {/* Ícone animado */}
        <div className={styles.iconWrapper}>
          <svg className={styles.icon} viewBox="0 0 100 100">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            
            {/* Círculo externo pulsante */}
            <circle cx="50" cy="50" r="45" className={styles.outerCircle} />
            
            {/* Telhado do hotel */}
            <polygon points="30,40 50,20 70,40" fill="url(#grad)" className={styles.roof} />
            
            {/* Corpo do hotel */}
            <rect x="35" y="40" width="30" height="35" fill="white" className={styles.body} />
            
            {/* Porta */}
            <rect x="45" y="60" width="10" height="15" fill="#92400e" className={styles.door} />
            
            {/* Janelas */}
            <circle cx="40" cy="50" r="3" fill="#2563eb" className={styles.window} />
            <circle cx="60" cy="50" r="3" fill="#2563eb" className={styles.window} />
            
            {/* Estrelas decorativas */}
            <circle cx="20" cy="20" r="2" fill="white" className={styles.star} />
            <circle cx="80" cy="30" r="2" fill="white" className={styles.star} />
            <circle cx="70" cy="80" r="2" fill="white" className={styles.star} />
          </svg>
        </div>

        {/* Título com gradiente */}
        <h1 className={styles.title}>
          <span className={styles.titleWord}>Hotel</span>
          <span className={styles.titleWord}>Paradise</span>
        </h1>

        {/* Mensagem de boas-vindas animada */}
        <div className={styles.messageContainer}>
          <p className={styles.message}>
            Bem-vindo ao Hotel Paradise, o destino ideal para quem procura
            conforto, tranquilidade e momentos inesquecíveis.
          </p>

          <p className={styles.message}>
            O lugar perfeito para relaxar e criar memórias especiais com a família,
            amigos ou em viagens de trabalho.
          </p>
        </div>

        {/* Barra de progresso elegante */}
        <div className={styles.progressWrapper}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
          <span className={styles.progressText}>Preparando sua experiência...</span>
        </div>

      </div>
    </div>
  );
};

export default HotelSplash;