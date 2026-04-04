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

    console.log('🔐 Tentando login com:', email);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('📦 Resposta do servidor:', data);
      
      if (data.success) {
        console.log('✅ Login bem-sucedido!');
        
        // Extrair token do lugar correto (pode estar em data.token ou diretamente)
        const token = data.token || data.data?.token;
        const userData = data.user || data.data?.user;
        
        console.log('🔑 Token extraído:', token ? `${token.substring(0, 30)}...` : 'NÃO ENCONTRADO');
        
        if (!token) {
          setError('Token não recebido do servidor');
          setLoading(false);
          return;
        }
        
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(userData));
        
        console.log('🗂️ Dados salvos:', { userData, token: token.substring(0, 30) + '...' });
        console.log('🚀 Redirecionando para /admin/dashboard...');
        
        // Pequeno delay para garantir que o localStorage foi salvo
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 100);
      } else {
        console.log('❌ Login falhou:', data.message);
        setError(data.message || 'Email ou senha inválidos');
      }
    } catch (err) {
      console.error('❌ Erro na requisição:', err);
      setError('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
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
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="admin@hotelparadise.com"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Entrando...' : 'Entrar no Painel'}
          </button>
        </form>

        <div className={styles.info}>
          <p>Credenciais de teste:</p>
          <p><strong>Admin:</strong> admin@hotelparadise.com / admin123</p>
          <p><strong>Recepcionista:</strong> recepcao@hotelparadise.com / receptionist123</p>
          <p><strong>Financeiro:</strong> financeiro@hotelparadise.com / financeiro123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
