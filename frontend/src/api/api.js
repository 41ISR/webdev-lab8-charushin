const API_BASE_URL = 'https://kitek.ktkv.dev/marketplace/api'

function getAuthToken() {
  return localStorage.getItem('token')
}

async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }))
    throw new Error(error.error || 'Request failed')
  }

  return response.json()
}

export const authAPI = {
  register: async (username, password, email) => {
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email }),
    })
  },

  login: async (username, password) => {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },

  getMe: async () => {
    return fetchWithAuth('/auth/me')
  },
}

export const itemsAPI = {
  getAll: async () => {
    return fetchWithAuth('/items')
  },

  getById: async (id) => {
    const items = await fetchWithAuth('/items')
    const item = items.find(item => item.id === parseInt(id))
    return item || null
  },

  create: async (title, description, price, imageUrl) => {
    return fetchWithAuth('/items', {
      method: 'POST',
      body: JSON.stringify({ title, description, price, imageUrl }),
    })
  },

  delete: async (id) => {
    return fetchWithAuth(`/items/${id}`, {
      method: 'DELETE',
    })
  },
}

export const bidsAPI = {
  getByItemId: async (itemId) => {
    return fetchWithAuth(`/items/${itemId}/bids`)
  },

  create: async (itemId, amount) => {
    return fetchWithAuth(`/items/${itemId}/bids`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  },

  getMyBids: async () => {
    return fetchWithAuth('/bids/my')
  },
}

export const statsAPI = {
  get: async () => {
    return fetchWithAuth('/stats')
  },
}

