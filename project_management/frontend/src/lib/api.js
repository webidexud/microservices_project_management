const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Error en la petición')
  }
  return response.json()
}

// Códigos RUP
export const rupCodesApi = {
  // Obtener todos los códigos RUP activos
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/rup-codes`)
    return handleResponse(response)
  },

  // Obtener códigos RUP asignados a un proyecto
  getByProject: async (projectYear, projectNumber) => {
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectYear}/${projectNumber}/rup-codes`
    )
    return handleResponse(response)
  },

  // Asignar códigos RUP a un proyecto
  assignToProject: async (projectYear, projectNumber, rupCodes) => {
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectYear}/${projectNumber}/rup-codes`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rup_codes: rupCodes }),
      }
    )
    return handleResponse(response)
  },

  // Eliminar un código RUP de un proyecto
  remove: async (id) => {
    const response = await fetch(`${API_BASE_URL}/project-rup-codes/${id}`, {
      method: 'DELETE',
    })
    return handleResponse(response)
  },
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

// Reportes
export const reportsApi = {
  get: (params) => {
    const queryString = new URLSearchParams(params).toString()
    return fetch(`${API_BASE_URL}/reports?${queryString}`).then(handleResponse)
  },
  exportPDF: (params) => {
    const queryString = new URLSearchParams(params).toString()
    return fetch(`${API_BASE_URL}/reports/pdf?${queryString}`).then(response => response.blob())
  },
  exportExcel: (params) => {
    const queryString = new URLSearchParams(params).toString()
    return fetch(`${API_BASE_URL}/reports/excel?${queryString}`).then(response => response.blob())
  },
}

// Entidades (para selectores)
export const entitiesApi = {
  getAll: () => fetch(`${API_BASE_URL}/entities`).then(handleResponse),
  getActive: () => fetch(`${API_BASE_URL}/entities?active=true`).then(handleResponse),
}

// Dependencias (para selectores)
export const dependenciesApi = {
  getAll: () => fetch(`${API_BASE_URL}/dependencies`).then(handleResponse),
  getActive: () => fetch(`${API_BASE_URL}/dependencies?active=true`).then(handleResponse),
}

// Modificaciones
export const modificationsApi = {
  // Obtener modificaciones de un proyecto
  getByProject: (projectId) => 
    fetch(`${API_BASE_URL}/projects/${projectId}/modifications`)
      .then(handleResponse),
  
  // Obtener resumen de modificaciones
  getSummary: (projectId) =>
    fetch(`${API_BASE_URL}/projects/${projectId}/modifications/summary`)
      .then(handleResponse),
  
  // Crear modificación
  create: (projectId, data) => 
    fetch(`${API_BASE_URL}/projects/${projectId}/modifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  
  // Eliminar modificación
  delete: (id) => 
    fetch(`${API_BASE_URL}/modifications/${id}`, {
      method: 'DELETE'
    }).then(handleResponse),
}

// Estados (para selectores)
export const statesApi = {
  getAll: () => fetch(`${API_BASE_URL}/project-states`).then(handleResponse),
  getActive: () => fetch(`${API_BASE_URL}/project-states?active=true`).then(handleResponse),
}

// Tipos de proyecto (para selectores)
export const projectTypesApi = {
  getAll: () => fetch(`${API_BASE_URL}/project-types`).then(handleResponse),
  getActive: () => fetch(`${API_BASE_URL}/project-types?active=true`).then(handleResponse),
}

// Tipos de financiación (para selectores)
export const financingTypesApi = {
  getAll: () => fetch(`${API_BASE_URL}/financing-types`).then(handleResponse),
  getActive: () => fetch(`${API_BASE_URL}/financing-types?active=true`).then(handleResponse),
}

// Modalidades de ejecución (para selectores)
export const executionModalitiesApi = {
  getAll: () => fetch(`${API_BASE_URL}/execution-modalities`).then(handleResponse),
  getActive: () => fetch(`${API_BASE_URL}/execution-modalities?active=true`).then(handleResponse),
}

// Modalidades de contratación (para selectores)
export const contractingModalitiesApi = {
  getAll: () => fetch(`${API_BASE_URL}/contracting-modalities`).then(handleResponse),
  getActive: () => fetch(`${API_BASE_URL}/contracting-modalities?active=true`).then(handleResponse),
}

// Funcionarios ordenadores (para selectores)
export const officialsApi = {
  getAll: () => fetch(`${API_BASE_URL}/officials`).then(handleResponse),
  getActive: () => fetch(`${API_BASE_URL}/officials?active=true`).then(handleResponse),
}