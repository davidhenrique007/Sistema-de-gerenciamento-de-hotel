import { useEffect, useRef } from 'react';

const useSessionTracking = () => {
  const logoutRegistered = useRef(false);

  const registrarLogout = async () => {
    if (logoutRegistered.current) return;
    logoutRegistered.current = true;
    
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        // Usar fetch com keepalive para garantir envio mesmo fechando a página
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          keepalive: true
        });
        console.log('✅ Logout registrado com sucesso');
      } catch (error) {
        console.error('Erro ao registrar logout:', error);
      }
    }
  };

  const enviarHeartbeat = async () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        await fetch('http://localhost:5000/api/auth/heartbeat', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          keepalive: true
        });
      } catch (error) {
        console.error('Erro no heartbeat:', error);
      }
    }
  };

  useEffect(() => {
    // Heartbeat a cada 30 segundos
    const heartbeatInterval = setInterval(enviarHeartbeat, 30000);

    // Registrar logout ao fechar a página
    const handleBeforeUnload = () => {
      registrarLogout();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Registrar logout ao recarregar a página
    const handlePageHide = () => {
      registrarLogout();
    };
    window.addEventListener('pagehide', handlePageHide);

    // Registrar logout quando a página perde visibilidade (opcional)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Opcional: registrar logout após 5 minutos de inatividade
        setTimeout(() => {
          if (document.hidden) {
            registrarLogout();
          }
        }, 300000); // 5 minutos
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Registrar logout quando o componente desmontar
      registrarLogout();
    };
  }, []);

  return { registrarLogout, enviarHeartbeat };
};

export default useSessionTracking;
