import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Contracts from './pages/Contracts'
import CreateProject from './pages/CreateProject'
import EditContract from './pages/EditContract'
import Catalogs from './pages/Catalogs'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Detalles from './pages/Detalles'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="contract" element={<Contracts />} />
            <Route path="contract/create" element={<CreateProject />} />
            <Route path="contract/edit/:id" element={<EditContract />} />
            <Route path="contract/details/:id" element={<Detalles />} />
            <Route path="catalogs/*" element={<Catalogs />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App