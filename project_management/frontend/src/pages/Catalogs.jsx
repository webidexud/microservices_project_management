import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus,
  Search,
  Edit,
  Power,
  PowerOff,
  Building2,
  Briefcase,
  FileType,
  CreditCard,
  Settings as SettingsIcon,
  Users,
  Tag,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { catalogsApi } from "@/lib/api"

const catalogTypes = [
  { id: "entities", name: "Entidades", icon: Building2 },
  { id: "dependencies", name: "Dependencias", icon: Briefcase },
  { id: "project-types", name: "Tipos de Proyecto", icon: FileType },
  { id: "financing-types", name: "Tipos de Financiación", icon: CreditCard },
  { id: "execution-modalities", name: "Modalidades de Ejecución", icon: SettingsIcon },
  { id: "contracting-modalities", name: "Modalidades de Contratación", icon: Tag },
  { id: "project-states", name: "Estados de Proyecto", icon: MapPin },
  { id: "officials", name: "Funcionarios Ordenadores", icon: Users },
]

export default function Catalogs() {
  const [activeCatalog, setActiveCatalog] = useState("entities")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({})
  const queryClient = useQueryClient()

  const { data: catalogData, isLoading } = useQuery({
    queryKey: ["catalog", activeCatalog],
    queryFn: () => catalogsApi.get(activeCatalog),
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => catalogsApi.toggle(activeCatalog, id),
    onSuccess: () => {
      queryClient.invalidateQueries(["catalog", activeCatalog])
    },
  })

  const createMutation = useMutation({
    mutationFn: (data) => catalogsApi.create(activeCatalog, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["catalog", activeCatalog])
      setShowCreateDialog(false)
      setFormData({})
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => catalogsApi.update(activeCatalog, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["catalog", activeCatalog])
      setShowEditDialog(false)
      setSelectedItem(null)
      setFormData({})
    },
  })

  const filteredData = catalogData?.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (item) => {
    setSelectedItem(item)
    setFormData(item)
    setShowEditDialog(true)
  }

  const handleToggleActive = async (item) => {
    toggleMutation.mutate(item.id)
  }

  const handleCreate = () => {
    setFormData({})
    setShowCreateDialog(true)
  }

  const handleSave = async () => {
    if (showEditDialog && selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const renderTableHeaders = () => {
    switch (activeCatalog) {
      case "entities":
        return (
          <>
            <TableHead>Nombre</TableHead>
            <TableHead>NIT</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </>
        )
      case "dependencies":
        return (
          <>
            <TableHead>Nombre</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </>
        )
      case "project-types":
      case "financing-types":
      case "execution-modalities":
      case "contracting-modalities":
        return (
          <>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </>
        )
      default:
        return (
          <>
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </>
        )
    }
  }

  const renderTableRow = (item) => {
    switch (activeCatalog) {
      case "entities":
        return (
          <>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.nit}</TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>{item.contact}</TableCell>
            <TableCell>
              <Badge variant={item.active ? "success" : "default"}>
                {item.active ? "Activo" : "Inactivo"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(item)}
                  disabled={toggleMutation.isPending}
                >
                  {item.active ? (
                    <PowerOff className="h-4 w-4 text-danger" />
                  ) : (
                    <Power className="h-4 w-4 text-success" />
                  )}
                </Button>
              </div>
            </TableCell>
          </>
        )
      case "dependencies":
        return (
          <>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.code}</TableCell>
            <TableCell>
              <Badge variant={item.active ? "success" : "default"}>
                {item.active ? "Activo" : "Inactivo"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(item)}
                  disabled={toggleMutation.isPending}
                >
                  {item.active ? (
                    <PowerOff className="h-4 w-4 text-danger" />
                  ) : (
                    <Power className="h-4 w-4 text-success" />
                  )}
                </Button>
              </div>
            </TableCell>
          </>
        )
      case "project-types":
      case "financing-types":
      case "execution-modalities":
      case "contracting-modalities":
        return (
          <>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.description}</TableCell>
            <TableCell>
              <Badge variant={item.active ? "success" : "default"}>
                {item.active ? "Activo" : "Inactivo"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(item)}
                  disabled={toggleMutation.isPending}
                >
                  {item.active ? (
                    <PowerOff className="h-4 w-4 text-danger" />
                  ) : (
                    <Power className="h-4 w-4 text-success" />
                  )}
                </Button>
              </div>
            </TableCell>
          </>
        )
      default:
        return (
          <>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              <Badge variant={item.active ? "success" : "default"}>
                {item.active ? "Activo" : "Inactivo"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(item)}
                  disabled={toggleMutation.isPending}
                >
                  {item.active ? (
                    <PowerOff className="h-4 w-4 text-danger" />
                  ) : (
                    <Power className="h-4 w-4 text-success" />
                  )}
                </Button>
              </div>
            </TableCell>
          </>
        )
    }
  }

  const renderForm = () => {
    switch (activeCatalog) {
      case "entities":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nombre de la entidad"
              />
            </div>
            <div>
              <label className="text-sm font-medium">NIT</label>
              <Input
                value={formData.nit || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nit: e.target.value })
                }
                placeholder="000000000-0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={formData.type || ""}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="">Seleccione un tipo</option>
                <option value="Entidad Pública">Entidad Pública</option>
                <option value="Entidad Privada">Entidad Privada</option>
                <option value="Mixta">Mixta</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Contacto</label>
              <Input
                type="email"
                value={formData.contact || ""}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                placeholder="correo@entidad.com"
              />
            </div>
          </div>
        )
      case "dependencies":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nombre de la dependencia"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Código</label>
              <Input
                value={formData.code || ""}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Código único"
              />
            </div>
          </div>
        )
      case "project-types":
      case "financing-types":
      case "execution-modalities":
      case "contracting-modalities":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nombre del tipo"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <Input
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción breve"
              />
            </div>
          </div>
        )
      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nombre"
              />
            </div>
          </div>
        )
    }
  }

  const activeCatalogInfo = catalogTypes.find((c) => c.id === activeCatalog)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Catálogos</h1>
        <p className="text-text-secondary mt-1">
          Gestión de datos maestros del sistema
        </p>
      </div>

      {/* Selector de Catálogo */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {catalogTypes.map((catalog) => {
          const Icon = catalog.icon
          return (
            <button
              key={catalog.id}
              onClick={() => setActiveCatalog(catalog.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                activeCatalog === catalog.id
                  ? "border-primary bg-primary-very-light"
                  : "border-border hover:border-primary-light"
              }`}
            >
              <Icon
                className={`h-6 w-6 mx-auto mb-2 ${
                  activeCatalog === catalog.id
                    ? "text-primary"
                    : "text-text-secondary"
                }`}
              />
              <p
                className={`text-xs font-medium text-center ${
                  activeCatalog === catalog.id
                    ? "text-primary"
                    : "text-text-secondary"
                }`}
              >
                {catalog.name}
              </p>
            </button>
          )
        })}
      </div>

      {/* Barra de acciones */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder="Buscar..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {activeCatalogInfo && <activeCatalogInfo.icon className="h-5 w-5" />}
            {activeCatalogInfo?.name} ({filteredData?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData && filteredData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>{renderTableHeaders()}</TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>{renderTableRow(item)}</TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-text-secondary">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay registros disponibles</p>
              <p className="text-sm mt-2">
                {searchTerm 
                  ? "No se encontraron registros con el término de búsqueda"
                  : "Crea el primer registro para comenzar"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Crear */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent onClose={() => setShowCreateDialog(false)}>
          <DialogHeader>
            <DialogTitle>Crear {activeCatalogInfo?.name}</DialogTitle>
            <DialogDescription>
              Complete la información requerida
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent onClose={() => setShowEditDialog(false)}>
          <DialogHeader>
            <DialogTitle>Editar {activeCatalogInfo?.name}</DialogTitle>
            <DialogDescription>
              Modifique la información necesaria
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Actualizando..." : "Actualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}