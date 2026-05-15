import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCliente } from "../../../contexts/ClienteContext";
import { useI18n } from "../../../contexts/I18nContext";
import FormularioIdentificacao from "../components/FormularioIdentificacao";
import styles from "./LoginCliente.module.css";

const LoginCliente = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { identificarCliente, cliente, loading } = useCliente();
  const { t } = useI18n();
  const [error, setError] = useState(null);

  const handleSubmit = async (dados) => {
    try {
      setError(null);
      const resultado = await identificarCliente(dados);
      
      if (resultado.success) {
        const destino = location.state?.from || '/';
        navigate(destino, { replace: true });
      } else {
        const errorKey = mapErrorToKey(resultado.error);
        setError(t(errorKey));
      }
    } catch (err) {
      setError(t('errors.server_error'));
    }
  };

  const mapErrorToKey = (errorMessage) => {
    const errorMap = {
      'Credenciais inválidas': 'errors.invalid_credentials',
      'Invalid credentials': 'errors.invalid_credentials',
      'Utilizador não encontrado': 'errors.user_not_found',
      'User not found': 'errors.user_not_found',
      'Email não verificado': 'errors.email_not_verified',
      'Email not verified': 'errors.email_not_verified',
      'Conta bloqueada': 'errors.account_locked',
      'Account locked': 'errors.account_locked'
    };
    return errorMap[errorMessage] || 'errors.login_failed';
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.illustration}>
          <div className={styles.logoContainer}>
            <div className={styles.logoCircle}></div>
            <img 
              src="/assets/images/login/logo.png"
              alt="Hotel Paradise" 
              className={styles.logoImage}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'inline-block';
                }
              }}
            />
            <span className={styles.logoFallback} style={{ display: 'none' }}>🏨</span>
          </div>

          <img 
            src="/assets/images/login-illustration.svg" 
            alt={t('auth.login.title')}
            className={styles.illustrationImage}
          />
          <h1>{t('auth.login.title')}</h1>
          <p>{t('auth.login.subtitle')}</p>
          
          <div className={styles.benefits}>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>✓</span>
              <span>{t('checkout.personal_data')}</span>
            </div>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>✓</span>
              <span>{t('common.loading')}</span>
            </div>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>✓</span>
              <span>{t('common.confirm')}</span>
            </div>
          </div>
        </div>

        <div className={styles.formWrapper}>
          {error && (
            <div className={styles.alertError}>
              {error}
            </div>
          )}

          <FormularioIdentificacao 
            onSubmit={handleSubmit}
            isLoading={loading}
            t={t}
          />

          {cliente && (
            <div className={styles.welcomeBack}>
              <p>{t('auth.login.welcome_back', { name: cliente.name.split(' ')[0] })}</p>
              <button 
                onClick={() => navigate('/quartos/disponiveis')}
                className={styles.continueButton}
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginCliente;

