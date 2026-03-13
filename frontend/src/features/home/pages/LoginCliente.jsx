import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCliente } from "../../../contexts/ClienteContext";  // ← CAMINHO CORRETO!
import FormularioIdentificacao from "../components/FormularioIdentificacao";
import styles from "./LoginCliente.module.css";

const LoginCliente = () => {
  const navigate = useNavigate();
  const { identificarCliente, cliente, loading } = useCliente();
  const [error, setError] = useState(null);

  const handleSubmit = async (dados) => {
    try {
      setError(null);
      const resultado = await identificarCliente(dados);
      
      if (resultado.success) {
        const tipoSelecionado = localStorage.getItem('@HotelParadise:tipoQuarto');
        
        if (tipoSelecionado) {
          navigate('/quartos/disponiveis');
        } else {
          navigate('/quartos');
        }
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
          <img 
            src="/assets/images/login-illustration.svg" 
            alt="Faça sua reserva" 
            className={styles.illustrationImage}
          />
          <h1>Bem-vindo ao Hotel Paradise</h1>
          <p>Identifique-se para continuar com sua reserva</p>
          
          <div className={styles.benefits}>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>✓</span>
              <span>Reservas mais rápidas</span>
            </div>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>✓</span>
              <span>Ofertas exclusivas</span>
            </div>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>✓</span>
              <span>Histórico de estadias</span>
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