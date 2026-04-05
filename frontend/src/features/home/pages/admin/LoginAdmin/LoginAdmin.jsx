import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginAdmin.module.css';

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

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Extrair token e user do lugar certo
        const token = data.token || data.data?.accessToken;
        const user = data.user || data.data?.user;
        
        if (token) {
          localStorage.setItem('admin_token', token);
          localStorage.setItem('admin_user', JSON.stringify(user));
          navigate('/admin/dashboard');
        } else {
          setError('Token não recebido');
        }
      } else {
        setError(data.message || 'Email ou senha inválidos');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.icon}>🏨</span>
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
