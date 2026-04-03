import React, { memo, useRef } from 'react';
import PropTypes from 'prop-types';
import useServices from '../../hooks/useServices';
import ServiceCard from './ServiceCard';
import Spinner from '../../../../shared/components/ui/Spinner';
import Button from '../../../../shared/components/ui/Button';
import styles from './ServicesSection.module.css';

/**
 * ServicesSection Component - Seção de serviços com cards horizontais (sem filtros)
 */
const ServicesSection = ({ 
  title = 'Serviços Adicionais',
  subtitle = 'Personalize sua estadia com nossos serviços exclusivos',
  onServiceToggle,
  selectedServiceIds = [],
  className = '',
}) => {
  // ==========================================================================
  // HOOKS
  // ==========================================================================

  const carouselRef = useRef(null);

  const {
    filteredServices,
    isLoading,
    error,
  } = useServices();

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleToggle = (serviceId) => {
    if (onServiceToggle) {
      onServiceToggle(serviceId, !selectedServiceIds.includes(serviceId));
    }
  };

  // ==========================================================================
  // RENDER: LOADING
  // ==========================================================================

  if (isLoading) {
    return (
      <section className={`${styles.section} ${className}`}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <Spinner size="lg" />
            <p className={styles.loadingText}>Carregando serviços...</p>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================================================
  // RENDER: ERROR
  // ==========================================================================

  if (error) {
    return (
      <section className={`${styles.section} ${className}`}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <p className={styles.errorText}>{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================================================
  // RENDER: SUCCESS
  // ==========================================================================

  return (
    <section className={`${styles.section} ${className}`}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {/* CARROSSEL HORIZONTAL - sem filtros de categoria */}
        {filteredServices.length > 0 ? (
          <div className={styles.carouselContainer} ref={carouselRef}>
            <div className={styles.carouselTrack}>
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isSelected={selectedServiceIds.includes(service.id)}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateText}>
              Nenhum serviço disponível no momento.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

ServicesSection.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onServiceToggle: PropTypes.func,
  selectedServiceIds: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
};

ServicesSection.defaultProps = {
  title: 'Serviços Adicionais',
  subtitle: 'Personalize sua estadia com nossos serviços exclusivos',
  onServiceToggle: undefined,
  selectedServiceIds: [],
  className: '',
};

export default memo(ServicesSection);
