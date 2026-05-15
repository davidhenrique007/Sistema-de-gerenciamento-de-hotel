// ============================================
// PROVIDERS: React Integration Providers
// ============================================
// Responsabilidade: Expor dependÃªncias via Context API e hooks
// PadrÃµes: Provider Pattern, Hook Pattern, Factory Pattern
// ============================================

// ============================================
// IMPORTAÃ‡Ã•ES
// ============================================
import React, { createContext, useContext, useMemo } from 'react';
import { getContainer } from './container.js';

// ============================================
// CONTEXTS
// ============================================

// Contexto principal do container
const ContainerContext = createContext(null);

// Contextos especÃ­ficos por domÃ­nio
const RepositoriesContext = createContext(null);
const RoomUseCasesContext = createContext(null);
const ReservationUseCasesContext = createContext(null);
const ServiceUseCasesContext = createContext(null);
const InfrastructureServicesContext = createContext(null);

// ============================================
// PROVIDER PRINCIPAL
// ============================================

/**
 * Provider principal que expÃµe todas as dependÃªncias
 * @param {Object} props - Propriedades
 * @param {React.ReactNode} props.children - Componentes filhos
 * @param {DIContainer} props.container - Container customizado (opcional)
 */
export const DIContainerProvider = ({ children, container = null }) => {
  // Usar container fornecido ou o global
  const diContainer = useMemo(() => container || getContainer(), [container]);

  // Memoizar contextos para evitar re-renders desnecessÃ¡rios
  const repositories = useMemo(() => diContainer.getRepositories(), [diContainer]);
  const roomUseCases = useMemo(() => diContainer.getRoomUseCases(), [diContainer]);
  const reservationUseCases = useMemo(() => diContainer.getReservationUseCases(), [diContainer]);
  const serviceUseCases = useMemo(() => diContainer.getServiceUseCases(), [diContainer]);
  const infrastructureServices = useMemo(() => diContainer.getInfrastructureServices(), [diContainer]);

  return (
    <ContainerContext.Provider value={diContainer}>
      <RepositoriesContext.Provider value={repositories}>
        <RoomUseCasesContext.Provider value={roomUseCases}>
          <ReservationUseCasesContext.Provider value={reservationUseCases}>
            <ServiceUseCasesContext.Provider value={serviceUseCases}>
              <InfrastructureServicesContext.Provider value={infrastructureServices}>
                {children}
              </InfrastructureServicesContext.Provider>
            </ServiceUseCasesContext.Provider>
          </ReservationUseCasesContext.Provider>
        </RoomUseCasesContext.Provider>
      </RepositoriesContext.Provider>
    </ContainerContext.Provider>
  );
};

// ============================================
// HOOKS DE ACESSO AO CONTAINER
// ============================================

/**
 * Hook para acessar o container diretamente
 * @returns {DIContainer} Container de dependÃªncias
 */
export const useContainer = () => {
  const context = useContext(ContainerContext);
  if (!context) {
    throw new Error('useContainer deve ser usado dentro de DIContainerProvider');
  }
  return context;
};

/**
 * Hook para acessar os repositÃ³rios
 * @returns {Object} RepositÃ³rios
 */
export const useRepositories = () => {
  const context = useContext(RepositoriesContext);
  if (!context) {
    throw new Error('useRepositories deve ser usado dentro de DIContainerProvider');
  }
  return context;
};

/**
 * Hook para acessar os use cases de quartos
 * @returns {Object} Use cases de quartos
 */
export const useRoomUseCases = () => {
  const context = useContext(RoomUseCasesContext);
  if (!context) {
    throw new Error('useRoomUseCases deve ser usado dentro de DIContainerProvider');
  }
  return context;
};

/**
 * Hook para acessar os use cases de reserva
 * @returns {Object} Use cases de reserva
 */
export const useReservationUseCases = () => {
  const context = useContext(ReservationUseCasesContext);
  if (!context) {
    throw new Error('useReservationUseCases deve ser usado dentro de DIContainerProvider');
  }
  return context;
};

/**
 * Hook para acessar os use cases de serviÃ§os
 * @returns {Object} Use cases de serviÃ§os
 */
export const useServiceUseCases = () => {
  const context = useContext(ServiceUseCasesContext);
  if (!context) {
    throw new Error('useServiceUseCases deve ser usado dentro de DIContainerProvider');
  }
  return context;
};

/**
 * Hook para acessar os serviÃ§os de infraestrutura
 * @returns {Object} ServiÃ§os de infraestrutura
 */
export const useInfrastructureServices = () => {
  const context = useContext(InfrastructureServicesContext);
  if (!context) {
    throw new Error('useInfrastructureServices deve ser usado dentro de DIContainerProvider');
  }
  return context;
};

// ============================================
// HOOKS ESPECÃFICOS PARA USE CASES
// ============================================

/**
 * Hook para acessar o use case de listar quartos disponÃ­veis
 * @returns {ListAvailableRoomsUseCase} Use case
 */
export const useListAvailableRooms = () => {
  const { listAvailableRooms } = useRoomUseCases();
  return listAvailableRooms;
};

/**
 * Hook para acessar o use case de detalhes do quarto
 * @returns {GetRoomDetailsUseCase} Use case
 */
export const useGetRoomDetails = () => {
  const { getRoomDetails } = useRoomUseCases();
  return getRoomDetails;
};

/**
 * Hook para acessar o use case de atualizar ocupaÃ§Ã£o
 * @returns {UpdateRoomOccupancyUseCase} Use case
 */
export const useUpdateRoomOccupancy = () => {
  const { updateRoomOccupancy } = useRoomUseCases();
  return updateRoomOccupancy;
};

/**
 * Hook para acessar o use case de validar disponibilidade
 * @returns {ValidateRoomAvailabilityUseCase} Use case
 */
export const useValidateRoomAvailability = () => {
  const { validateRoomAvailability } = useRoomUseCases();
  return validateRoomAvailability;
};

/**
 * Hook para acessar o use case de calcular preÃ§o
 * @returns {CalculatePriceUseCase} Use case
 */
export const useCalculatePrice = () => {
  const { calculatePrice } = useReservationUseCases();
  return calculatePrice;
};

/**
 * Hook para acessar o use case de validar reserva
 * @returns {ValidateReservationUseCase} Use case
 */
export const useValidateReservation = () => {
  const { validateReservation } = useReservationUseCases();
  return validateReservation;
};

/**
 * Hook para acessar o use case de listar serviÃ§os
 * @returns {ListServicesUseCase} Use case
 */
export const useListServices = () => {
  const { listServices } = useServiceUseCases();
  return listServices;
};

/**
 * Hook para acessar o use case de calcular preÃ§o de serviÃ§os
 * @returns {CalculateServicesPriceUseCase} Use case
 */
export const useCalculateServicesPrice = () => {
  const { calculateServicesPrice } = useServiceUseCases();
  return calculateServicesPrice;
};

// ============================================
// HOOKS ESPECÃFICOS PARA SERVIÃ‡OS
// ============================================

/**
 * Hook para acessar o serviÃ§o de pricing
 * @returns {DefaultPricingService} ServiÃ§o de pricing
 */
export const usePricingService = () => {
  const { pricingService } = useInfrastructureServices();
  return pricingService;
};

/**
 * Hook para acessar o serviÃ§o de disponibilidade
 * @returns {DefaultAvailabilityService} ServiÃ§o de disponibilidade
 */
export const useAvailabilityService = () => {
  const { availabilityService } = useInfrastructureServices();
  return availabilityService;
};

// ============================================
// HOOKS DE REPOSITÃ“RIOS
// ============================================

/**
 * Hook para acessar o repositÃ³rio de quartos
 * @returns {LocalStorageRoomRepository} RepositÃ³rio de quartos
 */
export const useRoomRepository = () => {
  const { roomRepository } = useRepositories();
  return roomRepository;
};

/**
 * Hook para acessar o repositÃ³rio de reservas
 * @returns {LocalStorageReservationRepository} RepositÃ³rio de reservas
 */
export const useReservationRepository = () => {
  const { reservationRepository } = useRepositories();
  return reservationRepository;
};

/**
 * Hook para acessar o repositÃ³rio de serviÃ§os
 * @returns {LocalStorageServiceRepository} RepositÃ³rio de serviÃ§os
 */
export const useServiceRepository = () => {
  const { serviceRepository } = useRepositories();
  return serviceRepository;
};

// ============================================
// HIGHER-ORDER COMPONENT PARA INJEÃ‡ÃƒO
// ============================================

/**
 * HOC para injetar dependÃªncias em um componente
 * @param {Function} mapDependenciesToProps - FunÃ§Ã£o que mapeia dependÃªncias para props
 * @returns {Function} HOC
 */
export const withDependencies = (mapDependenciesToProps) => (WrappedComponent) => {
  const WithDependencies = (props) => {
    const container = useContainer();
    const repositories = useRepositories();
    const roomUseCases = useRoomUseCases();
    const reservationUseCases = useReservationUseCases();
    const serviceUseCases = useServiceUseCases();
    const infrastructureServices = useInfrastructureServices();

    const dependencies = mapDependenciesToProps({
      container,
      repositories,
      roomUseCases,
      reservationUseCases,
      serviceUseCases,
      infrastructureServices
    });

    return <WrappedComponent {...props} {...dependencies} />;
  };

  WithDependencies.displayName = `WithDependencies(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithDependencies;
};

// ============================================
// HOOK DE TESTE - MOCK CONTAINER
// ============================================

/**
 * Hook para criar um container mock para testes
 * @param {Object} mocks - Objeto com mocks
 * @returns {Object} Contextos mockados
 */
export const useMockContainer = (mocks = {}) => {
  const mockContainer = {
    getRepositories: () => mocks.repositories || {},
    getRoomUseCases: () => mocks.roomUseCases || {},
    getReservationUseCases: () => mocks.reservationUseCases || {},
    getServiceUseCases: () => mocks.serviceUseCases || {},
    getInfrastructureServices: () => mocks.infrastructureServices || {}
  };

  return {
    ContainerContext: {
      Provider: ({ children }) => children
    },
    repositories: mocks.repositories || {},
    roomUseCases: mocks.roomUseCases || {},
    reservationUseCases: mocks.reservationUseCases || {},
    serviceUseCases: mocks.serviceUseCases || {},
    infrastructureServices: mocks.infrastructureServices || {}
  };
};
