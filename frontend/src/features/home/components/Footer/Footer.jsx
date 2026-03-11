import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './Footer.module.css';

/**
 * Footer Component - Rodapé profissional com colunas
 */
const Footer = ({ 
  companyName = 'Hotel Paradise',
  year = new Date().getFullYear(),
  className = '',
}) => {
  return (
    <footer className={`${styles.footer} ${className}`}>
      <div className={styles.container}>
        
        {/* Linha principal com 4 colunas */}
        <div className={styles.mainRow}>
          
          {/* Coluna 1: Sobre o hotel */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>{companyName}</h3>
            <p className={styles.aboutText}>
              O paraíso perfeito para suas férias dos sonhos, com conforto, 
              luxo e atendimento personalizado em um ambiente exclusivo à beira-mar.
            </p>
            <div className={styles.socialLinks}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                <span className={styles.socialIcon}>📷</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                <span className={styles.socialIcon}>📘</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Twitter">
                <span className={styles.socialIcon}>🐦</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn">
                <span className={styles.socialIcon}>🔗</span>
              </a>
            </div>
          </div>

          {/* Coluna 2: Links da empresa */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Empresa</h4>
            <ul className={styles.linkList}>
              <li><Link to="/about" className={styles.link}>Sobre nós</Link></li>
              <li><Link to="/careers" className={styles.link}>Carreiras</Link></li>
              <li><Link to="/blog" className={styles.link}>Blog</Link></li>
              <li><Link to="/press" className={styles.link}>Imprensa</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Suporte */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Suporte</h4>
            <ul className={styles.linkList}>
              <li><Link to="/help" className={styles.link}>Central de ajuda</Link></li>
              <li><Link to="/faq" className={styles.link}>FAQ</Link></li>
              <li><Link to="/terms" className={styles.link}>Termos de uso</Link></li>
              <li><Link to="/privacy" className={styles.link}>Privacidade</Link></li>
            </ul>
          </div>

          {/* Coluna 4: Contato */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Contato</h4>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon}>📞</span>
                <a href="tel:+5511999999999" className={styles.contactLink}>(11) 99999-9999</a>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon}>✉️</span>
                <a href="mailto:contato@hotelparadise.com" className={styles.contactLink}>
                  contato@hotelparadise.com
                </a>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon}>📍</span>
                <span className={styles.contactText}>Av. Beira Mar, 1000</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha de copyright */}
        <div className={styles.copyrightRow}>
          <p className={styles.copyright}>
            &copy; {year} {companyName}. Todos os direitos reservados.
          </p>
          <div className={styles.legalLinks}>
            <Link to="/privacy" className={styles.legalLink}>Política de Privacidade</Link>
            <span className={styles.separator}>/</span>
            <Link to="/terms" className={styles.legalLink}>Termos de Uso</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

Footer.propTypes = {
  companyName: PropTypes.string,
  year: PropTypes.number,
  className: PropTypes.string,
};

Footer.defaultProps = {
  companyName: 'Hotel Paradise',
  year: new Date().getFullYear(),
  className: '',
};

export default memo(Footer);