// ============================================
// COMPONENT: Footer
// ============================================
// Responsabilidade: Rodapé reutilizável com links úteis e informações
// Acessibilidade: Estrutura semântica, ARIA labels
// ============================================

import React from 'react';
import styles from './Footer.module.css';

// ============================================
// CONSTANTES
// ============================================

const usefulLinks = [
  { id: 'about', label: 'Sobre Nós', path: '/sobre' },
  { id: 'rooms', label: 'Quartos', path: '/quartos' },
  { id: 'services', label: 'Serviços', path: '/servicos' },
  { id: 'contact', label: 'Contato', path: '/contato' },
  { id: 'privacy', label: 'Política de Privacidade', path: '/privacidade' },
  { id: 'terms', label: 'Termos de Uso', path: '/termos' }
];

const contactInfo = [
  { id: 'address', label: 'Endereço', value: 'Av. Beira Mar, 1000 - Copacabana, Rio de Janeiro - RJ', icon: '📍' },
  { id: 'phone', label: 'Telefone', value: '+55 (21) 1234-5678', icon: '📞' },
  { id: 'email', label: 'E-mail', value: 'contato@hotelparadise.com', icon: '✉️' },
  { id: 'whatsapp', label: 'WhatsApp', value: '+55 (21) 98765-4321', icon: '📱' }
];

const socialMedia = [
  { id: 'facebook', label: 'Facebook', url: 'https://facebook.com/hotelparadise', icon: '📘' },
  { id: 'instagram', label: 'Instagram', url: 'https://instagram.com/hotelparadise', icon: '📷' },
  { id: 'twitter', label: 'Twitter', url: 'https://twitter.com/hotelparadise', icon: '🐦' },
  { id: 'youtube', label: 'YouTube', url: 'https://youtube.com/hotelparadise', icon: '▶️' }
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const Footer = ({
  onNavigate,
  showNewsletter = false,
  companyName = 'Hotel Paradise',
  year = new Date().getFullYear()
}) => {
  const handleNavigation = (path) => (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    // Aqui seria integrado com um serviço de newsletter
    console.log('Newsletter signup:', email);
    alert('Obrigado por se inscrever!');
    e.target.reset();
  };

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        {/* Grid principal */}
        <div className={styles.grid}>
          {/* Coluna 1: Sobre */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Sobre o {companyName}</h3>
            <p className={styles.aboutText}>
              O Hotel Paradise oferece uma experiência única de hospedagem,
              combinando conforto, luxo e atendimento personalizado à beira-mar.
              Com quartos exclusivos e serviços de alta qualidade, garantimos
              momentos inesquecíveis para você e sua família.
            </p>
          </div>

          {/* Coluna 2: Links Úteis */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Links Úteis</h3>
            <ul className={styles.linkList}>
              {usefulLinks.map((link) => (
                <li key={link.id} className={styles.linkItem}>
                  <a
                    href={link.path}
                    onClick={handleNavigation(link.path)}
                    className={styles.link}
                    aria-label={link.label}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3: Contato */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Contato</h3>
            <ul className={styles.contactList}>
              {contactInfo.map((item) => (
                <li key={item.id} className={styles.contactItem}>
                  <span className={styles.contactIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                  <div className={styles.contactContent}>
                    <span className={styles.contactLabel}>{item.label}:</span>
                    <span className={styles.contactValue}>{item.value}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 4: Redes Sociais e Newsletter */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Redes Sociais</h3>
            <ul className={styles.socialList}>
              {socialMedia.map((social) => (
                <li key={social.id} className={styles.socialItem}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label={social.label}
                  >
                    <span className={styles.socialIcon} aria-hidden="true">
                      {social.icon}
                    </span>
                    <span className={styles.socialName}>{social.label}</span>
                  </a>
                </li>
              ))}
            </ul>

            {showNewsletter && (
              <div className={styles.newsletter}>
                <h4 className={styles.newsletterTitle}>Receba Nossas Ofertas</h4>
                <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
                  <div className={styles.newsletterInputGroup}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Seu e-mail"
                      className={styles.newsletterInput}
                      required
                      aria-label="E-mail para newsletter"
                    />
                    <button type="submit" className={styles.newsletterButton}>
                      Inscrever
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.copyright}>
          <p className={styles.copyrightText}>
            &copy; {year} {companyName}. Todos os direitos reservados.
          </p>
          <p className={styles.copyrightText}>
            Desenvolvido com ❤️ para proporcionar a melhor experiência.
          </p>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';