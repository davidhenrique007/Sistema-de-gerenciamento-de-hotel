// ============================================
// COMPONENT: Container
// ============================================
// Responsabilidade: Container responsivo reutilizável
// para estruturar páginas e seções
// ============================================

import React from 'react';
import styles from './Container.module.css';

// ============================================
// CONSTANTES
// ============================================

export const ContainerSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  XLARGE: 'xlarge',
  FULL: 'full'
};

export const ContainerSpacing = {
  NONE: 'none',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const Container = ({
  children,
  
  // Configurações de tamanho
  size = ContainerSize.LARGE,
  maxWidth,
  
  // Configurações de espaçamento
  padding = ContainerSpacing.MEDIUM,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  
  marginTop,
  marginBottom,
  
  // Comportamento
  centered = true,
  fluid = false,
  
  // Classes customizadas
  className = '',
  innerClassName = '',
  
  // Elemento HTML
  as: Component = 'div',
  
  // Props adicionais
  ...props
}) => {
  // ========================================
  // CLASSES CSS
  // ========================================
  
  const containerClasses = [
    styles.container,
    !fluid && styles[size],
    centered && styles.centered,
    styles[`padding-${padding}`],
    paddingTop && styles[`paddingTop-${paddingTop}`],
    paddingBottom && styles[`paddingBottom-${paddingBottom}`],
    paddingLeft && styles[`paddingLeft-${paddingLeft}`],
    paddingRight && styles[`paddingRight-${paddingRight}`],
    marginTop && styles[`marginTop-${marginTop}`],
    marginBottom && styles[`marginBottom-${marginBottom}`],
    className
  ].filter(Boolean).join(' ');

  const innerClasses = [
    styles.inner,
    innerClassName
  ].filter(Boolean).join(' ');

  // ========================================
  // ESTILOS INLINE (para maxWidth customizado)
  // ========================================
  
  const inlineStyles = {};
  
  if (maxWidth) {
    inlineStyles.maxWidth = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
  }

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <Component
      className={containerClasses}
      style={inlineStyles}
      {...props}
    >
      <div className={innerClasses}>
        {children}
      </div>
    </Component>
  );
};

Container.displayName = 'Container';

// ============================================
// SUBCOMPONENTES DE UTILIDADE
// ============================================

/**
 * Section - Container com semântica de seção
 */
export const Section = ({ children, ...props }) => {
  return (
    <Container as="section" {...props}>
      {children}
    </Container>
  );
};

Section.displayName = 'Section';

/**
 * Wrapper - Container semântico para agrupamento
 */
export const Wrapper = ({ children, ...props }) => {
  return (
    <Container as="div" {...props}>
      {children}
    </Container>
  );
};

Wrapper.displayName = 'Wrapper';