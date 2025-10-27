import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query" // ✅ FALTABA useMutation y useQueryClient
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
  
  const navigate = useNavigate()
  const queryClient = useQueryClient() // ✅ Moverlo después de los estados

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.getAll,
  })

  // ✅ Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: (id) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      setShowDeleteDialog(false)
      setProjectToDelete(null)
      alert("Proyecto deshabilitado exitosamente")
    },
    onError: (error) => {
      alert("Error al deshabilitar el proyecto: " + error.message)
    },
  })

  const filteredProjects = projects?.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.entity.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    const colors = {
      "En ejecución": "info",
      "Por iniciar": "warning",
      Finalizado: "success",
      Suspendido: "danger",
    }
    return colors[status] || "default"
  }

  const handleViewProject = (project) => {
    setSelectedProject(project)
    setShowDetailDialog(true)
  }

  const handleEditProject = (project) => {
    navigate(`/projects/edit/${project.id}`)
  }

  const handleDeleteProject = (project) => {
    setProjectToDelete(project)
    setShowDeleteDialog(true)
  }

  // ✅ FALTABA esta función
  const confirmDelete = () => {
    if (projectToDelete) {
      deleteMutation.mutate(projectToDelete.id)
    }
  }

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Proyectos</h1>
          <p className="text-text-secondary mt-1">
            Gestión de proyectos de extensión
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
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Más filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Proyectos</p>
                <p className="text-2xl font-bold">{projects?.length || 0}</p>
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
                <p className="text-2xl font-bold">
                  {
                    projects?.filter((p) => p.status === "En ejecución")
                      .length || 0
                  }
                </p>
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
                <p className="text-2xl font-bold">
                  {projects?.filter((p) => p.status === "Por iniciar").length || 0}
                </p>
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
                  {formatCurrency(
                    projects?.reduce((sum, p) => sum + (p.value || 0), 0) || 0
                  )}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-text-secondary">
                          {project.type}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{project.entity}</TableCell>
                    <TableCell>{formatCurrency(project.value)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(project.end_date)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewProject(project)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {/* ✅ AGREGAR onClick */}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditProject(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* ✅ AGREGAR onClick */}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteProject(project)}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-text-secondary">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay proyectos disponibles</p>
              <p className="text-sm mt-2">
                {searchTerm || statusFilter !== "all" 
                  ? "No se encontraron proyectos con los filtros aplicados"
                  : "Crea tu primer proyecto para comenzar"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Detalle de Proyecto */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl" onClose={() => setShowDetailDialog(false)}>
          <DialogHeader>
            <DialogTitle>Detalle del Proyecto</DialogTitle>
            <DialogDescription>
              {selectedProject?.code} - {selectedProject?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-text-secondary">
                    Entidad
                  </p>
                  <p className="text-base">{selectedProject.entity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-secondary">
                    Dependencia
                  </p>
                  <p className="text-base">{selectedProject.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-secondary">
                    Tipo
                  </p>
                  <p className="text-base">{selectedProject.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-secondary">
                    Estado
                  </p>
                  <Badge variant={getStatusColor(selectedProject.status)}>
                    {selectedProject.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-secondary">
                    Fecha Inicio
                  </p>
                  <p className="text-base">
                    {formatDate(selectedProject.start_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-secondary">
                    Fecha Fin
                  </p>
                  <p className="text-base">
                    {formatDate(selectedProject.end_date)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-text-secondary">
                    Valor del Proyecto
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(selectedProject.value)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailDialog(false)}
            >
              Cerrar
            </Button>
            <Button onClick={() => handleEditProject(selectedProject)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Proyecto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ DIALOG DE CONFIRMACIÓN DE ELIMINACIÓN (FALTABA TODO ESTO) */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center">
              <Trash2 className="h-8 w-8 text-danger" />
            </div>
            <DialogTitle className="text-center text-xl">
              ¿Deshabilitar proyecto?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-text-secondary">
              ¿Estás seguro que deseas deshabilitar este proyecto?
            </p>
            {projectToDelete && (
              <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg space-y-2">
                <div>
                  <p className="text-xs text-text-secondary">Código</p>
                  <p className="font-semibold">{projectToDelete.code}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Nombre</p>
                  <p className="font-medium">{projectToDelete.name}</p>
                </div>
              </div>
            )}
            <div className="bg-warning/10 border border-warning/20 p-3 rounded-lg">
              <p className="text-sm text-warning-dark dark:text-warning-light">
                <strong>Nota:</strong> El proyecto no se eliminará permanentemente, solo se deshabilitará y dejará de aparecer en el listado activo.
              </p>
            </div>
          </div>
          <DialogFooter className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deshabilitando..." : "Sí, Deshabilitar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}