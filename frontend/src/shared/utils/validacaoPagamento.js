// =====================================================
// HOTEL PARADISE - VALIDAÇÃO DE PAGAMENTO
// =====================================================

/**
 * Valida nome completo
 * @param {string} nome
 * @returns {object} { isValid, message }
 */
export const validarNome = (nome) => {
  if (!nome || nome.trim() === '') {
    return { isValid: false, message: 'Nome é obrigatório' };
  }
  if (nome.trim().length < 3) {
    return { isValid: false, message: 'Nome deve ter pelo menos 3 caracteres' };
  }
  if (nome.trim().split(' ').length < 2) {
    return { isValid: false, message: 'Informe nome completo' };
  }
  return { isValid: true, message: '' };
};

/**
 * Valida telefone Moçambicano
 * @param {string} telefone
 * @returns {object} { isValid, message }
 */
export const validarTelefone = (telefone) => {
  if (!telefone || telefone.trim() === '') {
    return { isValid: false, message: 'Telefone é obrigatório' };
  }
  
  const numeros = telefone.replace(/\D/g, '');
  
  if (numeros.length === 9 && numeros[0] === '8' && ['4', '5', '6', '7'].includes(numeros[1])) {
    return { isValid: true, message: '' };
  }
  
  if (numeros.length === 12 && numeros.startsWith('258') && 
      numeros[3] === '8' && ['4', '5', '6', '7'].includes(numeros[4])) {
    return { isValid: true, message: '' };
  }
  
  return { isValid: false, message: 'Telefone inválido (ex: 84 123 4567)' };
};

/**
 * Valida documento (opcional)
 * @param {string} documento
 * @returns {object} { isValid, message }
 */
export const validarDocumento = (documento) => {
  if (!documento || documento.trim() === '') {
    return { isValid: true, message: '' };
  }
  
  const doc = documento.replace(/[\s-]/g, '');
  
  if (doc.length >= 6 && doc.length <= 20 && /^[A-Z0-9]+$/i.test(doc)) {
    return { isValid: true, message: '' };
  }
  
  return { isValid: false, message: 'Documento inválido (mínimo 6 caracteres)' };
};

/**
 * Valida número de cartão
 * @param {string} numero
 * @returns {object} { isValid, message }
 */
export const validarNumeroCartao = (numero) => {
  const numeros = numero.replace(/\D/g, '');
  
  if (numeros.length === 16) {
    return { isValid: true, message: '' };
  }
  
  return { isValid: false, message: 'Número de cartão inválido (16 dígitos)' };
};

/**
 * Valida data de validade
 * @param {string} validade
 * @returns {object} { isValid, message }
 */
export const validarValidadeCartao = (validade) => {
  if (!validade || validade.length !== 5) {
    return { isValid: false, message: 'Data inválida (MM/AA)' };
  }
  
  const [mes, ano] = validade.split('/');
  const mesNum = parseInt(mes, 10);
  const anoNum = parseInt(ano, 10);
  const dataAtual = new Date();
  const anoAtual = dataAtual.getFullYear() % 100;
  const mesAtual = dataAtual.getMonth() + 1;
  
  if (mesNum < 1 || mesNum > 12) {
    return { isValid: false, message: 'Mês inválido' };
  }
  
  if (anoNum < anoAtual || (anoNum === anoAtual && mesNum < mesAtual)) {
    return { isValid: false, message: 'Cartão expirado' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida CVV
 * @param {string} cvv
 * @returns {object} { isValid, message }
 */
export const validarCvv = (cvv) => {
  const numeros = cvv.replace(/\D/g, '');
  
  if (numeros.length === 3 || numeros.length === 4) {
    return { isValid: true, message: '' };
  }
  
  return { isValid: false, message: 'CVV inválido (3 ou 4 dígitos)' };
};

/**
 * Valida telefone para pagamento móvel
 * @param {string} telefone
 * @returns {object} { isValid, message }
 */
export const validarTelefonePagamento = (telefone) => {
  const numeros = telefone.replace(/\D/g, '');
  
  if (numeros.length === 9 && numeros[0] === '8') {
    return { isValid: true, message: '' };
  }
  
  return { isValid: false, message: 'Número inválido (9 dígitos começando com 8)' };
};