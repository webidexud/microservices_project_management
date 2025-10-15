import { useState } from "react"
import { Save, User, Lock, Bell, Palette, Database, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile")
  const [formData, setFormData] = useState({
    name: "Usuario Admin",
    email: "admin@sistema.com",
    role: "Administrador",
    notifications: {
      email: true,
      system: true,
      projects: true,
    },
    theme: "light",
  })

  const tabs = [
    { id: "profile", name: "Perfil", icon: User },
    { id: "security", name: "Seguridad", icon: Lock },
    { id: "notifications", name: "Notificaciones", icon: Bell },
    { id: "appearance", name: "Apariencia", icon: Palette },
    { id: "system", name: "Sistema", icon: Database },
  ]

  const handleSave = () => {
    console.log("Guardando configuración:", formData)
    alert("Configuración guardada exitosamente")
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Información Personal
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Nombre Completo
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Correo Electrónico
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Rol</label>
                  <Input value={formData.role} disabled />
                  <p className="text-xs text-text-secondary mt-1">
                    El rol es asignado por el administrador del sistema
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Teléfono
                  </label>
                  <Input placeholder="3001234567" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Dependencia
                  </label>
                  <Select>
                    <option>Oficina de Extensión</option>
                    <option>Facultad de Ingeniería</option>
                    <option>Rectoría</option>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Foto de Perfil</h3>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary-soft flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    Cambiar Foto
                  </Button>
                  <p className="text-xs text-text-secondary mt-1">
                    JPG, PNG o GIF. Máximo 2MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Cambiar Contraseña</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Contraseña Actual
                  </label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Nueva Contraseña
                  </label>
                  <Input type="password" placeholder="••••••••" />
                  <p className="text-xs text-text-secondary mt-1">
                    Mínimo 8 caracteres, incluye mayúsculas, minúsculas y
                    números
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button>Actualizar Contraseña</Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Autenticación de Dos Factores
              </h3>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Autenticación 2FA</p>
                  <p className="text-sm text-text-secondary">
                    Agrega una capa adicional de seguridad
                  </p>
                </div>
                <Button variant="outline">Activar</Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Sesiones Activas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Windows • Chrome</p>
                    <p className="text-sm text-text-secondary">
                      Bogotá, Colombia • Ahora
                    </p>
                  </div>
                  <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
                    Actual
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Android • Chrome Mobile</p>
                    <p className="text-sm text-text-secondary">
                      Bogotá, Colombia • Hace 2 horas
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Preferencias de Notificaciones
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Notificaciones por Email</p>
                    <p className="text-sm text-text-secondary">
                      Recibe actualizaciones en tu correo
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.notifications.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notifications: {
                            ...formData.notifications,
                            email: e.target.checked,
                          },
                        })
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Notificaciones del Sistema</p>
                    <p className="text-sm text-text-secondary">
                      Alertas importantes dentro de la aplicación
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.notifications.system}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notifications: {
                            ...formData.notifications,
                            system: e.target.checked,
                          },
                        })
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Actualizaciones de Proyectos</p>
                    <p className="text-sm text-text-secondary">
                      Cambios en los proyectos que sigues
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.notifications.projects}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notifications: {
                            ...formData.notifications,
                            projects: e.target.checked,
                          },
                        })
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Frecuencia de Resúmenes
              </h3>
              <Select>
                <option>Diario</option>
                <option>Semanal</option>
                <option>Mensual</option>
                <option>Nunca</option>
              </Select>
            </div>
          </div>
        )

      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Tema</h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  className={`p-4 border-2 rounded-lg text-center ${
                    formData.theme === "light"
                      ? "border-primary bg-primary-very-light"
                      : "border-border"
                  }`}
                  onClick={() => setFormData({ ...formData, theme: "light" })}
                >
                  <div className="w-full h-20 bg-white rounded mb-2 border"></div>
                  <p className="font-medium">Claro</p>
                </button>
                <button
                  className={`p-4 border-2 rounded-lg text-center ${
                    formData.theme === "dark"
                      ? "border-primary bg-primary-very-light"
                      : "border-border"
                  }`}
                  onClick={() => setFormData({ ...formData, theme: "dark" })}
                >
                  <div className="w-full h-20 bg-gray-900 rounded mb-2"></div>
                  <p className="font-medium">Oscuro</p>
                </button>
                <button
                  className={`p-4 border-2 rounded-lg text-center ${
                    formData.theme === "auto"
                      ? "border-primary bg-primary-very-light"
                      : "border-border"
                  }`}
                  onClick={() => setFormData({ ...formData, theme: "auto" })}
                >
                  <div className="w-full h-20 bg-gradient-to-r from-white to-gray-900 rounded mb-2 border"></div>
                  <p className="font-medium">Automático</p>
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Tamaño de Fuente</h3>
              <Select>
                <option>Pequeño</option>
                <option>Mediano (Recomendado)</option>
                <option>Grande</option>
              </Select>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Idioma</h3>
              <Select>
                <option>Español (Colombia)</option>
                <option>English (US)</option>
                <option>Português (Brasil)</option>
              </Select>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Zona Horaria</h3>
              <Select>
                <option>GMT-5 (Bogotá, Lima, Quito)</option>
                <option>GMT-4 (Santiago, La Paz)</option>
                <option>GMT-3 (Buenos Aires, São Paulo)</option>
              </Select>
            </div>
          </div>
        )

      case "system":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Información del Sistema
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-text-secondary">Versión</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-text-secondary">Última Actualización</span>
                  <span className="font-medium">14 de Octubre, 2025</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-text-secondary">Base de Datos</span>
                  <span className="font-medium">PostgreSQL 15.2</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Mantenimiento</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Limpiar Caché
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Verificar Integridad
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Logs
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-danger">
                Zona de Peligro
              </h3>
              <div className="space-y-3">
                <div className="p-4 border-2 border-danger/20 rounded-lg">
                  <p className="font-medium mb-2">Restaurar Configuración</p>
                  <p className="text-sm text-text-secondary mb-3">
                    Volver a los valores predeterminados del sistema
                  </p>
                  <Button variant="outline" size="sm">
                    Restaurar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-text-secondary mt-1">
          Personaliza tu experiencia en el sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Tabs */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary text-white"
                          : "text-text-secondary hover:bg-primary-very-light hover:text-primary"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Contenido Principal */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              {renderContent()}

              <div className="mt-6 pt-6 border-t flex justify-end gap-3">
                <Button variant="outline">Cancelar</Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}