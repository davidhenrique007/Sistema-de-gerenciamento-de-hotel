// ============================================
// HOOK: useReservationValidation
// ============================================
// Responsabilidade: Validações estruturais da reserva
// VERSÃO CORRIGIDA E OTIMIZADA - SEM LOOP INFINITO
// ============================================

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'; // <-- useRef ADICIONADO

// ============================================
// CONSTANTES
// ============================================

const MIN_NIGHTS = 1;
const MAX_NIGHTS = 30;
const MIN_GUESTS = 1;
const MAX_ADVANCE_DAYS = 365;

// ============================================
// HOOK PRINCIPAL
// ============================================

export const useReservationValidation = ({
    // Dados da reserva
    room,
    checkIn,
    checkOut,
    guests,
    selectedServices = [],

    // Configurações
    validateAvailability = true,
    validateCapacity = true,
    validateDates = true,
    validateServices = true,

    // Dependências externas
    checkAvailability,

    // Opções
    minNights = MIN_NIGHTS,
    maxNights = MAX_NIGHTS,
    maxAdvanceDays = MAX_ADVANCE_DAYS,

    // Callbacks
    onValidationChange
} = {}) => {
    // ========================================
    // ESTADOS
    // ========================================

    const [availabilityResult, setAvailabilityResult] = useState(null);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState(null);

    // ========================================
    // REFS PARA EVITAR LOOPS (SOLUÇÃO PROFISSIONAL)
    // ========================================
    const roomIdRef = useRef(room?.id);
    const checkInRef = useRef(checkIn);
    const checkOutRef = useRef(checkOut);
    const guestsRef = useRef(guests);

    // Atualizar refs quando os valores mudarem (sem causar re-render)
    useEffect(() => {
        roomIdRef.current = room?.id;
        checkInRef.current = checkIn;
        checkOutRef.current = checkOut;
        guestsRef.current = guests;
    }, [room?.id, checkIn, checkOut, guests]);

    // ========================================
    // VALIDAÇÕES ESTRUTURAIS (usam useMemo, estão corretas)
    // ========================================
    const roomValidation = useMemo(() => {
        if (!validateDates) return { isValid: true };
        if (!room) {
            return {
                isValid: false,
                code: 'ROOM_REQUIRED',
                message: 'Selecione um quarto para continuar'
            };
        }
        return { isValid: true };
    }, [room, validateDates]);

    const datesValidation = useMemo(() => {
        if (!validateDates) return { isValid: true };

        if (!checkIn) {
            return {
                isValid: false,
                code: 'CHECKIN_REQUIRED',
                message: 'Selecione a data de check-in'
            };
        }
        if (!checkOut) {
            return {
                isValid: false,
                code: 'CHECKOUT_REQUIRED',
                message: 'Selecione a data de check-out'
            };
        }

        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
            return {
                isValid: false,
                code: 'PAST_DATE',
                message: 'A data de check-in não pode ser no passado'
            };
        }
        if (end <= start) {
            return {
                isValid: false,
                code: 'INVALID_ORDER',
                message: 'A data de check-out deve ser após o check-in'
            };
        }

        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + maxAdvanceDays);

        if (start > maxDate) {
            return {
                isValid: false,
                code: 'TOO_FAR_IN_ADVANCE',
                message: `Máximo de ${maxAdvanceDays} dias de antecedência`
            };
        }

        return { isValid: true };
    }, [checkIn, checkOut, validateDates, maxAdvanceDays]);

    const nightsValidation = useMemo(() => {
        if (!checkIn || !checkOut) return { isValid: true };
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end - start);
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (nights < minNights) {
            return {
                isValid: false,
                code: 'MIN_NIGHTS',
                message: `Mínimo de ${minNights} ${minNights === 1 ? 'noite' : 'noites'}`
            };
        }
        if (nights > maxNights) {
            return {
                isValid: false,
                code: 'MAX_NIGHTS',
                message: `Máximo de ${maxNights} noites`
            };
        }
        return { isValid: true };
    }, [checkIn, checkOut, minNights, maxNights]);

    const capacityValidation = useMemo(() => {
        if (!validateCapacity) return { isValid: true };
        if (!guests || guests < MIN_GUESTS) {
            return {
                isValid: false,
                code: 'INVALID_GUESTS',
                message: 'Número de hóspedes inválido'
            };
        }
        if (room && guests > room.capacity) {
            return {
                isValid: false,
                code: 'CAPACITY_EXCEEDED',
                message: `Este quarto comporta no máximo ${room.capacity} ${room.capacity === 1 ? 'hóspede' : 'hóspedes'}`
            };
        }
        return { isValid: true };
    }, [room, guests, validateCapacity]);

    const servicesValidation = useMemo(() => {
        if (!validateServices) return { isValid: true };
        return { isValid: true };
    }, [selectedServices, validateServices]);

    // ========================================
    // VALIDAÇÃO DE DISPONIBILIDADE - CORRIGIDA (USA REFS)
    // ========================================

    const checkRoomAvailability = useCallback(async () => {
        // Usar os valores das refs para não depender de props que mudam
        const currentRoomId = roomIdRef.current;
        const currentCheckIn = checkInRef.current;
        const currentCheckOut = checkOutRef.current;
        const currentGuests = guestsRef.current;

        if (!checkAvailability || !currentRoomId || !currentCheckIn || !currentCheckOut || !currentGuests) {
            return null;
        }

        setIsCheckingAvailability(true);
        setAvailabilityError(null);

        try {
            const result = await checkAvailability({
                roomId: currentRoomId,
                checkIn: currentCheckIn,
                checkOut: currentCheckOut,
                guests: currentGuests
            });

            setAvailabilityResult(result);
            return result;
        } catch (error) {
            setAvailabilityError({
                code: error.code || 'AVAILABILITY_CHECK_FAILED',
                message: error.message || 'Erro ao verificar disponibilidade'
            });
            return null;
        } finally {
            setIsCheckingAvailability(false);
        }
        // Dependência ÚNICA: checkAvailability (que é estável)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkAvailability]);

    // Efeito para verificar disponibilidade (usa refs, não a função diretamente)
    useEffect(() => {
        if (validateAvailability && room?.id && checkIn && checkOut && guests) {
            // Pequeno timeout para evitar loops em StrictMode
            const timer = setTimeout(() => {
                checkRoomAvailability();
            }, 50);
            return () => clearTimeout(timer);
        } else {
            setAvailabilityResult(null);
        }
        // Dependências são os valores primitivos, NÃO a função checkRoomAvailability
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room?.id, checkIn, checkOut, guests, validateAvailability]);

    // ========================================
    // ESTADO CONSOLIDADO DE VALIDAÇÃO
    // ========================================

    const allValidations = useMemo(() => ({
        room: roomValidation,
        dates: datesValidation,
        nights: nightsValidation,
        capacity: capacityValidation,
        services: servicesValidation,
        availability: availabilityResult ? {
            isValid: availabilityResult.isAvailable,
            code: availabilityResult.isAvailable ? null : 'UNAVAILABLE',
            message: availabilityResult.reason || 'Quarto não disponível para o período'
        } : null
    }), [roomValidation, datesValidation, nightsValidation, capacityValidation, servicesValidation, availabilityResult]);

    const validationErrors = useMemo(() => {
        const errors = {};
        Object.entries(allValidations).forEach(([key, validation]) => {
            if (validation && !validation.isValid) {
                errors[key] = {
                    code: validation.code,
                    message: validation.message
                };
            }
        });
        return errors;
    }, [allValidations]);

    const isValid = useMemo(() => {
        return Object.values(allValidations).every(v => !v || v.isValid);
    }, [allValidations]);

    // Notificar mudanças na validação
    useEffect(() => {
        if (onValidationChange) {
            onValidationChange({
                isValid,
                errors: validationErrors,
                validations: allValidations
            });
        }
    }, [isValid, validationErrors, allValidations, onValidationChange]);

    // ========================================
    // FUNÇÕES DE VALIDAÇÃO MANUAL
    // ========================================

    const validateReservation = useCallback(() => {
        return {
            isValid,
            errors: validationErrors,
            validations: allValidations
        };
    }, [isValid, validationErrors, allValidations]);

    const validateField = useCallback((field) => {
        const validation = allValidations[field];
        return {
            isValid: validation?.isValid ?? true,
            error: validation?.isValid ? null : {
                code: validation.code,
                message: validation.message
            }
        };
    }, [allValidations]);

    // ========================================
    // RETORNO
    // ========================================

    return {
        isValid,
        validationErrors,
        allValidations,
        availability: availabilityResult,
        isCheckingAvailability,
        availabilityError,
        validateReservation,
        validateField,
        checkRoomAvailability,
        hasErrors: Object.keys(validationErrors).length > 0,
        isReady: isValid && (!validateAvailability || (availabilityResult?.isAvailable === true))
    };
};