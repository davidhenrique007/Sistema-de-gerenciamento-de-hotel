// Verificar no console do navegador
console.log('=== DIAGNÓSTICO MINHAS RESERVAS ===');
console.log('Cliente logado?', localStorage.getItem('cliente'));
console.log('Token?', localStorage.getItem('token'));
console.log('URL API:', import.meta.env.VITE_API_URL);
