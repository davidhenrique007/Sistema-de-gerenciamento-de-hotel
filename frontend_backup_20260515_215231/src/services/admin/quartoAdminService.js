const API_URL = 'http://localhost:5000/api/admin/quartos';

const getToken = () => localStorage.getItem('admin_token');

const request = async (url, options = {}) => {
  const token = getToken();
  
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Erro na requisição');
  }
  
  return data;
};

const quartoAdminService = {
  // Listagem
  listar: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/?${queryString}`);
  },
  
  listarLixeira: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/lixeira?${queryString}`);
  },
  
  buscarPorId: (id) => request(`/${id}`),
  
  // CRUD
  criar: (data) => request('/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  atualizar: (id, data) => request(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  atualizarStatus: (id, status) => request(`/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  
  obterEstatisticas: () => request('/estatisticas'),
  
  // Soft Delete
  excluir: (id) => request(`/${id}`, {
    method: 'DELETE'
  }),
  
  recuperar: (id) => request(`/${id}/recuperar`, {
    method: 'PUT'
  }),
  
  excluirPermanentemente: (id) => request(`/${id}/permanente`, {
    method: 'DELETE'
  })
};

export default quartoAdminService;
