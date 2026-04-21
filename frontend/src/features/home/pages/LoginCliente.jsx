import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCliente } from "../../../contexts/ClienteContext";
import FormularioIdentificacao from "../components/FormularioIdentificacao";
import logoImage from "../../../assets/images/login/logo.png"; // Mesmo caminho do LoginAdmin
import styles from "./LoginCliente.module.css";

const LoginCliente = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { identificarCliente, cliente, loading } = useCliente();
  const [error, setError] = useState(null);

  const handleSubmit = async (dados) => {
    try {
      setError(null);
      const resultado = await identificarCliente(dados);
      
      if (resultado.success) {
        const destino = location.state?.from || '/';
        navigate(destino, { replace: true });
      } else {
        setError(resultado.error);
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor. Tente novamente.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.illustration}>
          {/* Logo com imagem real - mesmo padrão do LoginAdmin */}
          <div className={styles.logoContainer}>
            <div className={styles.logoCircle}></div>
            <img 
              src={logoImage} 
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
            alt="Faça sua reserva" 
            className={styles.illustrationImage}
          />
          <h1>Finalize sua reserva em poucos passos</h1>
          <p>Preencha seus dados e confirme sua estadia</p>
          
          <div className={styles.benefits}>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>✓</span>
              <span>Processo rápido e seguro</span>
            </div>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>✓</span>
              <span>Dados protegidos com criptografia</span>
            </div>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>✓</span>
              <span>Confirmação imediata por e-mail</span>
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
          />

          {cliente && (
            <div className={styles.welcomeBack}>
              <p>Bem-vindo de volta, {cliente.name.split(' ')[0]}!</p>
              <button 
                onClick={() => navigate('/quartos/disponiveis')}
                className={styles.continueButton}
              >
                Continuar reserva
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginCliente;