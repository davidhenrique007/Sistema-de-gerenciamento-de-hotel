import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { footerLinks } from '../../constants/navigation';
import styles from './Footer.module.css';

/**
 * Footer Component - Rodapé institucional
 * 
 * @component
 * @example
 * <Footer companyName="Hotel Paradise" />
 */
const Footer = ({ 
  companyName = 'Hotel Paradise',
  year = new Date().getFullYear(),
  className = '',
}) => {
  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <footer className={`${styles.footer} ${className}`}>
      <div className={styles.footerContainer}>
        {/* Sobre o hotel */}
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>{companyName}</h3>
          <p className={styles.footerDescription}>
            O paraíso perfeito para suas férias dos sonhos, 
            com conforto, luxo e atendimento personalizado em um ambiente
            exclusivo à beira-mar.
          </p>
          <div className={styles.socialLinks}>
            {footerLinks.social.map((social) => (
              <a
                key={social.label}
                href={social.path}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label={social.label}
              >
                <span className={styles.socialIcon}>{social.icon}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Links rápidos */}
        <div className={styles.footerSection}>
          <h4 className={styles.footerSubtitle}>Empresa</h4>
          <ul className={styles.footerLinks}>
            {footerLinks.company.map((link) => (
              <li key={link.label}>
                <Link to={link.path} className={styles.footerLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Suporte */}
        <div className={styles.footerSection}>
          <h4 className={styles.footerSubtitle}>Suporte</h4>
          <ul className={styles.footerLinks}>
            {footerLinks.support.map((link) => (
              <li key={link.label}>
                <Link to={link.path} className={styles.footerLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contato */}
        <div className={styles.footerSection}>
          <h4 className={styles.footerSubtitle}>Contato</h4>
          <ul className={styles.contactList}>
            {footerLinks.contact.map((item) => (
              <li key={item.label}>
                {item.external ? (
                  <a
                    href={item.path}
                    className={styles.contactLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className={styles.contactText}>{item.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className={styles.copyright}>
        <div className={styles.copyrightContainer}>
          <p className={styles.copyrightText}>
            &copy; {year} {companyName}. Todos os direitos reservados.
          </p>
          <div className={styles.copyrightLinks}>
            <Link to="/privacy" className={styles.copyrightLink}>
              Política de Privacidade
            </Link>
            <Link to="/terms" className={styles.copyrightLink}>
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  /** Nome da empresa */
  companyName: PropTypes.string,
  /** Ano do copyright */
  year: PropTypes.number,
  /** Classes CSS adicionais */
  className: PropTypes.string,
};

Footer.defaultProps = {
  companyName: 'Hotel Paradise',
  year: new Date().getFullYear(),
  className: '',
};

export default React.memo(Footer);