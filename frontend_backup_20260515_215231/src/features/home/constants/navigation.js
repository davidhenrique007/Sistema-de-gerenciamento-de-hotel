/**
 * Constantes de navegação centralizadas COM SUPORTE A i18n
 * 
 * Esta estrutura permite:
 * - Escalabilidade (adicionar novos links facilmente)
 * - Manutenção centralizada
 * - Reutilização em múltiplos componentes
 * - Separação de concerns
 * - Internacionalização
 */

// Chaves de tradução para os labels
export const navigationKeys = {
  home: 'nav.home',
  rooms: 'nav.rooms',
  services: 'nav.services',
  contact: 'nav.contact',
  reservations: 'nav.reservations',
  dashboard: 'nav.dashboard',
  admin: 'nav.admin',
  profile: 'nav.profile',
  logout: 'nav.logout'
};

// Estrutura base da navegação (sem labels hardcoded)
export const navigationLinks = [
  {
    id: 'home',
    labelKey: navigationKeys.home,
    path: '/',
    exact: true,
  },
  {
    id: 'rooms',
    labelKey: navigationKeys.rooms,
    anchor: '#rooms',
    path: '/#rooms',
    exact: false,
  },
  {
    id: 'services',
    labelKey: navigationKeys.services,
    anchor: '#services',
    path: '/#services',
    exact: false,
  },
  {
    id: 'reservations',
    labelKey: navigationKeys.reservations,
    path: '/reservations',
    exact: false,
  },
];

// Links do footer com chaves de tradução
export const footerLinks = {
  company: [
    { labelKey: 'footer.about', path: '/about' },
    { labelKey: 'footer.careers', path: '/careers' },
    { labelKey: 'footer.blog', path: '/blog' },
    { labelKey: 'footer.press', path: '/press' },
  ],
  support: [
    { labelKey: 'footer.help', path: '/help' },
    { labelKey: 'footer.faq', path: '/faq' },
    { labelKey: 'footer.terms', path: '/terms' },
    { labelKey: 'footer.privacy', path: '/privacy' },
  ],
  contact: [
    { label: '(11) 99999-9999', path: 'tel:+5511999999999', external: true },
    { label: 'contato@hotelparadise.com', path: 'mailto:contato@hotelparadise.com', external: true },
    { label: 'Av. Beira Mar, 1000', path: 'https://maps.google.com', external: true },
  ],
  social: [
    { label: 'Instagram', path: 'https://instagram.com/hotelparadise', icon: 'instagram' },
    { label: 'Facebook', path: 'https://facebook.com/hotelparadise', icon: 'facebook' },
    { label: 'LinkedIn', path: 'https://linkedin.com/company/hotelparadise', icon: 'linkedin' },
  ],
};

export default navigationLinks;