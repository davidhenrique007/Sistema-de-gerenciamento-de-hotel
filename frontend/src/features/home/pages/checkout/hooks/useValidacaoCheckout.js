// =====================================================
// HOOK - VALIDAÃ‡ÃƒO DO CHECKOUT
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import {
  validarNome,
  validarTelefone,
  validarDocumento,
  validarNumeroCartao,
  validarValidadeCartao,
  validarCvv,
  validarTelefonePagamento
} from '../../../../../shared/utils/validacaoPagamento';

export const useValidacaoCheckout = (guestData, paymentMethod, paymentDetails) => {
  const [errors, setErrors] = useState({
    nome: null,
    telefone: null,
    documento: null,
    payment: null
  });
  
  const [isFormValid, setIsFormValid] = useState(false);

  // Validar dados pessoais
  const validarDadosPessoais = useCallback(() => {
    const nomeValid = validarNome(guestData.nome);
    const telefoneValid = validarTelefone(guestData.telefone);
    const documentoValid = validarDocumento(guestData.documento);
    
    setErrors(prev => ({
      ...prev,
      nome: nomeValid.isValid ? null : nomeValid.message,
      telefone: telefoneValid.isValid ? null : telefoneValid.message,
      documento: documentoValid.isValid ? null : documentoValid.message
    }));
    
    return nomeValid.isValid && telefoneValid.isValid && documentoValid.isValid;
  }, [guestData.nome, guestData.telefone, guestData.documento]);

  // Validar mÃ©todo de pagamento
  const validarPagamento = useCallback(() => {
    if (!paymentMethod) {
      setErrors(prev => ({ ...prev, payment: 'Selecione um mÃ©todo de pagamento' }));
      return false;
    }
    
    let isValid = true;
    let errorMsg = '';
    
    switch (paymentMethod) {
      case 'mpesa':
      case 'emola':
      case 'mkesh':
        const telefoneValid = validarTelefonePagamento(paymentDetails.phone || '');
        isValid = telefoneValid.isValid;
        errorMsg = telefoneValid.message;
        break;
        
      case 'cartao':
        const cartaoValid = validarNumeroCartao(paymentDetails.cardNumber || '');
        const validadeValid = validarValidadeCartao(paymentDetails.expiry || '');
        const cvvValid = validarCvv(paymentDetails.cvv || '');
        isValid = cartaoValid.isValid && validadeValid.isValid && cvvValid.isValid;
        errorMsg = !cartaoValid.isValid ? cartaoValid.message :
                   !validadeValid.isValid ? validadeValid.message :
                   !cvvValid.isValid ? cvvValid.message : '';
        break;
        
      case 'dinheiro':
        isValid = true;
        break;
        
      default:
        isValid = false;
    }
    
    setErrors(prev => ({ ...prev, payment: isValid ? null : errorMsg }));
    return isValid;
  }, [paymentMethod, paymentDetails]);

  // Validar tudo
  const validarTudo = useCallback(() => {
    const pessoaisOk = validarDadosPessoais();
    const pagamentoOk = validarPagamento();
    const temQuarto = true; // quarto selecionado serÃ¡ verificado no checkout
    const isValid = pessoaisOk && pagamentoOk && temQuarto;
    
    setIsFormValid(isValid);
    return isValid;
  }, [validarDadosPessoais, validarPagamento]);

  // Validar quando os dados mudam
  useEffect(() => {
    validarTudo();
  }, [guestData, paymentMethod, paymentDetails, validarTudo]);

  return {
    errors,
    isFormValid,
    validarDadosPessoais,
    validarPagamento,
    validarTudo
  };
};
