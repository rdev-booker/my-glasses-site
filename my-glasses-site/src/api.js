/* API client — all calls proxy through CRA's dev-server to http://localhost:3001 */

const BASE = process.env.REACT_APP_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  /* Auth */
  register: (data)        => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login:    (data)        => request('/auth/login',    { method: 'POST', body: JSON.stringify(data) }),

  /* Products */
  getProducts:  ()        => request('/products'),
  getProduct:   (id)      => request(`/products/${id}`),

  /* Tints */
  getTints:     ()        => request('/tints'),

  /* Configurations */
  getConfigurations:    ()        => request('/configurations'),
  saveConfiguration:    (data)    => request('/configurations',     { method: 'POST',   body: JSON.stringify(data) }),
  updateConfiguration:  (id, d)   => request(`/configurations/${id}`, { method: 'PUT', body: JSON.stringify(d)    }),
  deleteConfiguration:  (id)      => request(`/configurations/${id}`, { method: 'DELETE' }),

  /* Orders */
  getOrders:   ()         => request('/orders'),
  placeOrder:  (data)     => request('/orders', { method: 'POST', body: JSON.stringify(data) }),

  /* Admin */
  admin: {
    getStats:          ()        => request('/admin/stats'),
    getProducts:       ()        => request('/admin/products'),
    createProduct:     (d)       => request('/admin/products',        { method: 'POST',  body: JSON.stringify(d) }),
    updateProduct:     (id, d)   => request(`/admin/products/${id}`,  { method: 'PUT',   body: JSON.stringify(d) }),
    deleteProduct:     (id)      => request(`/admin/products/${id}`,  { method: 'DELETE' }),
    getTints:          ()        => request('/admin/tints'),
    createTint:        (d)       => request('/admin/tints',           { method: 'POST',  body: JSON.stringify(d) }),
    updateTint:        (id, d)   => request(`/admin/tints/${id}`,     { method: 'PUT',   body: JSON.stringify(d) }),
    deleteTint:        (id)      => request(`/admin/tints/${id}`,     { method: 'DELETE' }),
    getOrders:         ()        => request('/admin/orders'),
    updateOrderStatus: (id, s)   => request(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: s }) }),
  },
};
