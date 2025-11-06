import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  X,
  Plus,
  DollarSign,
  Calendar,
  FileEdit,
  Trash2,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { modificationsApi } from "@/lib/api"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function ModificationsDialog({ project, open, onClose }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    modification_type: "ADDITION",
    addition_value: "",
    extension_days: "",
    new_end_date: "",
    justification: "",
    administrative_act: "",
    approval_date: "",
  })

  const queryClient = useQueryClient()
  const projectId = project?.id || project?.project_id

  // Cargar modificaciones
  const { data: modifications, isLoading } = useQuery({
    queryKey: ["modifications", projectId],
    queryFn: () => modificationsApi.getByProject(projectId),
    enabled: !!projectId && open,
  })

  // Cargar resumen
  const { data: summary } = useQuery({
    queryKey: ["modifications-summary", projectId],
    queryFn: () => modificationsApi.getSummary(projectId),
    enabled: !!projectId && open,
  })

  // Mutación para crear modificación
  const createMutation = useMutation({
    mutationFn: (data) => modificationsApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modifications", projectId] })
      queryClient.invalidateQueries({ queryKey: ["modifications-summary", projectId] })
      setShowForm(false)
      resetForm()
      alert("Modificación creada exitosamente")
    },
    onError: (error) => {
      alert("Error al crear modificación: " + error.message)
    },
  })

  // Mutación para eliminar modificación
  const deleteMutation = useMutation({
    mutationFn: (id) => modificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modifications", projectId] })
      queryClient.invalidateQueries({ queryKey: ["modifications-summary", projectId] })
      alert("Modificación eliminada exitosamente")
    },
    onError: (error) => {
      alert("Error al eliminar modificación: " + error.message)
    },
  })

  const resetForm = () => {
    setFormData({
      modification_type: "ADDITION",
      addition_value: "",
      extension_days: "",
      new_end_date: "",
      justification: "",
      administrative_act: "",
      approval_date: "",
    })
  }

  // Calcular nueva fecha al cambiar días de extensión
  useEffect(() => {
    if (formData.extension_days && project?.end_date) {
      const currentEndDate = new Date(project.end_date)
      const days = parseInt(formData.extension_days)
      if (!isNaN(days) && days > 0) {
        const newDate = new Date(currentEndDate)
        newDate.setDate(newDate.getDate() + days)
        const formattedDate = newDate.toISOString().split('T')[0]
        setFormData(prev => ({ ...prev, new_end_date: formattedDate }))
      }
    }
  }, [formData.extension_days, project?.end_date])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNumberInput = (e) => {
    const { name, value } = e.target
    const cleanValue = value.replace(/\D/g, "")
    setFormData(prev => ({ ...prev, [name]: cleanValue }))
  }

  const formatNumber = (value) => {
    if (!value) return ""
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const cleanNumber = (value) => {
    if (!value) return 0
    return parseFloat(value.toString().replace(/\./g, "")) || 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validaciones
    if (!formData.justification.trim()) {
      alert("La justificación es obligatoria")
      return
    }
    
    if (formData.modification_type === "ADDITION" && !formData.addition_value) {
      alert("El valor de adición es obligatorio")
      return
    }
    
    if (formData.modification_type === "EXTENSION" && (!formData.extension_days || !formData.new_end_date)) {
      alert("Los días de extensión y la nueva fecha son obligatorios")
      return
    }
    
    if (formData.modification_type === "BOTH" && (!formData.addition_value || !formData.extension_days || !formData.new_end_date)) {
      alert("Todos los campos son obligatorios para modificaciones tipo AMBAS")
      return
    }
    
    const datos = {
      modification_type: formData.modification_type,
      addition_value: formData.addition_value ? cleanNumber(formData.addition_value) : null,
      extension_days: formData.extension_days ? parseInt(formData.extension_days) : null,
      new_end_date: formData.new_end_date || null,
      justification: formData.justification,
      administrative_act: formData.administrative_act || null,
      approval_date: formData.approval_date || null,
    }
    
    createMutation.mutate(datos)
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "ADDITION":
        return <DollarSign className="h-4 w-4" />
      case "EXTENSION":
        return <Calendar className="h-4 w-4" />
      case "BOTH":
        return <TrendingUp className="h-4 w-4" />
      default:
        return null
    }
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case "ADDITION":
        return <Badge variant="success">Adición</Badge>
      case "EXTENSION":
        return <Badge variant="info">Prórroga</Badge>
      case "BOTH":
        return <Badge variant="warning">Adición y Prórroga</Badge>
      default:
        return null
    }
  }

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Modificaciones - {project.code}
          </DialogTitle>
        </DialogHeader>

        {/* Resumen */}
        {summary && modifications && modifications.length > 0 && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Modificaciones</p>
              <p className="text-2xl font-bold">{summary.total_modifications}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Adiciones Acumuladas</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.total_additions)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Extensión Total</p>
              <p className="text-2xl font-bold text-blue-600">
                {summary.total_extension_days} días
              </p>
            </div>
          </div>
        )}

        {/* Botón Agregar */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Modificación
          </Button>
        )}

        {/* Formulario */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Nueva Modificación</h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Tipo de Modificación */}
            <div>
              <label className="text-sm font-medium block mb-2">
                Tipo de Modificación <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center space-x-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="modification_type"
                    value="ADDITION"
                    checked={formData.modification_type === "ADDITION"}
                    onChange={handleInputChange}
                  />
                  <DollarSign className="h-4 w-4" />
                  <span>Adición</span>
                </label>
                <label className="flex items-center space-x-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="modification_type"
                    value="EXTENSION"
                    checked={formData.modification_type === "EXTENSION"}
                    onChange={handleInputChange}
                  />
                  <Calendar className="h-4 w-4" />
                  <span>Prórroga</span>
                </label>
                <label className="flex items-center space-x-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="modification_type"
                    value="BOTH"
                    checked={formData.modification_type === "BOTH"}
                    onChange={handleInputChange}
                  />
                  <TrendingUp className="h-4 w-4" />
                  <span>Ambas</span>
                </label>
              </div>
            </div>

            {/* Campos de Adición */}
            {(formData.modification_type === "ADDITION" || formData.modification_type === "BOTH") && (
              <div className="space-y-3 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <h4 className="font-medium text-green-800 dark:text-green-200">Datos de Adición</h4>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Valor de Adición (COP) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="addition_value"
                    value={formatNumber(formData.addition_value)}
                    onChange={handleNumberInput}
                    placeholder="150.000.000"
                    required={formData.modification_type === "ADDITION" || formData.modification_type === "BOTH"}
                  />
                </div>
              </div>
            )}

            {/* Campos de Prórroga */}
            {(formData.modification_type === "EXTENSION" || formData.modification_type === "BOTH") && (
              <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Datos de Prórroga</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Días de Extensión <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      name="extension_days"
                      value={formData.extension_days}
                      onChange={handleInputChange}
                      placeholder="90"
                      min="1"
                      required={formData.modification_type === "EXTENSION" || formData.modification_type === "BOTH"}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Nueva Fecha Fin <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      name="new_end_date"
                      value={formData.new_end_date}
                      onChange={handleInputChange}
                      required={formData.modification_type === "EXTENSION" || formData.modification_type === "BOTH"}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Justificación */}
            <div>
              <label className="text-sm font-medium block mb-2">
                Justificación <span className="text-red-500">*</span>
              </label>
              <textarea
                name="justification"
                value={formData.justification}
                onChange={handleInputChange}
                className="w-full min-h-[100px] px-3 py-2 border rounded-lg"
                placeholder="Describa la justificación para esta modificación..."
                required
              />
            </div>

            {/* Campos Opcionales */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Acto Administrativo
                </label>
                <Input
                  name="administrative_act"
                  value={formData.administrative_act}
                  onChange={handleInputChange}
                  placeholder="Resolución 123-2024"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Fecha de Aprobación
                </label>
                <Input
                  type="date"
                  name="approval_date"
                  value={formData.approval_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Guardando..." : "Guardar Modificación"}
              </Button>
            </div>
          </form>
        )}

        {/* Lista de Modificaciones */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Historial de Modificaciones</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : modifications && modifications.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Detalles</TableHead>
                    <TableHead>Justificación</TableHead>
                    <TableHead>Fecha Aprobación</TableHead>
                    <TableHead className="w-20">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modifications.map((mod) => (
                    <TableRow key={mod.id}>
                      <TableCell className="font-medium">#{mod.number}</TableCell>
                      <TableCell>{getTypeBadge(mod.type)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {(mod.type === "ADDITION" || mod.type === "BOTH") && (
                            <div className="flex items-center gap-1 text-green-600">
                              <DollarSign className="h-3 w-3" />
                              <span className="text-sm">+{formatCurrency(mod.addition_value)}</span>
                            </div>
                          )}
                          {(mod.type === "EXTENSION" || mod.type === "BOTH") && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm">+{mod.extension_days} días → {formatDate(mod.new_end_date)}</span>
                            </div>
                          )}
                          {mod.administrative_act && (
                            <div className="text-xs text-gray-500">{mod.administrative_act}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm line-clamp-2">{mod.justification}</p>
                      </TableCell>
                      <TableCell>
                        {mod.approval_date ? formatDate(mod.approval_date) : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("¿Está seguro de eliminar esta modificación?")) {
                              deleteMutation.mutate(mod.id)
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay modificaciones registradas</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded flex items-start gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800 dark:text-blue-200">Nota Importante</p>
            <p className="text-blue-700 dark:text-blue-300">
              Las modificaciones NO cambian el valor ni las fechas originales del proyecto.
              Solo registran cambios históricos para trazabilidad.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}