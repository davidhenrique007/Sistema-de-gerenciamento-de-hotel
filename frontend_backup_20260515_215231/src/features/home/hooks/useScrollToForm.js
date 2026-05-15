import { useCallback, useRef } from 'react';

/**
 * Hook personalizado para gerenciar scroll suave até o formulário de reserva
 * 
 * @param {Object} options - Opções de scroll
 * @returns {Object} Ref e função de scroll
 * 
 * @example
 * const { formRef, scrollToForm } = useScrollToForm();
 * 
 * return (
 *   <>
 *     <button onClick={scrollToForm}>Reservar</button>
 *     <div ref={formRef}>Formulário</div>
 *   </>
 * );
 */
const useScrollToForm = (options = {}) => {
  const formRef = useRef(null);
  
  const {
    behavior = 'smooth',
    block = 'start',
    offset = 0,
  } = options;

  const scrollToForm = useCallback(() => {
    if (formRef.current) {
      const elementPosition = formRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior,
      });
    }
  }, [behavior, block, offset]);

  const scrollToFormWithDelay = useCallback((delay = 200) => {
    setTimeout(() => {
      scrollToForm();
    }, delay);
  }, [scrollToForm]);

  return {
    formRef,
    scrollToForm,
    scrollToFormWithDelay,
  };
};

export default useScrollToForm;