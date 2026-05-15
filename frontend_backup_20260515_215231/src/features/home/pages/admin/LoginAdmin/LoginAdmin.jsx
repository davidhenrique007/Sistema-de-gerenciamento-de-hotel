import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginAdmin.module.css';
import logoImage from '../../../../../assets/images/login/logo.png';

const LoginAdmin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔐 Tentando login com:', email);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('📦 Resposta do servidor:', data);
      
      if (data.success) {
        const token = data.token;
        const userData = data.user;
        
        if (!token) {
          setError('Token não recebido do servidor');
          setLoading(false);
          return;
        }
        
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(userData));
        
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Email ou senha inválidos');
      }
    } catch (err) {
      console.error('❌ Erro na requisição:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
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
          <h1 className={styles.title}>Hotel Paradise</h1>
          <p className={styles.subtitle}>Painel Administrativo</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.field}>
            <label className={styles.label}>E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} placeholder="admin@hotelparadise.com" required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className={styles.button}>{loading ? 'Entrando...' : 'Entrar no Painel'}</button>
        </form>
        <div className={styles.info}>
          <p><strong>Admin:</strong> admin@hotelparadise.com / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
