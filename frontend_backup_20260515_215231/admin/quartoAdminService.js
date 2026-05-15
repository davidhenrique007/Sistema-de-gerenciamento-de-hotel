const API_URL = 'http://localhost:5000/api/admin/quartos';

const getToken = () => localStorage.getItem('admin_token');

const request = async (url, options = {}) => {
  const token = getToken();
  
  const defaultHeaders = {
    ...options.headers
  };
  
  // Se não for FormData, adiciona Content-Type
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...defaultHeaders,
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
  // Listar quartos com filtros e paginação
  listar: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/?${queryString}`);
  },
  
  // Buscar quarto por ID
  buscarPorId: (id) => request(`/${id}`),
  
  // Criar novo quarto (com upload de imagens)
  criar: (formData) => request('/', {
    method: 'POST',
    body: formData
  }),
  
  // Atualizar quarto (com upload de imagens)
  atualizar: (id, formData) => request(`/${id}`, {
    method: 'PUT',
    body: formData
  }),
  
  // Excluir quarto (soft delete)
  excluir: (id) => request(`/${id}`, {
    method: 'DELETE'
  }),
  
  // Remover imagem específica
  removerImagem: (id, imageIndex) => request(`/${id}/imagem/${imageIndex}`, {
    method: 'DELETE'
  }),
  
  // Atualizar status
  atualizarStatus: (id, status) => request(`/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  
  // Obter estatísticas
  obterEstatisticas: () => request('/estatisticas')
};

export default quartoAdminService;
