const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Error en la petición')
  }
  return response.json()
}

// Proyectos
export const projectsApi = {
  getAll: () => fetch(`${API_BASE_URL}/projects`).then(handleResponse),
  getById: (id) => fetch(`${API_BASE_URL}/projects/${id}`).then(handleResponse),
  create: (data) => fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
}

// Catálogos genérico
export const catalogsApi = {
  get: (catalog) => fetch(`${API_BASE_URL}/${catalog}`).then(handleResponse),
  create: (catalog, data) => fetch(`${API_BASE_URL}/${catalog}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (catalog, id, data) => fetch(`${API_BASE_URL}/${catalog}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  toggle: (catalog, id) => fetch(`${API_BASE_URL}/${catalog}/${id}/toggle`, {
    method: 'PATCH'
  }).then(handleResponse),
}

// Dashboard
export const dashboardApi = {
  getMetrics: () => fetch(`${API_BASE_URL}/dashboard/metrics`).then(handleResponse),
  getCharts: () => fetch(`${API_BASE_URL}/dashboard/charts`).then(handleResponse),
}