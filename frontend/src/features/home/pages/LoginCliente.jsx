import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import { useI18n } from "../../../../contexts/I18nContext";
import styles from "./LoginAdmin.module.css";

const LoginAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error: authError } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError(t('errors.required_field'));
      return;
    }

    try {
      const result = await login(email, password);
      if (result.success) {
        const from = location.state?.from?.pathname || "/admin/dashboard";
        navigate(from, { replace: true });
      } else {
        setError(result.error || t('errors.login_failed'));
      }
    } catch (err) {
      setError(t('errors.server_error'));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.illustration}>
          <div className={styles.logoContainer}>
            <div className={styles.logoCircle}></div>
            {/* ✅ Usar caminho direto da pasta public */}
            <img 
              src="/logo.png"
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

          <h1>{t('auth.login.title')}</h1>
          <p>{t('auth.login.subtitle')}</p>
        </div>

        <div className={styles.formWrapper}>
          {(error || authError) && (
            <div className={styles.alertError}>
              {error || authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>{t('auth.login.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.login.email_placeholder')}
                disabled={loading}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>{t('auth.login.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.login.password_placeholder')}
                disabled={loading}
                className={styles.input}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? t('common.loading') : t('auth.login.button')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;