/**
 * Módulo central de comunicação com a API.
 * Todo o resto do front-end passa por aqui — nenhum outro arquivo faz
 * fetch() diretamente. Isso deixa fácil, por exemplo, mudar o endereço
 * da API no dia em que o site for hospedado em um domínio separado do
 * backend: basta mudar API_BASE_URL abaixo.
 */

// Como o front-end é servido pelo próprio backend (Express serve a pasta
// /frontend), uma URL relativa funciona tanto em desenvolvimento quanto
// em produção. Só troque isto se decidir hospedar o front-end em um
// domínio/serviço diferente do backend.
export const API_BASE_URL = '/api';

const TOKEN_KEY = 'flor-de-acucar-admin-token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiRequestError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * @param {string} path - ex: '/items'
 * @param {object} options - { method, body, isFormData, auth }
 */
async function request(path, options = {}) {
  const { method = 'GET', body, isFormData = false, auth = false } = options;

  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiRequestError('Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.', 0);
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try { data = JSON.parse(text); } catch { /* resposta não-JSON, ignora */ }
  }

  if (!response.ok) {
    const message = (data && data.error) || 'Ocorreu um erro inesperado.';
    throw new ApiRequestError(message, response.status);
  }

  return data;
}

export const api = {
  // Público
  getItems: () => request('/items'),
  getSettings: () => request('/settings'),
  createOrder: (payload) => request('/orders', { method: 'POST', body: payload }),

  // Autenticação
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  me: () => request('/auth/me', { auth: true }),
  changePassword: (currentPassword, newPassword) =>
    request('/auth/password', { method: 'PUT', body: { currentPassword, newPassword }, auth: true }),

  // Admin — cardápio
  createItem: (payload) => request('/items', { method: 'POST', body: payload, auth: true }),
  updateItem: (id, payload) => request(`/items/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteItem: (id) => request(`/items/${id}`, { method: 'DELETE', auth: true }),

  // Admin — pedidos
  getOrders: () => request('/orders', { auth: true }),
  getOrderStats: () => request('/orders/stats', { auth: true }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: { status }, auth: true }),

  // Admin — configurações
  updateSettings: (payload) => request('/settings', { method: 'PUT', body: payload, auth: true }),

  // Admin — upload de imagem
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return request('/upload/image', { method: 'POST', body: formData, isFormData: true, auth: true });
  },
};

export { ApiRequestError };
