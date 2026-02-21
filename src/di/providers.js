// ============================================
// PROVIDERS: React Integration Providers
// ============================================
// Responsabilidade: Expor dependências via Context API e hooks
// Padrões: Provider Pattern, Hook Pattern, Factory Pattern
// ============================================

// ============================================
// IMPORTAÇÕES
// ============================================
import React, { createContext, useContext, useMemo } from 'react';
import { getContainer } from './container.js';

// ============================================
// CONTEXTS
// ============================================

// Contexto principal do container
const ContainerContext = createContext(null);

// Contextos específicos por domínio
const RepositoriesContext = createContext(null);
const RoomUseCasesContext = createContext(null);
const ReservationUseCasesContext = createContext(null);
const ServiceUseCasesContext = createContext(null);
const InfrastructureServicesContext = createContext(null);

// ============================================
// PROVIDER PRINCIPAL
// ============================================

/**
 * Provider principal que expõe todas as dependências
 * @param {Object} props - Propriedades
 * @param {React.ReactNode} props.children - Componentes filhos
 * @param {DIContainer} props.container - Container customizado (opcional)
 */
export const DIContainerProvider = ({ children, container = null }) => {
  // Usar container fornecido ou o global
  const diContainer = useMemo(() => container || getContainer(), [container]);

  // Memoizar contextos para evitar re-renders desnecessários
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
 * @returns {DIContainer} Container de dependências
 */
export const useContainer = () => {
  const context = useContext(ContainerContext);
  if (!context) {
    throw new Error('useContainer deve ser usado dentro de DIContainerProvider');
  }
  return context;
};

/**
 * Hook para acessar os repositórios
 * @returns {Object} Repositórios
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
 * Hook para acessar os use cases de serviços
 * @returns {Object} Use cases de serviços
 */
export const useServiceUseCases = () => {
  const context = useContext(ServiceUseCasesContext);
  if (!context) {
    throw new Error('useServiceUseCases deve ser usado dentro de DIContainerProvider');
  }
  return context;
};

/**
 * Hook para acessar os serviços de infraestrutura
 * @returns {Object} Serviços de infraestrutura
 */
export const useInfrastructureServices = () => {
  const context = useContext(InfrastructureServicesContext);
  if (!context) {
    throw new Error('useInfrastructureServices deve ser usado dentro de DIContainerProvider');
  }
  return context;
};

// ============================================
// HOOKS ESPECÍFICOS PARA USE CASES
// ============================================

/**
 * Hook para acessar o use case de listar quartos disponíveis
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
 * Hook para acessar o use case de atualizar ocupação
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
 * Hook para acessar o use case de calcular preço
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
 * Hook para acessar o use case de listar serviços
 * @returns {ListServicesUseCase} Use case
 */
export const useListServices = () => {
  const { listServices } = useServiceUseCases();
  return listServices;
};

/**
 * Hook para acessar o use case de calcular preço de serviços
 * @returns {CalculateServicesPriceUseCase} Use case
 */
export const useCalculateServicesPrice = () => {
  const { calculateServicesPrice } = useServiceUseCases();
  return calculateServicesPrice;
};

// ============================================
// HOOKS ESPECÍFICOS PARA SERVIÇOS
// ============================================

/**
 * Hook para acessar o serviço de pricing
 * @returns {DefaultPricingService} Serviço de pricing
 */
export const usePricingService = () => {
  const { pricingService } = useInfrastructureServices();
  return pricingService;
};

/**
 * Hook para acessar o serviço de disponibilidade
 * @returns {DefaultAvailabilityService} Serviço de disponibilidade
 */
export const useAvailabilityService = () => {
  const { availabilityService } = useInfrastructureServices();
  return availabilityService;
};

// ============================================
// HOOKS DE REPOSITÓRIOS
// ============================================

/**
 * Hook para acessar o repositório de quartos
 * @returns {LocalStorageRoomRepository} Repositório de quartos
 */
export const useRoomRepository = () => {
  const { roomRepository } = useRepositories();
  return roomRepository;
};

/**
 * Hook para acessar o repositório de reservas
 * @returns {LocalStorageReservationRepository} Repositório de reservas
 */
export const useReservationRepository = () => {
  const { reservationRepository } = useRepositories();
  return reservationRepository;
};

/**
 * Hook para acessar o repositório de serviços
 * @returns {LocalStorageServiceRepository} Repositório de serviços
 */
export const useServiceRepository = () => {
  const { serviceRepository } = useRepositories();
  return serviceRepository;
};

// ============================================
// HIGHER-ORDER COMPONENT PARA INJEÇÃO
// ============================================

/**
 * HOC para injetar dependências em um componente
 * @param {Function} mapDependenciesToProps - Função que mapeia dependências para props
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