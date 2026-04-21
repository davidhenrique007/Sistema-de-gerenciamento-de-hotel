import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../shared/components/ui/Button';
import { formatCurrency } from '../../../../shared/utils/dateUtils';
import styles from './ServiceCard.module.css';

/**
 * ServiceCard Component - Card de serviço do hotel
 * 
 * @component
 * @example
 * <ServiceCard
 *   service={service}
 *   isSelected={false}
 *   onToggle={handleToggle}
 * />
 */
const ServiceCard = ({ 
  service, 
  isSelected = false, 
  onToggle,
  showPrice = true,
  className = '',
}) => {
  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleClick = () => {
    if (onToggle) {
      onToggle(service.id);
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div 
      className={`
        ${styles.card}
        ${styles[service.category]}
        ${isSelected ? styles.selected : ''}
        ${className}
      `}
    >
      <div className={styles.iconContainer}>
        <span className={styles.icon}>{service.icon}</span>
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{service.name}</h3>
        <p className={styles.description}>{service.description}</p>

        {service.highlights && (
          <ul className={styles.highlights}>
            {service.highlights.slice(0, 3).map((highlight, index) => (
              <li key={index} className={styles.highlight}>
                ✓ {highlight}
              </li>
            ))}
          </ul>
        )}

        {service.duration && (
          <p className={styles.duration}>Duração: {service.duration}</p>
        )}
      </div>

      {showPrice && (
        <div className={styles.footer}>
          <div className={styles.price}>
            <span className={styles.priceValue}>
              {formatCurrency(service.price)}
            </span>
            <span className={styles.pricePeriod}>
              /{service.type === 'daily' ? 'noite' : 'estadia'}
            </span>
          </div>

          <Button
            variant={isSelected ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleClick}
            aria-label={isSelected 
              ? `Remover ${service.name} da reserva` 
              : `Adicionar ${service.name} à reserva`
            }
          >
            {isSelected ? 'Remover' : 'Adicionar'}
          </Button>
        </div>
      )}
    </div>
  );
};

ServiceCard.propTypes = {
  /** Dados do serviço */
  service: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    type: PropTypes.string,
    duration: PropTypes.string,
    highlights: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  /** Indica se o serviço está selecionado */
  isSelected: PropTypes.bool,
  /** Função chamada ao selecionar/deselecionar */
  onToggle: PropTypes.func,
  /** Mostrar preço e botão de seleção */
  showPrice: PropTypes.bool,
  /** Classes CSS adicionais */
  className: PropTypes.string,
};

ServiceCard.defaultProps = {
  isSelected: false,
  onToggle: undefined,
  showPrice: true,
  className: '',
};

export default memo(ServiceCard);