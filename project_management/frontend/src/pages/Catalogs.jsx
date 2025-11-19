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
import { Input, Textarea } from "@/components/ui/input"
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
  { id: "dependencies", name: "Dependencias Ejecutoras", icon: Briefcase },
  { id: "project-types", name: "Tipos de Proyecto", icon: FileType },
  { id: "financing-types", name: "Tipos de Financiación", icon: CreditCard },
  { id: "execution-modalities", name: "Modalidades de Ejecución", icon: SettingsIcon },
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

  const filteredData = catalogData?.filter((item) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.nit?.toLowerCase().includes(searchLower) ||
      item.code?.toLowerCase().includes(searchLower) ||
      item.email?.toLowerCase().includes(searchLower)
    )
  })

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
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </>
        )
      case "dependencies":
        return (
          <>
            <TableHead>Nombre</TableHead>
            <TableHead>Sitio Web</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </>
        )
      case "project-states":
        return (
          <>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Orden</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </>
        )
      case "officials":
        return (
          <>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>Identificación</TableHead>
            <TableHead>Resolución</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </>
        )
      case "project-types":
        return (
          <>
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </>
        )
      case "financing-types":
        return (
          <>
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </>
        )
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
            <TableCell>{item.email || '-'}</TableCell>
            <TableCell>{item.phone || '-'}</TableCell>
            <TableCell>
              <Badge variant={item.active ? "success" : "neutral"}>
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
                    <PowerOff className="h-4 w-4 text-error" />
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
            <TableCell>{item.website || '-'}</TableCell>
            <TableCell>{item.email || '-'}</TableCell>
            <TableCell>{item.phone || '-'}</TableCell>
            <TableCell>
              <Badge variant={item.active ? "success" : "neutral"}>
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
                    <PowerOff className="h-4 w-4 text-error" />
                  ) : (
                    <Power className="h-4 w-4 text-success" />
                  )}
                </Button>
              </div>
            </TableCell>
          </>
        )
      case "project-states":
        return (
          <>
            <TableCell className="font-medium">{item.code}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs font-mono">{item.color}</span>
              </div>
            </TableCell>
            <TableCell>{item.order}</TableCell>
            <TableCell>
              <Badge variant={item.active ? "success" : "neutral"}>
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
                    <PowerOff className="h-4 w-4 text-error" />
                  ) : (
                    <Power className="h-4 w-4 text-success" />
                  )}
                </Button>
              </div>
            </TableCell>
          </>
        )
      case "officials":
        return (
          <>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              <div className="text-sm">
                <div className="font-medium">{item.identification_type}</div>
                <div className="text-neutral-500">{item.identification_number}</div>
              </div>
            </TableCell>
            <TableCell>{item.position || '-'}</TableCell>
            <TableCell>{item.email || '-'}</TableCell>
            <TableCell>
              <Badge variant={item.active ? "success" : "neutral"}>
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
                    <PowerOff className="h-4 w-4 text-error" />
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
        return (
          <>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              <Badge variant={item.active ? "success" : "neutral"}>
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
                    <PowerOff className="h-4 w-4 text-error" />
                  ) : (
                    <Power className="h-4 w-4 text-success" />
                  )}
                </Button>
              </div>
            </TableCell>
          </>
        )
      case "execution-modalities":
      case "contracting-modalities":
        return (
          <>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.description || '-'}</TableCell>
            <TableCell>
              <Badge variant={item.active ? "success" : "neutral"}>
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
                    <PowerOff className="h-4 w-4 text-error" />
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
              <Badge variant={item.active ? "success" : "neutral"}>
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
                    <PowerOff className="h-4 w-4 text-error" />
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
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
            {/* INFORMACIÓN BÁSICA */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Información Básica</h3>
              
              <div>
                <label className="text-sm font-medium block mb-2">
                  Nombre de la Entidad <span className="text-error">*</span>
                </label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nombre completo de la entidad"
                  required
                  maxLength={255}
                />
                <p className="text-xs text-right text-neutral-500 mt-1">
                  {(formData.name || "").length}/255
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    NIT <span className="text-error">*</span>
                  </label>
                  <Input
                    value={formData.nit || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, nit: e.target.value })
                    }
                    placeholder="000000000-0"
                    required
                    maxLength={100}
                  />
                  <p className="text-xs text-right text-neutral-500 mt-1">
                    {(formData.nit || "").length}/100
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Tipo de Entidad <span className="text-error">*</span>
                  </label>
                  <Select
                    value={formData.type || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option value="Public Entity">Entidad Pública</option>
                    <option value="Private Entity">Entidad Privada</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* INFORMACIÓN DE CONTACTO */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Información de Contacto</h3>
              
              <div>
                <label className="text-sm font-medium block mb-2">
                  Dirección Principal
                </label>
                <Input
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Dirección completa"
                  maxLength={200}
                />
                <p className="text-xs text-right text-neutral-500 mt-1">
                  {(formData.address || "").length}/200
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Teléfono Principal
                  </label>
                  <Input
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+57 (1) 234-5678"
                    maxLength={100}
                  />
                  <p className="text-xs text-right text-neutral-500 mt-1">
                    {(formData.phone || "").length}/100
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Email Institucional
                  </label>
                  <Input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="contacto@entidad.gov.co"
                    maxLength={200}
                  />
                  <p className="text-xs text-right text-neutral-500 mt-1">
                    {(formData.email || "").length}/200
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Sitio Web
                </label>
                <Input
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://www.entidad.gov.co"
                  maxLength={200}
                />
                <p className="text-xs text-right text-neutral-500 mt-1">
                  {(formData.website || "").length}/200
                </p>
              </div>
            </div>

            {/* PERSONA DE CONTACTO */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Persona de Contacto</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Nombre del Contacto
                  </label>
                  <Input
                    value={formData.contact_name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_name: e.target.value })
                    }
                    placeholder="Nombre completo"
                    maxLength={100}
                  />
                  <p className="text-xs text-right text-neutral-500 mt-1">
                    {(formData.contact_name || "").length}/100
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Cargo del Contacto
                  </label>
                  <Input
                    value={formData.contact_position || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_position: e.target.value })
                    }
                    placeholder="Director, Coordinador, etc."
                    maxLength={100}
                  />
                  <p className="text-xs text-right text-neutral-500 mt-1">
                    {(formData.contact_position || "").length}/100
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Teléfono del Contacto
                  </label>
                  <Input
                    value={formData.contact_phone_number || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_phone_number: e.target.value })
                    }
                    placeholder="+57 300 123 4567"
                    maxLength={50}
                  />
                  <p className="text-xs text-right text-neutral-500 mt-1">
                    {(formData.contact_phone_number || "").length}/50
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Email del Contacto
                  </label>
                  <Input
                    type="email"
                    value={formData.contact_email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_email: e.target.value })
                    }
                    placeholder="contacto@entidad.gov.co"
                    maxLength={200}
                  />
                  <p className="text-xs text-right text-neutral-500 mt-1">
                    {(formData.contact_email || "").length}/200
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case "dependencies":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                Nombre de la Dependencia <span className="text-error">*</span>
              </label>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nombre de la dependencia ejecutora"
                required
                maxLength={200}
              />
              <p className="text-xs text-right text-neutral-500 mt-1">
                {(formData.name || "").length}/200
              </p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Sitio Web
              </label>
              <Input
                type="url"
                value={formData.website || ""}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://dependencia.udistrital.edu.co"
                maxLength={200}
              />
              <p className="text-xs text-right text-neutral-500 mt-1">
                {(formData.website || "").length}/200
              </p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Dirección
              </label>
              <Input
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Dirección de la dependencia"
                maxLength={200}
              />
              <p className="text-xs text-right text-neutral-500 mt-1">
                {(formData.address || "").length}/200
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Teléfono
                </label>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+57 (1) 323-9300 Ext. 1234"
                  maxLength={50}
                />
                <p className="text-xs text-right text-neutral-500 mt-1">
                  {(formData.phone || "").length}/50
                </p>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="dependencia@udistrital.edu.co"
                  maxLength={100}
                />
                <p className="text-xs text-right text-neutral-500 mt-1">
                  {(formData.email || "").length}/100
                </p>
              </div>
            </div>
          </div>
        )

      case "project-types":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                Nombre del Tipo <span className="text-error">*</span>
              </label>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nombre del tipo de proyecto"
                required
                maxLength={100}
              />
              <p className="text-xs text-right text-neutral-500 mt-1">
                {(formData.name || "").length}/100
              </p>
            </div>
          </div>
        )

      case "financing-types":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                Nombre del Tipo <span className="text-error">*</span>
              </label>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nombre del tipo de financiación"
                required
                maxLength={100}
              />
              <p className="text-xs text-right text-neutral-500 mt-1">
                {(formData.name || "").length}/100
              </p>
            </div>
          </div>
        )

      case "execution-modalities":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                Nombre de la Modalidad <span className="text-error">*</span>
              </label>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nombre de la modalidad de ejecución"
                required
                maxLength={100}
              />
              <p className="text-xs text-right text-neutral-500 mt-1">
                {(formData.name || "").length}/100
              </p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">
                Descripción
              </label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción de la modalidad"
                rows={3}
              />
              <p className="text-xs text-right text-neutral-500 mt-1">
                {(formData.description || "").length} caracteres
              </p>
            </div>
          </div>
        )
      case "project-states":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Código del Estado <span className="text-error">*</span>
                </label>
                <Input
                  value={formData.code || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="ACTIVE, PENDING, etc."
                  required
                  maxLength={10}
                />
                <p className="text-xs text-right text-neutral-500 mt-1">
                  {(formData.code || "").length}/10
                </p>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Orden de Visualización <span className="text-error">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.order || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, order: e.target.value })
                  }
                  placeholder="1"
                  required
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Nombre del Estado <span className="text-error">*</span>
              </label>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nombre descriptivo del estado"
                required
                maxLength={100}
              />
              <p className="text-xs text-right text-neutral-500 mt-1">
                {(formData.name || "").length}/100
              </p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Color (Hexadecimal) <span className="text-error">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  value={formData.color || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="#4CAF50"
                  required
                  maxLength={7}
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
                <input
                  type="color"
                  value={formData.color || "#4CAF50"}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-16 h-10 rounded border cursor-pointer"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Formato: #RRGGBB (ej: #4CAF50) - {(formData.color || "").length}/7
              </p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Descripción
              </label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción del estado del proyecto"
                rows={3}
              />
              <p className="text-xs text-right text-neutral-500 mt-1">
                {(formData.description || "").length} caracteres
              </p>
            </div>
          </div>
        )

      case "officials":
        return (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
            {/* NOMBRES */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Nombres y Apellidos</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Primer Nombre <span className="text-error">*</span>
                  </label>
                  <Input
                    value={formData.first_name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    placeholder="Primer nombre"
                    required
                    maxLength={50}
                  />
                  <p className="text-xs text-right text-neutral-500 mt-1">
                    {(formData.first_name || "").length}/50
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Segundo Nombre
                  </label>
                  <Input
                    value={formData.second_name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, second_name: e.target.value })
                    }
                    placeholder="Segundo nombre (opcional)"
                    maxLength={50}
                  />
                  <p className="text-xs text-right text-neutral-500 mt-1">
                    {(formData.second_name || "").length}/50
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Primer Apellido <span className="text-error">*</span>
                  </label>
                  <Input
                    value={formData.first_surname || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, first_surname: e.target.value })
                    }
                    placeholder="Primer apellido"
                    required
                    maxLength={50}
                  />
                  <p className="text-xs text-right text-neutral-500 mt-1">
                    {(formData.first_surname || "").length}/50
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Segundo Apellido
                  </label>
                  <Input
                    value={formData.second_surname || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, second_surname: e.target.value })
                    }
                    placeholder="Segundo apellido (opcional)"
                    maxLength={50}
                  />
                  <p className="text-xs text-right text-neutral-500 mt-1">
                    {(formData.second_surname || "").length}/50
                  </p>
                </div>
              </div>
            </div>

            {/* IDENTIFICACIÓN */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Identificación</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Tipo de Identificación <span className="text-error">*</span>
                  </label>
                  <Select
                    value={formData.identification_type || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, identification_type: e.target.value })
                    }
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="TI">Tarjeta de Identidad (TI)</option>
                    <option value="PP">Pasaporte (PP)</option>
                    <option value="NIT">NIT</option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Número de Identificación <span className="text-error">*</span>
                  </label>
                  <Input
                    value={formData.identification_number || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, identification_number: e.target.value })
                    }
                    placeholder="00000000"
                    required
                    maxLength={20}
                  />
                  <p className="text-xs text-right text-neutral-500 mt-1">
                    {(formData.identification_number || "").length}/20
                  </p>
                </div>
              </div>
            </div>

            {/* NOMBRAMIENTO */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Nombramiento</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Resolución de Nombramiento
                  </label>
                  <Input
                    value={formData.position || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    placeholder="Resolución 001-2024"
                    maxLength={50}
                  />
                  <p className="text-xs text-right text-neutral-500 mt-1">
                    {(formData.position || "").length}/50
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Fecha de Resolución
                  </label>
                  <Input
                    type="date"
                    value={formData.resolution_date || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, resolution_date: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* CONTACTO */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Información de Contacto</h3>
              
              <div>
                <label className="text-sm font-medium block mb-2">
                  Email Institucional
                </label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="funcionario@udistrital.edu.co"
                  maxLength={200}
                />
                <p className="text-xs text-right text-neutral-500 mt-1">
                  {(formData.email || "").length}/200
                </p>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Teléfono
                </label>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+57 (1) 323-9300 Ext. 1001"
                  maxLength={50}
                />
                <p className="text-xs text-right text-neutral-500 mt-1">
                  {(formData.phone || "").length}/50
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
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
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
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
                  ? "border-primary bg-primary-50 dark:bg-primary-950"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-primary"
              }`}
            >
              <Icon
                className={`h-6 w-6 mx-auto mb-2 ${
                  activeCatalog === catalog.id
                    ? "text-primary"
                    : "text-neutral-500"
                }`}
              />
              <p
                className={`text-xs font-medium text-center ${
                  activeCatalog === catalog.id
                    ? "text-primary"
                    : "text-neutral-600 dark:text-neutral-400"
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
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
            <div className="py-12 text-center text-neutral-500">
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
        <DialogContent className="max-w-2xl" onClose={() => setShowCreateDialog(false)}>
          <DialogHeader>
            <DialogTitle>Crear {activeCatalogInfo?.name}</DialogTitle>
            <DialogDescription>
              Complete la información requerida. Los campos marcados con * son obligatorios.
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
        <DialogContent className="max-w-2xl" onClose={() => setShowEditDialog(false)}>
          <DialogHeader>
            <DialogTitle>Editar {activeCatalogInfo?.name}</DialogTitle>
            <DialogDescription>
              Modifique la información necesaria. Los campos marcados con * son obligatorios.
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