// ============================================
// PAGE: CheckoutPage
// ============================================
// Responsabilidade: Página base de checkout
// Arquitetura: Camada de apresentação, sem lógica de negócio
// ============================================

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../../shared/components/layout/Header/Header.jsx';
import { Footer } from '../../shared/components/layout/Footer/Footer.jsx';
import { Container, ContainerSize } from '../../shared/components/layout/Container/Container.jsx';
import { Button, ButtonVariant, ButtonSize } from '../../shared/components/ui/Button/Button.jsx';
import { useNotification } from '../../shared/components/ui/Notification/Notification.jsx';
import { PaymentSummary } from '../../features/payment/components/PaymentSummary.js';
import styles from './CheckoutPage.module.css';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notification = useNotification();
  
  // Recuperar dados da reserva da navegação (se disponíveis)
  const reservationData = location.state?.reservation;

  useEffect(() => {
    // Se não houver dados da reserva, redirecionar para home
    if (!reservationData) {
      notification.warning('Nenhuma reserva encontrada. Por favor, inicie uma nova reserva.');
      navigate('/', { replace: true });
    }
  }, [reservationData, navigate, notification]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleConfirmPayment = () => {
    // Simulação de processamento de pagamento
    notification.info('Processando pagamento...');
    
    setTimeout(() => {
      notification.success('Pagamento processado com sucesso! (Modo de demonstração)');
      // Em produção, redirecionaria para página de confirmação
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    }, 1500);
  };

  if (!reservationData) {
    return null; // Não renderiza nada enquanto redireciona
  }

  return (
    <div className={styles.checkoutPage}>
      <Header onNavigate={navigate} />

      <main className={styles.main}>
        <Container size={ContainerSize.SMALL}>
          <div className={styles.checkoutContainer}>
            <h1 className={styles.title}>Finalizar Pagamento</h1>
            
            <div className={styles.content}>
              {/* Resumo da reserva */}
              <section className={styles.summarySection}>
                <h2 className={styles.sectionTitle}>Resumo da Reserva</h2>
                <PaymentSummary
                  room={reservationData.room}
                  checkIn={reservationData.checkIn}
                  checkOut={reservationData.checkOut}
                  guests={reservationData.guests}
                  nights={reservationData.nights}
                  services={reservationData.services || []}
                  roomPrice={reservationData.roomPrice || 0}
                  servicesPrice={reservationData.servicesPrice || 0}
                  taxes={reservationData.taxes || 0}
                  total={reservationData.total || 0}
                  showBreakdown={true}
                />
              </section>

              {/* Informações de pagamento (placeholder) */}
              <section className={styles.paymentSection}>
                <h2 className={styles.sectionTitle}>Forma de Pagamento</h2>
                <div className={styles.paymentPlaceholder}>
                  <p className={styles.placeholderText}>
                    Integração com gateway de pagamento será implementada aqui.
                  </p>
                  <p className={styles.placeholderNote}>
                    Modo de demonstração - nenhum pagamento real será processado.
                  </p>
                </div>
              </section>

              {/* Ações */}
              <div className={styles.actions}>
                <Button
                  variant={ButtonVariant.OUTLINE}
                  size={ButtonSize.LARGE}
                  onClick={handleBackToHome}
                >
                  Voltar para Home
                </Button>
                <Button
                  variant={ButtonVariant.PRIMARY}
                  size={ButtonSize.LARGE}
                  onClick={handleConfirmPayment}
                >
                  Confirmar Pagamento
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
};

export default CheckoutPage;