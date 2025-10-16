import { useState } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  FolderKanban,
  Database,
  BarChart3,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  User,
  ChevronDown,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import ThemeToggle from "./ThemeToggle"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "projects",
    label: "Proyectos",
    icon: FolderKanban,
    path: "/projects",
  },
  {
    id: "catalogs",
    label: "Catálogos",
    icon: Database,
    path: "/catalogs",
  },
  {
    id: "reports",
    label: "Reportes",
    icon: BarChart3,
    path: "/reports",
  },
  {
    id: "settings",
    label: "Configuración",
    icon: Settings,
    path: "/settings",
  },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-900 border-r border-border transition-all duration-300 lg:relative",
          sidebarCollapsed ? "lg:w-20" : "lg:w-64",
          sidebarOpen ? "w-64" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">GP</span>
              </div>
              <span className="font-bold text-lg">Gestión Proyectos</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.path)

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:bg-primary-very-light hover:text-primary",
                  sidebarCollapsed && "justify-center"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Usuario Admin</p>
                <p className="text-xs text-text-secondary truncate">admin@sistema.com</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-border flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input
                type="search"
                placeholder="Buscar proyectos..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
            </Button>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-border py-1">
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    <User className="h-4 w-4" />
                    Perfil
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Settings className="h-4 w-4" />
                    Configuración
                  </button>
                  <hr className="my-1 border-border" />
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-gray-100 dark:hover:bg-gray-700">
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}