import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import CreateProject from './pages/CreateProject'
import Catalogs from './pages/Catalogs'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import ConnectionTest from './pages/ConnectionTest'
import EditProject from './pages/EditProject'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
      staleTime: 0, // Sin caché
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
            <Route path="projects" element={<Projects />} />
            <Route path="projects/create" element={<CreateProject />} />
            <Route path="catalogs/*" element={<Catalogs />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="connection-test" element={<ConnectionTest />} />
            <Route path="projects/edit/:id" element={<EditProject />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App