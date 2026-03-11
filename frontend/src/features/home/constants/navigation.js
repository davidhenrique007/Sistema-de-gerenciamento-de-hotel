/**
 * Constantes de navegação centralizadas
 * 
 * Esta estrutura permite:
 * - Escalabilidade (adicionar novos links facilmente)
 * - Manutenção centralizada
 * - Reutilização em múltiplos componentes
 * - Separação de concerns
 */

export const navigationLinks = [
  {
    id: 'home',
    label: 'Início',
    path: '/',
    exact: true,
  },
  {
    id: 'rooms',
    label: 'Quartos',
    anchor: '#rooms',
    path: '/#rooms',
    exact: false,
  },
  {
    id: 'services',
    label: 'Serviços',
    anchor: '#services',
    path: '/#services',
    exact: false,
  },
  {
    id: 'contact',
    label: 'Contato',
    anchor: '#contact',
    path: '/#contact',
    exact: false,
  },
];

export const footerLinks = {
  company: [
    { label: 'Sobre nós', path: '/about' },
    { label: 'Carreiras', path: '/careers' },
    { label: 'Blog', path: '/blog' },
    { label: 'Imprensa', path: '/press' },
  ],
  support: [
    { label: 'Central de ajuda', path: '/help' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Termos de uso', path: '/terms' },
    { label: 'Privacidade', path: '/privacy' },
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