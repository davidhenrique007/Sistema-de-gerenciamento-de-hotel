// =====================================================
// HOTEL PARADISE - MÁSCARAS (COMPLEMENTAR)
// =====================================================

/**
 * Aplica máscara de telefone Moçambicano
 * @param {string} valor
 * @returns {string}
 */
export const mascaraTelefone = (valor) => {
  if (!valor) return '';
  
  // Remove caracteres não numéricos
  const numeros = valor.replace(/\D/g, '');
  
  // Verifica se é internacional (+258)
  if (numeros.length > 9) {
    // Formato: +258 84 123 4567
    if (numeros.length === 12 && numeros.startsWith('258')) {
      const codigo = numeros.substring(0, 3);
      const operadora = numeros.substring(3, 5);
      const parte1 = numeros.substring(5, 8);
      const parte2 = numeros.substring(8, 12);
      return `+${codigo} ${operadora} ${parte1} ${parte2}`;
    }
  }
  
  // Formato nacional: 84 123 4567
  if (numeros.length <= 9) {
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 5) return `${numeros.substring(0, 2)} ${numeros.substring(2)}`;
    return `${numeros.substring(0, 2)} ${numeros.substring(2, 5)} ${numeros.substring(5, 9)}`;
  }
  
  return valor;
};

/**
 * Aplica máscara de documento (BI)
 * @param {string} valor
 * @returns {string}
 */
export const mascaraDocumento = (valor) => {
  if (!valor) return '';
  
  // Remove caracteres especiais
  const limpo = valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // BI Moçambicano: AB123456C
  if (limpo.length <= 8) {
    if (limpo.length <= 2) return limpo;
    if (limpo.length <= 8) return `${limpo.substring(0, 2)}${limpo.substring(2)}`;
  }
  
  return limpo;
};

/**
 * Remove máscara de um campo (retorna apenas números)
 * @param {string} valor
 * @returns {string}
 */
export const removerMascara = (valor) => {
  return valor.replace(/\D/g, '');
};