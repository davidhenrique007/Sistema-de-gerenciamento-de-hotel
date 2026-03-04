import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import useServices from '../../hooks/useServices';
import ServiceCard from './ServiceCard';
import Spinner from '../../../../shared/components/ui/Spinner';
import Button from '../../../../shared/components/ui/Button';
import styles from './ServicesSection.module.css';

/**
 * ServicesSection Component - Seção de serviços do hotel
 * 
 * @component
 * @example
 * <ServicesSection
 *   title="Serviços Adicionais"
 *   subtitle="Personalize sua estadia"
 *   onServiceToggle={handleServiceToggle}
 * />
 */
const ServicesSection = ({ 
  title = 'Serviços Adicionais',
  subtitle = 'Personalize sua estadia com nossos serviços exclusivos',
  onServiceToggle,
  selectedServiceIds = [],
  showFilters = true,
  className = '',
}) => {
  // ==========================================================================
  // HOOKS
  // ==========================================================================

  const {
    filteredServices,
    categories,
    selectedCategory,
    handleCategoryChange,
    isLoading,
    error,
  } = useServices();

  // ==========================================================================
  // STATE
  // ==========================================================================

  const [visibleCount, setVisibleCount] = useState(6);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleToggle = (serviceId) => {
    if (onServiceToggle) {
      onServiceToggle(serviceId, !selectedServiceIds.includes(serviceId));
    }
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
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

  const visibleServices = filteredServices.slice(0, visibleCount);
  const hasMore = filteredServices.length > visibleCount;

  return (
    <section className={`${styles.section} ${className}`}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {/* Filtros por categoria */}
        {showFilters && (
          <div className={styles.filters}>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`
                  ${styles.filterButton}
                  ${selectedCategory === category.id ? styles.active : ''}
                `}
                onClick={() => handleCategoryChange(category.id)}
                aria-pressed={selectedCategory === category.id}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}

        {/* Grid de serviços */}
        {visibleServices.length > 0 ? (
          <>
            <div className={styles.grid}>
              {visibleServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isSelected={selectedServiceIds.includes(service.id)}
                  onToggle={handleToggle}
                />
              ))}
            </div>

            {/* Botão "Ver mais" */}
            {hasMore && (
              <div className={styles.loadMore}>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleLoadMore}
                >
                  Ver mais serviços
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateText}>
              Nenhum serviço encontrado nesta categoria.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

ServicesSection.propTypes = {
  /** Título da seção */
  title: PropTypes.string,
  /** Subtítulo da seção */
  subtitle: PropTypes.string,
  /** Função chamada ao selecionar/deselecionar serviço */
  onServiceToggle: PropTypes.func,
  /** IDs dos serviços selecionados */
  selectedServiceIds: PropTypes.arrayOf(PropTypes.string),
  /** Mostrar filtros de categoria */
  showFilters: PropTypes.bool,
  /** Classes CSS adicionais */
  className: PropTypes.string,
};

ServicesSection.defaultProps = {
  title: 'Serviços Adicionais',
  subtitle: 'Personalize sua estadia com nossos serviços exclusivos',
  onServiceToggle: undefined,
  selectedServiceIds: [],
  showFilters: true,
  className: '',
};

export default memo(ServicesSection);