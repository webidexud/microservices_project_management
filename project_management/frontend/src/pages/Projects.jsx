import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query" 
import { FileEdit } from "lucide-react" 
import ModificationsDialog from "@/components/ModificationsDialog" 
import { useNavigate } from "react-router-dom"
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  Calendar,
  DollarSign,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
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
import { formatCurrency, formatDate } from "@/lib/utils"
import { projectsApi } from "@/lib/api"

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [showModificationsDialog, setShowModificationsDialog] = useState(false)
  const [selectedProjectForModifications, setSelectedProjectForModifications] = useState(null)
  
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.getAll,
  })

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: (id) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      setShowDeleteDialog(false)
      setProjectToDelete(null)
    },
  })

  const handleDelete = (project) => {
    setProjectToDelete(project)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteMutation.mutate(projectToDelete.id)
    }
  }

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      "En ejecución": "bg-blue-100 text-blue-800 border-blue-300",
      "Por iniciar": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "Finalizado": "bg-green-100 text-green-800 border-green-300",
      "Suspendido": "bg-red-100 text-red-800 border-red-300",
      "Planeación": "bg-purple-100 text-purple-800 border-purple-300",
    }
    return statusClasses[status] || "bg-gray-100 text-gray-800 border-gray-300"
  }

  // 🔥 FILTROS CORREGIDOS - Usando 'name' como devuelve el backend
  const filteredProjects = projects?.filter((project) => {
    const matchesSearch =
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.entity?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // 🔥 ESTADÍSTICAS CORREGIDAS - Usando 'value' como devuelve el backend
  const stats = {
    total: projects?.length || 0,
    enEjecucion: projects?.filter(p => p.status === "En ejecución").length || 0,
    porIniciar: projects?.filter(p => p.status === "Por iniciar").length || 0,
    // 🔥 VALOR TOTAL CORREGIDO - el backend devuelve 'value' (no 'project_value')
    valorTotal: projects?.reduce((sum, p) => {
      const valor = parseFloat(p.value) || 0
      return sum + valor
    }, 0) || 0
  }

  // 🔥 DEBUG: Descomentar para ver los datos en consola
  // console.log('Projects data:', projects)
  // console.log('Stats calculadas:', stats)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Cargando proyectos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Proyectos</h1>
          <p className="text-text-secondary mt-1">
            Administra y da seguimiento a todos los proyectos de extensión
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => navigate('/projects/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder="Buscar por nombre, código o entidad..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="En ejecución">En ejecución</option>
              <option value="Por iniciar">Por iniciar</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Suspendido">Suspendido</option>
              <option value="Planeación">Planeación</option>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Más filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 🔥 Stats Cards CORREGIDAS */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Proyectos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">En Ejecución</p>
                <p className="text-2xl font-bold">{stats.enEjecucion}</p>
              </div>
              <Calendar className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Por Iniciar</p>
                <p className="text-2xl font-bold">{stats.porIniciar}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Valor Total</p>
                <p className="text-xl font-bold">
                  {formatCurrency(stats.valorTotal)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Proyectos */}
      <Card>
        <CardHeader>
          <CardTitle>
            Listado de Proyectos ({filteredProjects?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProjects && filteredProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre del Proyecto</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.code}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {project.name}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {project.entity}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(project.status)}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(project.value)}</TableCell>
                      <TableCell>{formatDate(project.start_date)}</TableCell>
                      <TableCell>{formatDate(project.end_date)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/projects/view/${project.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/projects/edit/${project.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProjectForModifications(project)
                              setShowModificationsDialog(true)
                            }}
                          >
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(project)}
                            className="text-danger hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary">No se encontraron proyectos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmación de Eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el proyecto{" "}
              <span className="font-semibold">{projectToDelete?.name}</span>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Modificaciones */}
      {selectedProjectForModifications && (
        <ModificationsDialog
          open={showModificationsDialog}
          onOpenChange={setShowModificationsDialog}
          project={selectedProjectForModifications}
        />
      )}
    </div>
  )
}