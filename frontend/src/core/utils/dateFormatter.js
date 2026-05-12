// =====================================================
// UTILITÁRIO GLOBAL DE FORMATAÇÃO DE DATAS
// Versão: 1.0.0 (Com suporte a i18n)
// =====================================================

/**
 * Formata uma data de acordo com o idioma atual
 * @param {string|Date} date - Data a ser formatada
 * @param {string} language - Idioma atual ('pt' ou 'en')
 * @param {object} options - Opções adicionais do Intl.DateTimeFormat
 * @returns {string} Data formatada
 */
export const formatDate = (date, language = 'pt', options = {}) => {
    if (!date) return '-';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    const locale = language === 'en' ? 'en-US' : 'pt-PT';
    
    const defaultOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    };
    
    return d.toLocaleDateString(locale, { ...defaultOptions, ...options });
};

/**
 * Formata data completa com hora
 */
export const formatDateTime = (date, language = 'pt') => {
    if (!date) return '-';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    const locale = language === 'en' ? 'en-US' : 'pt-PT';
    
    return d.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Formata apenas a hora
 */
export const formatTime = (date, language = 'pt') => {
    if (!date) return '-';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    const locale = language === 'en' ? 'en-US' : 'pt-PT';
    
    return d.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Calcula número de noites entre duas datas
 */
export const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 1;
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export default {
    formatDate,
    formatDateTime,
    formatTime,
    calculateNights
};