import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReceiptModal from '../../../shared/components/ui/ReceiptModal';
import styles from './CheckoutPage.module.css';

// Ícones
const UserIcon = () => <span className={styles.icon}>👤</span>;
const ClipboardIcon = () => <span className={styles.icon}>📋</span>;
const MoneyIcon = () => <span className={styles.icon}>💰</span>;
const PaymentIcon = () => <span className={styles.icon}>💳</span>;
const ReceiptIcon = () => <span className={styles.icon}>🧾</span>;

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ==========================================================================
  // 1. DADOS DA RESERVA (RECUPERADOS DO ESTADO)
  // ==========================================================================
  const { reservation } = location.state || {};

  // Estado para dados do hóspede
  const [guestData, setGuestData] = useState({
    nome: '',
    naturalidade: '',
    idade: '',
    documento: '',
    telefone: '',
    email: '',
  });

  // Estado para pagamento
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [paymentErrors, setPaymentErrors] = useState({});

  // Estado para checkout confirmado
  const [checkoutConfirmed, setCheckoutConfirmed] = useState(false);
  const [receiptOptions, setReceiptOptions] = useState({
    pdf: true,
    print: false,
    email: false,
  });

  // ==========================================================================
  // NOVOS ESTADOS PARA O MODAL (ADICIONADOS)
  // ==========================================================================
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState({});

  // Redirecionar se não houver dados da reserva
  useEffect(() => {
    if (!reservation) {
      navigate('/', { replace: true });
    }
  }, [reservation, navigate]);

  if (!reservation) return null;

  // ==========================================================================
  // 2. EXTRAIR DADOS DA RESERVA
  // ==========================================================================
  const {
    roomId,
    roomNumber = '40',
    roomType = 'Familiar',
    checkIn,
    checkOut,
    guests = { adults: 2, children: 1, babies: 0 },
    nights = 3,
    pricePerNight = 7000,
    servicesTotal = 1000,
    subtotal = 21000,
    taxes = 500,
    total = 22500,
  } = reservation;

  // Formatar datas
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // ==========================================================================
  // 3. HANDLERS PARA DADOS DO HÓSPEDE
  // ==========================================================================
  const handleGuestChange = (e) => {
    const { name, value } = e.target;
    setGuestData((prev) => ({ ...prev, [name]: value }));
  };

  // ==========================================================================
  // 4. HANDLERS PARA PAGAMENTO
  // ==========================================================================
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentDetails({});
    setPaymentErrors({});
  };

  const handlePaymentDetailChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));

    // Validar em tempo real
    validatePaymentField(name, value);
  };

  const validatePaymentField = (field, value) => {
    let error = '';

    if (paymentMethod === 'mpesa' || paymentMethod === 'emola' || paymentMethod === 'mkesh') {
      if (field === 'phone') {
        // Remove espaços e caracteres não numéricos
        const cleanNumber = value.replace(/\D/g, '');

        // Verifica se tem 9 dígitos
        if (cleanNumber.length !== 9) {
          error = 'Número inválido. Deve ter 9 dígitos';
        }
        // Verifica se começa com 8
        else if (!cleanNumber.startsWith('8')) {
          error = 'Número deve começar com 8';
        }
        // Validação por operadora
        else {
          const prefix = cleanNumber.substring(0, 2);

          if (paymentMethod === 'mpesa') {
            if (!['84', '85'].includes(prefix)) {
              error = 'M-Pesa: número deve começar com 84 ou 85 (Vodacom)';
            }
          } else if (paymentMethod === 'emola') {
            if (!['86', '87'].includes(prefix)) {
              error = 'e-Mola: número deve começar com 86 ou 87 (Movitel)';
            }
          } else if (paymentMethod === 'mkesh') {
            if (!['82', '83'].includes(prefix)) {
              error = 'mKesh: número deve começar com 82 ou 83 (Tmcel)';
            }
          }
        }
      }
    }

    setPaymentErrors((prev) => ({ ...prev, [field]: error }));
  };

  const calculateChange = () => {
    const paid = parseFloat(paymentDetails.paidAmount) || 0;
    return Math.max(0, paid - total);
  };

  // ==========================================================================
  // 5. VALIDAÇÃO GERAL DO FORMULÁRIO
  // ==========================================================================
  const isFormValid = () => {
    // Validar dados do hóspede
    const guestValid = Object.values(guestData).every((val) => val.trim() !== '');

    // Validar método de pagamento
    if (!paymentMethod) return false;

    // Validar detalhes do pagamento
    const hasErrors = Object.values(paymentErrors).some((err) => err !== '');

    let detailsValid = false;
    if (paymentMethod === 'dinheiro') {
      detailsValid = parseFloat(paymentDetails.paidAmount) >= total;
    }
    if (paymentMethod === 'cartao') {
      detailsValid =
        paymentDetails.cardNumber &&
        paymentDetails.expiry &&
        paymentDetails.cvv &&
        paymentDetails.cardHolder;
    }
    if (paymentMethod === 'mpesa' || paymentMethod === 'emola' || paymentMethod === 'mkesh') {
      detailsValid = paymentDetails.phone && paymentDetails.phone.length === 9;
    }

    return guestValid && !hasErrors && detailsValid;
  };

  // ==========================================================================
  // FUNÇÃO AUXILIAR PARA NOME DO MÉTODO DE PAGAMENTO
  // ==========================================================================
  const getPaymentMethodName = (method) => {
    const methods = {
      dinheiro: 'Dinheiro',
      cartao: 'Cartão',
      mpesa: 'M-Pesa',
      emola: 'e-Mola',
      mkesh: 'mKesh',
    };
    return methods[method] || method;
  };

  // ==========================================================================
  // 6. CONFIRMAR CHECKOUT (MODIFICADO PARA ABRIR O MODAL)
  // ==========================================================================
  const handleConfirmCheckout = () => {
    if (!isFormValid()) {
      alert('Por favor, preencha todos os campos corretamente');
      return;
    }

    // Dados para o recibo - AGORA COMPLETOS!
    const receiptInfo = {
      guestName: guestData.nome,
      document: guestData.documento,
      roomNumber,
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut),
      nights,
      pricePerNight,
      servicesTotal,
      taxes,
      total,
      selectedServices: reservation.selectedServices || [],
      paymentMethod: getPaymentMethodName(paymentMethod),
      // Campos adicionais para profissionalizar o recibo
      receiptNumber: `REC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')}`,
      paymentDate: new Date().toLocaleDateString('pt-BR'),
    };

    setReceiptData(receiptInfo);
    setShowReceiptModal(true);

    // Simular processamento
    console.log('Checkout confirmado', {
      guest: guestData,
      reservation,
      payment: {
        method: paymentMethod,
        details: paymentDetails,
      },
    });

    setCheckoutConfirmed(true);
  };

  // ==========================================================================
  // 7. RENDERIZAR CAMPOS DE PAGAMENTO DINÂMICOS
  // ==========================================================================
  const renderPaymentFields = () => {
    switch (paymentMethod) {
      case 'dinheiro':
        return (
          <div className={styles.paymentFields}>
            <div className={styles.fieldGroup}>
              <label>Valor pago (MZN)</label>
              <input
                type="number"
                name="paidAmount"
                value={paymentDetails.paidAmount || ''}
                onChange={handlePaymentDetailChange}
                min={total}
                step="100"
                className={styles.input}
              />
              {paymentDetails.paidAmount >= total && (
                <div className={styles.changeInfo}>
                  Troco: <strong>{formatCurrency(calculateChange())}</strong>
                </div>
              )}
            </div>
          </div>
        );

      case 'cartao':
        return (
          <div className={styles.paymentFields}>
            <div className={styles.fieldGroup}>
              <label>Nome do titular</label>
              <input
                type="text"
                name="cardHolder"
                value={paymentDetails.cardHolder || ''}
                onChange={handlePaymentDetailChange}
                className={styles.input}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Número do cartão</label>
              <input
                type="text"
                name="cardNumber"
                value={paymentDetails.cardNumber || ''}
                onChange={handlePaymentDetailChange}
                placeholder="0000 0000 0000 0000"
                maxLength="19"
                className={`${styles.input} ${paymentErrors.cardNumber ? styles.error : ''}`}
              />
              {paymentErrors.cardNumber && (
                <span className={styles.errorMessage}>{paymentErrors.cardNumber}</span>
              )}
            </div>
            <div className={styles.rowFields}>
              <div className={styles.fieldGroup}>
                <label>Validade</label>
                <input
                  type="text"
                  name="expiry"
                  value={paymentDetails.expiry || ''}
                  onChange={handlePaymentDetailChange}
                  placeholder="MM/AA"
                  maxLength="5"
                  className={`${styles.input} ${paymentErrors.expiry ? styles.error : ''}`}
                />
                {paymentErrors.expiry && (
                  <span className={styles.errorMessage}>{paymentErrors.expiry}</span>
                )}
              </div>
              <div className={styles.fieldGroup}>
                <label>CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={paymentDetails.cvv || ''}
                  onChange={handlePaymentDetailChange}
                  maxLength="3"
                  className={`${styles.input} ${paymentErrors.cvv ? styles.error : ''}`}
                />
                {paymentErrors.cvv && (
                  <span className={styles.errorMessage}>{paymentErrors.cvv}</span>
                )}
              </div>
            </div>
          </div>
        );

      case 'mpesa':
      case 'emola':
      case 'mkesh':
        return (
          <div className={styles.paymentFields}>
            <div className={styles.fieldGroup}>
              <label>Número de telefone</label>
              <input
                type="tel"
                name="phone"
                value={paymentDetails.phone || ''}
                onChange={handlePaymentDetailChange}
                placeholder="84XXXXXXX"
                maxLength="9"
                className={`${styles.input} ${paymentErrors.phone ? styles.error : ''}`}
              />
              {paymentErrors.phone && (
                <span className={styles.errorMessage}>{paymentErrors.phone}</span>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ==========================================================================
  // 8. RENDERIZAR RECIBO
  // ==========================================================================
  const renderReceipt = () => (
    <div className={styles.receiptPreview}>
      <div className={styles.receiptHeader}>
        <strong>HOTEL PARADISE</strong>
        <span>Recibo de Checkout</span>
      </div>

      <div className={styles.receiptBody}>
        <p>
          <span>Hóspede:</span> {guestData.nome}
        </p>
        <p>
          <span>Documento:</span> {guestData.documento}
        </p>
        <p>
          <span>Quarto:</span> {roomNumber}
        </p>
        <p>
          <span>Período:</span> {formatDate(checkIn)} a {formatDate(checkOut)}
        </p>

        <table className={styles.receiptTable}>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{nights} noites</td>
              <td>{formatCurrency(pricePerNight * nights)}</td>
            </tr>
            {servicesTotal > 0 && (
              <tr>
                <td>Serviços extras</td>
                <td>{formatCurrency(servicesTotal)}</td>
              </tr>
            )}
            <tr>
              <td>Taxas</td>
              <td>{formatCurrency(taxes)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>Total Pago</th>
              <th>{formatCurrency(total)}</th>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className={styles.receiptFooter}>Obrigado por escolher o Hotel Paradise.</div>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* HEADER - SEM O BOTÃO VOLTAR */}
      <header className={styles.header}>
        <h1 className={styles.hotelName}>HOTEL PARADISE</h1>
        <h2 className={styles.mainTitle}>CHECK-OUT</h2>
        <p className={styles.subtitle}>Finalizar Estadia do Hóspede</p>
        <p className={styles.description}>
          Confirme os dados da estadia, finalize o checkout e gere o recibo do hóspede.
        </p>
      </header>

      <div className={styles.grid}>
        {/* COLUNA ESQUERDA */}
        <div className={styles.leftColumn}>
          {/* CARD 1 - INFORMAÇÕES DO HÓSPEDE */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <UserIcon />
              <h3 className={styles.cardTitle}>INFORMAÇÕES DO HÓSPEDE</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Nome completo</label>
                  <input
                    type="text"
                    name="nome"
                    value={guestData.nome}
                    onChange={handleGuestChange}
                    placeholder="Digite o nome completo"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Naturalidade</label>
                  <input
                    type="text"
                    name="naturalidade"
                    value={guestData.naturalidade}
                    onChange={handleGuestChange}
                    placeholder="Ex: Maputo"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Idade</label>
                  <input
                    type="number"
                    name="idade"
                    value={guestData.idade}
                    onChange={handleGuestChange}
                    placeholder="Ex: 35"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Documento de identificação</label>
                  <input
                    type="text"
                    name="documento"
                    value={guestData.documento}
                    onChange={handleGuestChange}
                    placeholder="Ex: BI 12345678"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Telefone</label>
                  <input
                    type="tel"
                    name="telefone"
                    value={guestData.telefone}
                    onChange={handleGuestChange}
                    placeholder="+258 84 000 0000"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={guestData.email}
                    onChange={handleGuestChange}
                    placeholder="email@exemplo.com"
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2 - RESUMO DE PAGAMENTO */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <MoneyIcon />
              <h3 className={styles.cardTitle}>RESUMO DE PAGAMENTO</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.paymentSummary}>
                <div className={styles.summaryRow}>
                  <span>Preço por noite</span>
                  <strong>{formatCurrency(pricePerNight)}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Número de noites</span>
                  <strong>{nights}x</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Serviços extras</span>
                  <strong>{formatCurrency(servicesTotal)}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Taxa / IVA</span>
                  <strong>{formatCurrency(taxes)}</strong>
                </div>
                <div className={styles.totalRow}>
                  <span>TOTAL A PAGAR</span>
                  <span className={styles.totalValue}>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className={styles.rightColumn}>
          {/* CARD 3 - DETALHES DA RESERVA */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <ClipboardIcon />
              <h3 className={styles.cardTitle}>DETALHES DA RESERVA</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Quarto:</span>
                  <span className={styles.detailValue}>{roomNumber}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tipo:</span>
                  <span className={styles.detailValue}>{roomType}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Check-in:</span>
                  <span className={styles.detailValue}>{formatDate(checkIn)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Check-out:</span>
                  <span className={styles.detailValue}>{formatDate(checkOut)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Nº de noites:</span>
                  <span className={styles.detailValue}>{nights}</span>
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.guestList}>
                <h4 className={styles.subsectionTitle}>Hóspedes</h4>
                <div className={styles.guestItem}>
                  <span>Adultos:</span>
                  <span className={styles.guestCount}>{guests.adults}</span>
                </div>
                <div className={styles.guestItem}>
                  <span>Crianças:</span>
                  <span className={styles.guestCount}>{guests.children}</span>
                </div>
                <div className={styles.guestItem}>
                  <span>Bebês:</span>
                  <span className={styles.guestCount}>{guests.babies}</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 4 - FORMA DE PAGAMENTO */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <PaymentIcon />
              <h3 className={styles.cardTitle}>FORMA DE PAGAMENTO</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.paymentMethods}>
                {['Dinheiro', 'Cartão', 'M-Pesa', 'e-Mola', 'mKesh'].map((method) => (
                  <label key={method} className={styles.methodLabel}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.toLowerCase().replace('-', '')}
                      checked={paymentMethod === method.toLowerCase().replace('-', '')}
                      onChange={() =>
                        handlePaymentMethodChange(method.toLowerCase().replace('-', ''))
                      }
                      className={styles.radioInput}
                    />
                    <span className={styles.methodText}>{method}</span>
                  </label>
                ))}
              </div>

              {renderPaymentFields()}
            </div>
          </div>
        </div>
      </div>

      {/* BOTÃO CONFIRMAR CHECKOUT */}
      {!checkoutConfirmed && (
        <div className={styles.actionButtons}>
          <button
            className={styles.primaryButton}
            onClick={handleConfirmCheckout}
            disabled={!isFormValid()}
          >
            Confirmar Checkout
          </button>
        </div>
      )}

      {/* SEÇÃO DE RECIBO (APÓS CONFIRMAÇÃO) */}
      {checkoutConfirmed && (
        <div className={styles.receiptSection}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <ReceiptIcon />
              <h3 className={styles.cardTitle}>RECIBO E COMPROVANTE</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.receiptOptions}></div>
              {renderReceipt()}
              <div className={styles.receiptActions}>
                <button className={styles.secondaryButton}>Gerar PDF</button>
                <button className={styles.secondaryButton}>Imprimir</button>
                <button className={styles.secondaryButton}>Enviar Email</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
        BOTÃO VOLTAR - NO FINAL DA PÁGINA (CANTO INFERIOR ESQUERDO)
        ========================================================================== */}
      <div className={styles.backButtonContainer}>
        <button
          className={styles.backButton}
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          <span className={styles.backIcon}>←</span>
          <span>Voltar</span>
        </button>
      </div>

      {/* MODAL DE RECIBO */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receiptData={receiptData}
      />
    </div>
  );
};

export default CheckoutPage;