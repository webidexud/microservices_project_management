import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
import CreateProject from "./CreateProject"

// Mock data
const mockProjects = [
  {
    id: 1,
    code: "PRY-2025-001",
    name: "Modernización Sistema de Información",
    entity: "Ministerio de Educación",
    dependency: "Facultad de Ingeniería",
    type: "Consultoría",
    value: 250000000,
    status: "En ejecución",
    startDate: "2025-01-15",
    endDate: "2025-12-31",
    progress: 35,
  },
  {
    id: 2,
    code: "PRY-2025-002",
    name: "Capacitación Docente Virtual",
    entity: "Secretaría de Educación",
    dependency: "Facultad de Educación",
    type: "Capacitación",
    value: 150000000,
    status: "Por iniciar",
    startDate: "2025-02-01",
    endDate: "2025-11-15",
    progress: 0,
  },
  {
    id: 3,
    code: "PRY-2024-089",
    name: "Estudio de Movilidad Urbana",
    entity: "Alcaldía Mayor",
    dependency: "Facultad de Artes",
    type: "Investigación",
    value: 180000000,
    status: "En ejecución",
    startDate: "2024-08-10",
    endDate: "2025-10-30",
    progress: 65,
  },
]

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const queryClient = useQueryClient()

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => mockProjects,
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

  const handleCreateSuccess = (data) => {
    console.log("Proyecto creado:", data)
    // Aquí harías el POST a la API cuando esté lista
    // createMutation.mutate(data)
    alert("¡Proyecto creado exitosamente!")
    setShowCreateDialog(false)
    // Recargar lista de proyectos
    queryClient.invalidateQueries(["projects"])
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
          <Button onClick={() => setShowCreateDialog(true)}>
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
                      .length
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
                  {projects?.filter((p) => p.status === "Por iniciar").length}
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
                    projects?.reduce((sum, p) => sum + p.value, 0) || 0
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
              {filteredProjects?.map((project) => (
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
                  <TableCell>{formatDate(project.endDate)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewProject(project)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                  <p className="text-base">{selectedProject.dependency}</p>
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
                    {formatDate(selectedProject.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-secondary">
                    Fecha Fin
                  </p>
                  <p className="text-base">
                    {formatDate(selectedProject.endDate)}
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
                <div className="col-span-2">
                  <p className="text-sm font-medium text-text-secondary mb-2">
                    Progreso: {selectedProject.progress}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${selectedProject.progress}%` }}
                    ></div>
                  </div>
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
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar Proyecto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NUEVO: Componente CreateProject */}
      <CreateProject
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}