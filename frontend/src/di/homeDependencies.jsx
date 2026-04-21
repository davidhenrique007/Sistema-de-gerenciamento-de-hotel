// ============================================
// HOME DEPENDENCIES
// ============================================
// Responsabilidade: Registrar e expor dependências específicas da HomePage
// Padrões: Provider Pattern, Factory Pattern, Type Safety
// ============================================

// ============================================
// IMPORTAÇÕES
// ============================================
import React, { createContext, useContext, useMemo } from 'react';
import { getContainer } from './container.js';
import { createLogger } from '../core/utils.js';

// ============================================
// CONTEXTOS ESPECÍFICOS DA HOME
// ============================================

// Contexto principal da Home
const HomeDependenciesContext = createContext(null);

// Contextos específicos por categoria (para maior granularidade)
const HomeRoomUseCasesContext = createContext(null);
const HomeReservationUseCasesContext = createContext(null);
const HomeServiceUseCasesContext = createContext(null);
const HomeInfrastructureContext = createContext(null);

// ============================================
// LOGGER
// ============================================
const logger = createLogger('HomeProvider');

// ============================================
// TIPOS (JSDoc para documentação)
// ============================================

/**
 * @typedef {Object} HomeRoomUseCases
 * @property {ListAvailableRoomsUseCase} listAvailableRooms - Lista quartos disponíveis
 * @property {GetRoomDetailsUseCase} getRoomDetails - Busca detalhes de um quarto
 */

/**
 * @typedef {Object} HomeReservationUseCases
 * @property {CalculatePriceUseCase} calculatePrice - Calcula preço da reserva
 * @property {ValidateReservationUseCase} validateReservation - Valida reserva
 */

/**
 * @typedef {Object} HomeServiceUseCases
 * @property {ListServicesUseCase} listServices - Lista serviços disponíveis
 * @property {CalculateServicesPriceUseCase} calculateServicesPrice - Calcula preço de serviços
 */

/**
 * @typedef {Object} HomeInfrastructure
 * @property {DefaultPricingService} pricingService - Serviço de precificação
 * @property {DefaultAvailabilityService} availabilityService - Serviço de disponibilidade
 */

/**
 * @typedef {Object} HomeDependencies
 * @property {HomeRoomUseCases} room - Use cases de quartos
 * @property {HomeReservationUseCases} reservation - Use cases de reserva
 * @property {HomeServiceUseCases} service - Use cases de serviços
 * @property {HomeInfrastructure} infrastructure - Serviços de infraestrutura
 */

// ============================================
// HOME PROVIDER
// ============================================

/**
 * Provider que expõe dependências específicas da HomePage
 * @param {Object} props - Propriedades
 * @param {React.ReactNode} props.children - Componentes filhos
 * @param {Object} props.options - Opções de configuração
 * @param {boolean} props.options.enableDebug - Habilitar logs de debug
 * @param {DIContainer} props.container - Container customizado (opcional)
 */
export const HomeProvider = ({ 
  children, 
  options = { enableDebug: false },
  container = null 
}) => {
  // Obter container (fornecido ou global)
  const diContainer = useMemo(() => container || getContainer(), [container]);

  // ==========================================
  // RESOLVER DEPENDÊNCIAS
  // ==========================================

  const dependencies = useMemo(() => {
    if (options.enableDebug) {
      logger.debug('Resolvendo dependências da Home...');
    }

    // Resolver use cases de quartos
    const roomUseCases = {
      listAvailableRooms: diContainer.resolve('listAvailableRoomsUseCase'),
      getRoomDetails: diContainer.resolve('getRoomDetailsUseCase')
    };

    // Resolver use cases de reserva
    const reservationUseCases = {
      calculatePrice: diContainer.resolve('calculatePriceUseCase'),
      validateReservation: diContainer.resolve('validateReservationUseCase')
    };

    // Resolver use cases de serviços
    const serviceUseCases = {
      listServices: diContainer.resolve('listServicesUseCase'),
      calculateServicesPrice: diContainer.resolve('calculateServicesPriceUseCase')
    };

    // Resolver serviços de infraestrutura
    const infrastructure = {
      pricingService: diContainer.resolve('pricingService'),
      availabilityService: diContainer.resolve('availabilityService')
    };

    if (options.enableDebug) {
      logger.debug('Dependências resolvidas:', {
        room: Object.keys(roomUseCases),
        reservation: Object.keys(reservationUseCases),
        service: Object.keys(serviceUseCases),
        infrastructure: Object.keys(infrastructure)
      });
    }

    return {
      room: roomUseCases,
      reservation: reservationUseCases,
      service: serviceUseCases,
      infrastructure
    };
  }, [diContainer, options.enableDebug]);

  // ==========================================
  // MEMOIZAR VALORES DOS CONTEXTOS
  // ==========================================

  const roomContextValue = useMemo(() => dependencies.room, [dependencies.room]);
  const reservationContextValue = useMemo(() => dependencies.reservation, [dependencies.reservation]);
  const serviceContextValue = useMemo(() => dependencies.service, [dependencies.service]);
  const infrastructureContextValue = useMemo(() => dependencies.infrastructure, [dependencies.infrastructure]);

  return (
    <HomeDependenciesContext.Provider value={dependencies}>
      <HomeRoomUseCasesContext.Provider value={roomContextValue}>
        <HomeReservationUseCasesContext.Provider value={reservationContextValue}>
          <HomeServiceUseCasesContext.Provider value={serviceContextValue}>
            <HomeInfrastructureContext.Provider value={infrastructureContextValue}>
              {children}
            </HomeInfrastructureContext.Provider>
          </HomeServiceUseCasesContext.Provider>
        </HomeReservationUseCasesContext.Provider>
      </HomeRoomUseCasesContext.Provider>
    </HomeDependenciesContext.Provider>
  );
};

// ============================================
// HOOKS DE ACESSO ÀS DEPENDÊNCIAS DA HOME
// ============================================

/**
 * Hook para acessar todas as dependências da Home
 * @returns {HomeDependencies} Todas as dependências
 */
export const useHomeDependencies = () => {
  const context = useContext(HomeDependenciesContext);
  if (!context) {
    throw new Error('useHomeDependencies deve ser usado dentro de HomeProvider');
  }
  return context;
};

/**
 * Hook para acessar use cases de quartos da Home
 * @returns {HomeRoomUseCases} Use cases de quartos
 */
export const useHomeRoomUseCases = () => {
  const context = useContext(HomeRoomUseCasesContext);
  if (!context) {
    throw new Error('useHomeRoomUseCases deve ser usado dentro de HomeProvider');
  }
  return context;
};

/**
 * Hook para acessar use cases de reserva da Home
 * @returns {HomeReservationUseCases} Use cases de reserva
 */
export const useHomeReservationUseCases = () => {
  const context = useContext(HomeReservationUseCasesContext);
  if (!context) {
    throw new Error('useHomeReservationUseCases deve ser usado dentro de HomeProvider');
  }
  return context;
};

/**
 * Hook para acessar use cases de serviços da Home
 * @returns {HomeServiceUseCases} Use cases de serviços
 */
export const useHomeServiceUseCases = () => {
  const context = useContext(HomeServiceUseCasesContext);
  if (!context) {
    throw new Error('useHomeServiceUseCases deve ser usado dentro de HomeProvider');
  }
  return context;
};

/**
 * Hook para acessar serviços de infraestrutura da Home
 * @returns {HomeInfrastructure} Serviços de infraestrutura
 */
export const useHomeInfrastructure = () => {
  const context = useContext(HomeInfrastructureContext);
  if (!context) {
    throw new Error('useHomeInfrastructure deve ser usado dentro de HomeProvider');
  }
  return context;
};

// ============================================
// HOOKS ESPECÍFICOS PARA CADA USE CASE (CONVENIÊNCIA)
// ============================================

/**
 * Hook para acessar o use case de listar quartos disponíveis
 * @returns {ListAvailableRoomsUseCase} Use case
 */
export const useListAvailableRooms = () => {
  const { listAvailableRooms } = useHomeRoomUseCases();
  return listAvailableRooms;
};

/**
 * Hook para acessar o use case de detalhes do quarto
 * @returns {GetRoomDetailsUseCase} Use case
 */
export const useGetRoomDetails = () => {
  const { getRoomDetails } = useHomeRoomUseCases();
  return getRoomDetails;
};

/**
 * Hook para acessar o use case de calcular preço
 * @returns {CalculatePriceUseCase} Use case
 */
export const useCalculatePrice = () => {
  const { calculatePrice } = useHomeReservationUseCases();
  return calculatePrice;
};

/**
 * Hook para acessar o use case de validar reserva
 * @returns {ValidateReservationUseCase} Use case
 */
export const useValidateReservation = () => {
  const { validateReservation } = useHomeReservationUseCases();
  return validateReservation;
};

/**
 * Hook para acessar o use case de listar serviços
 * @returns {ListServicesUseCase} Use case
 */
export const useListServices = () => {
  const { listServices } = useHomeServiceUseCases();
  return listServices;
};

/**
 * Hook para acessar o use case de calcular preço de serviços
 * @returns {CalculateServicesPriceUseCase} Use case
 */
export const useCalculateServicesPrice = () => {
  const { calculateServicesPrice } = useHomeServiceUseCases();
  return calculateServicesPrice;
};

/**
 * Hook para acessar o serviço de pricing
 * @returns {DefaultPricingService} Serviço de pricing
 */
export const usePricingService = () => {
  const { pricingService } = useHomeInfrastructure();
  return pricingService;
};

/**
 * Hook para acessar o serviço de disponibilidade
 * @returns {DefaultAvailabilityService} Serviço de disponibilidade
 */
export const useAvailabilityService = () => {
  const { availabilityService } = useHomeInfrastructure();
  return availabilityService;
};

// ============================================
// HIGHER-ORDER COMPONENT PARA HOME
// ============================================

/**
 * HOC para injetar dependências da Home em um componente
 * @param {Function} mapDependenciesToProps - Função que mapeia dependências para props
 * @returns {Function} HOC
 */
export const withHomeDependencies = (mapDependenciesToProps) => (WrappedComponent) => {
  const WithHomeDependencies = (props) => {
    const dependencies = useHomeDependencies();

    const mappedProps = mapDependenciesToProps(dependencies);

    return <WrappedComponent {...props} {...mappedProps} />;
  };

  WithHomeDependencies.displayName = `WithHomeDependencies(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithHomeDependencies;
};

// ============================================
// MOCK PROVIDER PARA TESTES
// ============================================

/**
 * Provider mock para testes da Home
 * @param {Object} props - Propriedades
 * @param {React.ReactNode} props.children - Componentes filhos
 * @param {Object} props.mocks - Mocks das dependências
 */
export const MockHomeProvider = ({ children, mocks = {} }) => {
  const defaultMocks = {
    room: {
      listAvailableRooms: { execute: async () => [] },
      getRoomDetails: { execute: async () => null }
    },
    reservation: {
      calculatePrice: { execute: async () => ({ total: { amount: 0 } }) },
      validateReservation: { execute: async () => ({ isValid: true }) }
    },
    service: {
      listServices: { execute: async () => ({ categories: {} }) },
      calculateServicesPrice: { execute: async () => ({ subtotal: { amount: 0 } }) }
    },
    infrastructure: {
      pricingService: { calculateTotalPrice: () => ({ total: { amount: 0 } }) },
      availabilityService: { checkAvailability: async () => ({ isAvailable: true }) }
    }
  };

  const mergedMocks = {
    room: { ...defaultMocks.room, ...mocks.room },
    reservation: { ...defaultMocks.reservation, ...mocks.reservation },
    service: { ...defaultMocks.service, ...mocks.service },
    infrastructure: { ...defaultMocks.infrastructure, ...mocks.infrastructure }
  };

  return (
    <HomeDependenciesContext.Provider value={mergedMocks}>
      <HomeRoomUseCasesContext.Provider value={mergedMocks.room}>
        <HomeReservationUseCasesContext.Provider value={mergedMocks.reservation}>
          <HomeServiceUseCasesContext.Provider value={mergedMocks.service}>
            <HomeInfrastructureContext.Provider value={mergedMocks.infrastructure}>
              {children}
            </HomeInfrastructureContext.Provider>
          </HomeServiceUseCasesContext.Provider>
        </HomeReservationUseCasesContext.Provider>
      </HomeRoomUseCasesContext.Provider>
    </HomeDependenciesContext.Provider>
  );
};