const API_URL = '/api/admin/logs';

export const fetchLogs = async (filters = {}, page = 1, limit = 20) => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters
    });
    
    const response = await fetch(`${API_URL}?${params}`);
    if (!response.ok) throw new Error('Erro ao buscar logs');
    
    const data = await response.json();
    return {
      data: data.data || [],
      total: data.total || 0,
      page,
      totalPages: Math.ceil((data.total || 0) / limit)
    };
  } catch (error) {
    console.error('Erro no logService:', error);
    return { data: [], total: 0, page: 1, totalPages: 0 };
  }
};

export const fetchLogById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Erro ao buscar log');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Erro ao buscar log:', error);
    return null;
  }
};

export const exportLogs = async (filters = {}) => {
  const params = new URLSearchParams({ ...filters, format: 'csv' });
  window.open(`${API_URL}/export?${params}`, '_blank');
};

export default {
  fetchLogs,
  fetchLogById,
  exportLogs
};