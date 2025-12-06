import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Edit,
  FileText,
  Calendar,
  DollarSign,
  Users,
  Building2,
  Briefcase,
  Clock,
  Mail,
  Link as LinkIcon,
  FileEdit,
  Info,
  Target,
  AlertCircle,
  Star,
  Plus,
  PlayCircle,
  FileX,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { formatCurrency, formatDate } from "@/lib/utils"
import { projectsApi, modificationsApi, rupCodesApi } from "@/lib/api"

export default function ProjectView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("general")
  const [expandedModification, setExpandedModification] = useState(null)

  // Cargar proyecto completo
  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.getById(id),
  })

  // Cargar modificaciones
  const { data: modifications } = useQuery({
    queryKey: ["modifications", id],
    queryFn: () => modificationsApi.getByProject(id),
    enabled: !!id,
  })

  // Cargar resumen de modificaciones
  const { data: modificationsSummary } = useQuery({
    queryKey: ["modifications-summary", id],
    queryFn: () => modificationsApi.getSummary(id),
    enabled: !!id,
  })

  // Cargar códigos RUP del proyecto
  const { data: projectRupCodes } = useQuery({
    queryKey: ["project-rup-codes", id],
    queryFn: () => {
      if (project) {
        return rupCodesApi.getByProject(
          project.project_year,
          project.internal_project_number
        )
      }
      return Promise.resolve([])
    },
    enabled: !!project,
  })

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Cargando proyecto...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-danger mx-auto mb-4" />
          <p className="text-lg font-medium">Proyecto no encontrado</p>
          <Button onClick={() => navigate("/projects")} className="mt-4">
            Volver a Proyectos
          </Button>
        </div>
      </div>
    )
  }

  // Calcular duración total (con prórrogas)
  const calculateTotalDuration = () => {
    const start = new Date(project.start_date)
    const finalEnd = new Date(project.final_end_date_with_extensions || project.end_date)
    const diffTime = Math.abs(finalEnd - start)
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const years = Math.floor(totalDays / 365)
    const months = Math.floor((totalDays % 365) / 30)
    const days = (totalDays % 365) % 30
    
    return { years, months, days, totalDays }
  }

  const duration = calculateTotalDuration()
  const totalExtensionDays = project.total_extension_days || 0

  // Calcular progreso
  const calculateProgress = () => {
    if (!project.start_date || !project.final_end_date_with_extensions) return 0
    
    const start = new Date(project.start_date)
    const end = new Date(project.final_end_date_with_extensions)
    const today = new Date()
    
    if (today < start) return 0
    if (today > end) return 100
    
    const total = end - start
    const elapsed = today - start
    return Math.round((elapsed / total) * 100)
  }

  const progress = calculateProgress()

  const getStatusColor = (status) => {
    const colors = {
      "In Progress": "info",
      "Completed": "success",
      "Por iniciar": "warning",
      "Finalizado": "success",
      "Suspendido": "danger",
    }
    return colors[status] || "default"
  }

  const getModificationIcon = (type) => {
    const icons = {
      ADDITION: DollarSign,
      EXTENSION: Clock,
      BOTH: Plus,
      SUSPENSION: AlertCircle,
      RESTART: PlayCircle,
      LIQUIDATION: FileX,
      ASSIGNMENT: RefreshCw,
      MODIFICATION: FileEdit,
    }
    return icons[type] || FileEdit
  }

  const getModificationColor = (type) => {
    const colors = {
      ADDITION: "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
      EXTENSION: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
      BOTH: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800",
      SUSPENSION: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
      RESTART: "text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800",
      LIQUIDATION: "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
      ASSIGNMENT: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800",
      MODIFICATION: "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
    }
    return colors[type] || "text-gray-600 bg-gray-50 border-gray-200"
  }

  const getModificationLabel = (type) => {
    const labels = {
      ADDITION: "Adición Presupuestal",
      EXTENSION: "Prórroga",
      BOTH: "Adición y Prórroga",
      SUSPENSION: "Suspensión",
      RESTART: "Reinicio",
      LIQUIDATION: "Liquidación",
      ASSIGNMENT: "Cesión",
      MODIFICATION: "Modificación de Cláusulas",
    }
    return labels[type] || type
  }

  const toggleExpand = (modId) => {
    setExpandedModification(expandedModification === modId ? null : modId)
  }

  const tabs = [
    { id: "general", label: "Información General", icon: FileText },
    { id: "financial", label: "Información Financiera", icon: DollarSign },
    { id: "rup", label: "Códigos RUP", icon: Target },
    { id: "modifications", label: "Modificaciones", icon: FileEdit },
    { id: "timeline", label: "Línea de Tiempo", icon: Calendar },
  ]

  // Crear eventos de timeline ordenados de más reciente a más antiguo
// Crear eventos de timeline ordenados de más reciente a más antiguo
const createTimelineEvents = () => {
  const events = []
  
  // Agregar suscripción
  if (project.subscription_date) {
    events.push({
      date: new Date(project.subscription_date),
      type: 'subscription',
      title: 'Suscripción del Proyecto',
      icon: FileText,
      color: 'info',
      description: formatDate(project.subscription_date)
    })
  }
  
  // Agregar inicio
  events.push({
    date: new Date(project.start_date),
    type: 'start',
    title: 'Inicio del Proyecto',
    icon: Calendar,
    color: 'success',
    description: formatDate(project.start_date)
  })
  
  // Agregar modificaciones - USAR FECHA DE APROBACIÓN O FECHA DEL ACTA
  if (modifications && modifications.length > 0) {
    modifications.forEach(mod => {
      // Prioridad de fechas: approval_date > fecha específica del tipo > created_at
      let eventDate = null
      
      // Para cada tipo de modificación, usar su fecha específica
      if (mod.approval_date) {
        eventDate = new Date(mod.approval_date)
      } else if (mod.type === 'SUSPENSION' && mod.suspension_start_date) {
        eventDate = new Date(mod.suspension_start_date)
      } else if (mod.type === 'RESTART' && mod.restart_date) {
        eventDate = new Date(mod.restart_date)
      } else if (mod.type === 'LIQUIDATION' && mod.liquidation_date) {
        eventDate = new Date(mod.liquidation_date)
      } else if (mod.type === 'ASSIGNMENT' && mod.assignment_date) {
        eventDate = new Date(mod.assignment_date)
      } else {
        // Fallback a created_at si no hay fecha específica
        eventDate = new Date(mod.created_at)
      }
      
      events.push({
        date: eventDate,
        type: 'modification',
        title: `Modificación #${mod.number}`,
        icon: FileEdit,
        color: 'warning',
        description: formatDate(eventDate),
        details: mod
      })
    })
  }
  
  // Agregar fecha final inicial
  events.push({
    date: new Date(project.end_date),
    type: 'initial_end',
    title: 'Fecha Final Inicial',
    icon: Clock,
    color: 'neutral',
    description: formatDate(project.end_date)
  })
  
  // Agregar fecha final con prórrogas (si es diferente)
  if (project.final_end_date_with_extensions && 
      project.final_end_date_with_extensions !== project.end_date) {
    events.push({
      date: new Date(project.final_end_date_with_extensions),
      type: 'final_end',
      title: 'Fecha Final con Prórrogas',
      icon: Target,
      color: 'primary',
      description: formatDate(project.final_end_date_with_extensions)
    })
  }
  
  // Ordenar por fecha descendente (más reciente primero)
  return events.sort((a, b) => b.date - a.date)
}

const timelineEvents = createTimelineEvents()

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header Simple */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/projects")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {project.project_name}
                  </h1>
                  <Badge variant={getStatusColor(project.status_name)}>
                    {project.status_name}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {project.project_year}-{String(project.internal_project_number).padStart(3, '0')}
                  {project.external_project_number && ` • ${project.external_project_number}`}
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate(`/projects/edit/${id}`)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar Proyecto
            </Button>
          </div>

          {/* Métricas Rápidas */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 text-sm mb-1">
                <DollarSign className="h-4 w-4" />
                <span>Valor Total</span>
              </div>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {modificationsSummary
                  ? formatCurrency(modificationsSummary.final_total_value)
                  : formatCurrency(project.project_value)}
              </p>
              {modificationsSummary && modificationsSummary.total_additions > 0 && (
                <p className="text-xs text-success mt-1">
                  +{formatCurrency(modificationsSummary.total_additions)} en adiciones
                </p>
              )}
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 text-sm mb-1">
                <Calendar className="h-4 w-4" />
                <span>Duración</span>
              </div>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {duration.totalDays} días
              </p>
              {totalExtensionDays > 0 && (
                <p className="text-xs text-info mt-1">
                  +{totalExtensionDays} días extendidos
                </p>
              )}
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 text-sm mb-1">
                <Clock className="h-4 w-4" />
                <span>Progreso</span>
              </div>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {progress}%
              </p>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 mt-2">
                <div
                  className="bg-primary rounded-full h-1.5 transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 text-sm mb-1">
                <FileEdit className="h-4 w-4" />
                <span>Modificaciones</span>
              </div>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {modificationsSummary?.total_modifications || 0}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                {modifications?.length || 0} activas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Contenido de Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* TAB: INFORMACIÓN GENERAL */}
        {activeTab === "general" && (
          <div className="space-y-6">
            {/* Identificación del Proyecto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Identificación del Proyecto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Año
                    </label>
                    <p className="text-base font-medium mt-1">
                      {project.project_year}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Número Interno
                    </label>
                    <p className="text-base font-medium mt-1">
                      {String(project.internal_project_number).padStart(3, '0')}
                    </p>
                  </div>

                  {project.external_project_number && (
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        Número Externo
                      </label>
                      <p className="text-base font-medium mt-1">
                        {project.external_project_number}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                    Objeto del Proyecto
                  </label>
                  <p className="text-sm leading-relaxed mt-2 text-neutral-700 dark:text-neutral-300">
                    {project.project_purpose}
                  </p>
                </div>

                {project.observations && (
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <label className="text-xs font-medium text-amber-800 dark:text-amber-400 uppercase tracking-wide flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Observaciones
                    </label>
                    <p className="text-sm mt-2 text-amber-900 dark:text-amber-300">
                      {project.observations}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Entidades y Responsables */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Entidades y Responsables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      Entidad
                    </label>
                    <p className="text-base font-medium mt-1">
                      {project.entity_name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {project.entity_type_name}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide flex items-center gap-2">
                      <Briefcase className="h-3 w-3" />
                      Dependencia Ejecutora
                    </label>
                    <p className="text-base font-medium mt-1">
                      {project.executing_department_name}
                    </p>
                  </div>

                  {project.ordering_official_name && (
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        Supervisor del Proyecto
                      </label>
                      <p className="text-base font-medium mt-1">
                        {project.ordering_official_name}
                      </p>
                      {project.ordering_official_position && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          {project.ordering_official_position}
                        </p>
                      )}
                    </div>
                  )}

                  {project.main_email && (
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        Email Principal
                      </label>
                      <a
                        href={`mailto:${project.main_email}`}
                        className="text-sm text-primary hover:underline mt-1 block"
                      >
                        {project.main_email}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Fechas y Duración */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Fechas y Duración
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {project.subscription_date && (
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        Fecha de Suscripción
                      </label>
                      <p className="text-sm font-medium mt-1">
                        {formatDate(project.subscription_date)}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Fecha de Inicio
                    </label>
                    <p className="text-sm font-medium mt-1">
                      {formatDate(project.start_date)}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Fecha Final Inicial
                    </label>
                    <p className="text-sm font-medium mt-1">
                      {formatDate(project.end_date)}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Fecha Final con Prórrogas
                    </label>
                    <p className="text-sm font-medium mt-1">
                      {formatDate(project.final_end_date_with_extensions || project.end_date)}
                    </p>
                    {totalExtensionDays > 0 && (
                      <p className="text-xs text-success mt-1">
                        +{totalExtensionDays} días extendidos
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Duración Total
                    </label>
                    <p className="text-base font-semibold mt-1">
                      {duration.years > 0 && `${duration.years} año${duration.years > 1 ? 's' : ''} `}
                      {duration.months > 0 && `${duration.months} mes${duration.months > 1 ? 'es' : ''} `}
                      {duration.days} día{duration.days !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {duration.totalDays} días totales
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Administrativa */}
            {(project.administrative_act || project.secop_link || project.session_type) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Información Administrativa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {project.administrative_act && (
                      <div>
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                          Acto Administrativo
                        </label>
                        <p className="text-sm font-medium mt-1">
                          {project.administrative_act}
                        </p>
                      </div>
                    )}

                    {project.session_type && (
                      <div>
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                          Tipo de Sesión
                        </label>
                        <p className="text-sm font-medium mt-1">
                          {project.session_type}
                        </p>
                        {project.minutes_number && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            Acta: {project.minutes_number}
                            {project.minutes_date && ` - ${formatDate(project.minutes_date)}`}
                          </p>
                        )}
                      </div>
                    )}

                    {project.secop_link && (
                      <div className="col-span-2">
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide flex items-center gap-2">
                          <LinkIcon className="h-3 w-3" />
                          Enlace SECOP
                        </label>
                        <a
                          href={project.secop_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-1 block"
                        >
                          Ver en SECOP →
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* TAB: INFORMACIÓN FINANCIERA */}
        {activeTab === "financial" && (
          <div className="space-y-6">
            {/* Resumen Financiero */}
            <div className="grid grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                    Valor Original
                  </p>
                  <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(project.project_value)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                    Adiciones
                  </p>
                  <p className="text-2xl font-semibold text-success">
                    {modificationsSummary
                      ? formatCurrency(modificationsSummary.total_additions)
                      : formatCurrency(0)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                    Valor Total Actual
                  </p>
                  <p className="text-2xl font-semibold text-primary">
                    {modificationsSummary
                      ? formatCurrency(modificationsSummary.final_total_value)
                      : formatCurrency(project.project_value)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                    Beneficiarios
                  </p>
                  <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {project.beneficiaries_count?.toLocaleString() || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Distribución de Valores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Distribución de Valores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Beneficio Institucional
                    </label>
                    <p className="text-2xl font-semibold mt-2">
                      {formatCurrency(project.institutional_benefit_value)}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {project.institutional_benefit_percentage}%
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Aporte Entidad
                    </label>
                    <p className="text-2xl font-semibold mt-2">
                      {formatCurrency(project.entity_contribution)}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {project.project_value > 0
                        ? `${((project.entity_contribution / project.project_value) * 100).toFixed(1)}%`
                        : "0%"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Aporte Universidad
                    </label>
                    <p className="text-2xl font-semibold mt-2">
                      {formatCurrency(project.university_contribution)}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {project.project_value > 0
                        ? `${((project.university_contribution / project.project_value) * 100).toFixed(1)}%`
                        : "0%"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB: CÓDIGOS RUP */}
        {activeTab === "rup" && (
          <div className="space-y-6">
            {projectRupCodes && projectRupCodes.codes && projectRupCodes.codes.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Códigos Asignados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projectRupCodes.codes.map((rupCode, index) => (
                      <div
                        key={rupCode.id || index}
                        className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-5 bg-neutral-50 dark:bg-neutral-800/50 hover:shadow-md transition-shadow"
                      >
                        {/* Header del código */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Target className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-lg font-bold text-primary">
                                  {rupCode.code}
                                </span>
                                {rupCode.is_main_code && (
                                  <Badge variant="success" className="text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    Principal
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                {rupCode.product_name || rupCode.description}
                              </p>
                            </div>
                          </div>
                          {rupCode.participation_percentage && (
                            <div className="text-right">
                              <p className="text-2xl font-bold text-success">
                                {rupCode.participation_percentage}%
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                participación
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Jerarquía */}
                        <div className="grid grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-1">
                              Segmento
                            </p>
                            <p className="font-medium">
                              {rupCode.segment_code} - {rupCode.segment_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-1">
                              Familia
                            </p>
                            <p className="font-medium">
                              {rupCode.family_code} - {rupCode.family_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-1">
                              Clase
                            </p>
                            <p className="font-medium">
                              {rupCode.class_code} - {rupCode.class_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-1">
                              Producto
                            </p>
                            <p className="font-medium">
                              {rupCode.product_code} - {rupCode.product_name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Observaciones generales */}
                  {projectRupCodes.general_observations && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-400 uppercase tracking-wide mb-2">
                        Observaciones Generales
                      </p>
                      <p className="text-sm text-blue-900 dark:text-blue-300">
                        {projectRupCodes.general_observations}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center text-neutral-500 dark:text-neutral-400">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No hay códigos RUP asignados</p>
                    <p className="text-sm mt-2">
                      Los códigos RUP se pueden asignar al editar el proyecto
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* TAB: MODIFICACIONES - VERSIÓN COMPLETA Y DETALLADA */}
        {activeTab === "modifications" && (
          <div className="space-y-6">
            {/* Resumen */}
            {modificationsSummary && (
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                      Total Modificaciones
                    </p>
                    <p className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
                      {modificationsSummary.total_modifications}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                      Adiciones Totales
                    </p>
                    <p className="text-2xl font-semibold text-success">
                      {formatCurrency(modificationsSummary.total_additions)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                      Días Extendidos
                    </p>
                    <p className="text-3xl font-semibold text-info">
                      +{modificationsSummary.total_extension_days}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                      Valor Final
                    </p>
                    <p className="text-2xl font-semibold text-primary">
                      {formatCurrency(modificationsSummary.final_total_value)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Lista Detallada de Modificaciones */}
            {modifications && modifications.length > 0 ? (
              <div className="space-y-4">
                {modifications.map((mod) => {
                  const Icon = getModificationIcon(mod.type)
                  const isExpanded = expandedModification === mod.id

                  return (
                    <Card key={mod.id} className="overflow-hidden">
                      {/* Header de la modificación */}
                      <div
                        className={`p-4 cursor-pointer ${getModificationColor(mod.type)} border-l-4`}
                        onClick={() => toggleExpand(mod.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/80 dark:bg-neutral-800 flex items-center justify-center">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">
                                  Modificación #{mod.number}
                                </h3>
                                <Badge variant="secondary">
                                  {getModificationLabel(mod.type)}
                                </Badge>
                              </div>
                              <p className="text-sm mt-1">
                                {formatDate(mod.approval_date || mod.created_at)}
                              </p>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </div>

                      {/* Contenido expandible */}
                      {isExpanded && (
                        <CardContent className="p-6 space-y-6">
                          {/* Información básica */}
                          <div className="grid grid-cols-2 gap-4">
                            {mod.administrative_act && (
                              <div>
                                <label className="text-xs font-medium text-neutral-500 uppercase">
                                  Acto Administrativo
                                </label>
                                <p className="text-sm font-medium mt-1">{mod.administrative_act}</p>
                              </div>
                            )}
                            {mod.approval_date && (
                              <div>
                                <label className="text-xs font-medium text-neutral-500 uppercase">
                                  Fecha de Aprobación
                                </label>
                                <p className="text-sm font-medium mt-1">
                                  {formatDate(mod.approval_date)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Justificación */}
                          {mod.justification && (
                            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                              <label className="text-xs font-medium text-neutral-500 uppercase">
                                Justificación
                              </label>
                              <p className="text-sm mt-2 text-neutral-700 dark:text-neutral-300">
                                {mod.justification}
                              </p>
                            </div>
                          )}

                          {/* DETALLES ESPECÍFICOS POR TIPO */}

                          {/* ADICIÓN */}
                          {(mod.type === "ADDITION" || mod.type === "BOTH") && mod.addition_value && (
                            <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                              <CardHeader>
                                <CardTitle className="text-base text-green-800 dark:text-green-300">
                                  💰 Detalles de Adición Presupuestal
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs font-medium text-green-700 dark:text-green-400 uppercase">
                                      Valor de Adición
                                    </label>
                                    <p className="text-lg font-bold text-green-900 dark:text-green-200">
                                      {formatCurrency(mod.addition_value)}
                                    </p>
                                  </div>
                                  {mod.new_total_value && (
                                    <div>
                                      <label className="text-xs font-medium text-green-700 dark:text-green-400 uppercase">
                                        Nuevo Valor Total
                                      </label>
                                      <p className="text-lg font-bold text-green-900 dark:text-green-200">
                                        {formatCurrency(mod.new_total_value)}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {mod.cdp && (
                                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-green-300 dark:border-green-700">
                                    <div>
                                      <label className="text-xs font-medium text-green-700 dark:text-green-400 uppercase">
                                        CDP
                                      </label>
                                      <p className="text-sm font-medium text-green-900 dark:text-green-200">{mod.cdp}</p>
                                    </div>
                                    {mod.cdp_value && (
                                      <div>
                                        <label className="text-xs font-medium text-green-700 dark:text-green-400 uppercase">
                                          Valor CDP
                                        </label>
                                        <p className="text-sm font-medium text-green-900 dark:text-green-200">
                                          {formatCurrency(mod.cdp_value)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {mod.rp && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-xs font-medium text-green-700 dark:text-green-400 uppercase">
                                        RP
                                      </label>
                                      <p className="text-sm font-medium text-green-900 dark:text-green-200">{mod.rp}</p>
                                    </div>
                                    {mod.rp_value && (
                                      <div>
                                        <label className="text-xs font-medium text-green-700 dark:text-green-400 uppercase">
                                          Valor RP
                                        </label>
                                        <p className="text-sm font-medium text-green-900 dark:text-green-200">
                                          {formatCurrency(mod.rp_value)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {mod.supervisor_name && (
                                  <div className="pt-3 border-t border-green-300 dark:border-green-700">
                                    <label className="text-xs font-medium text-green-700 dark:text-green-400 uppercase">
                                      Supervisor
                                    </label>
                                    <p className="text-sm font-medium text-green-900 dark:text-green-200">
                                      {mod.supervisor_name}
                                      {mod.supervisor_id && ` - ${mod.supervisor_id}`}
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

                          {/* PRÓRROGA */}
                          {(mod.type === "EXTENSION" || mod.type === "BOTH") && mod.extension_days && (
                            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                              <CardHeader>
                                <CardTitle className="text-base text-blue-800 dark:text-blue-300">
                                  ⏱️ Detalles de Prórroga
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase">
                                      Días de Prórroga
                                    </label>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                                      {mod.extension_days} días
                                    </p>
                                  </div>
                                  {mod.new_end_date && (
                                    <div>
                                      <label className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase">
                                        Nueva Fecha de Finalización
                                      </label>
                                      <p className="text-lg font-bold text-blue-900 dark:text-blue-200">
                                        {formatDate(mod.new_end_date)}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {mod.extension_period_text && (
                                  <div className="bg-blue-100 dark:bg-blue-900/40 rounded p-3">
                                    <label className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase">
                                      Período en Texto
                                    </label>
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mt-1">
                                      {mod.extension_period_text}
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

                          {/* SUSPENSIÓN */}
                          {mod.type === "SUSPENSION" && mod.suspension_start_date && (
                            <Card className="bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800">
                              <CardHeader>
                                <CardTitle className="text-base text-orange-800 dark:text-orange-300">
                                  ⏸️ Detalles de Suspensión
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <label className="text-xs font-medium text-orange-700 dark:text-orange-400 uppercase">
                                      Fecha de Inicio
                                    </label>
                                    <p className="text-sm font-bold text-orange-900 dark:text-orange-200">
                                      {formatDate(mod.suspension_start_date)}
                                    </p>
                                  </div>
                                  {mod.suspension_end_date && (
                                    <div>
                                      <label className="text-xs font-medium text-orange-700 dark:text-orange-400 uppercase">
                                        Fecha de Fin
                                      </label>
                                      <p className="text-sm font-bold text-orange-900 dark:text-orange-200">
                                        {formatDate(mod.suspension_end_date)}
                                      </p>
                                    </div>
                                  )}
                                  {mod.suspension_days && (
                                    <div>
                                      <label className="text-xs font-medium text-orange-700 dark:text-orange-400 uppercase">
                                        Días Suspendidos
                                      </label>
                                      <p className="text-xl font-bold text-orange-900 dark:text-orange-200">
                                        {mod.suspension_days}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {mod.expected_restart_date && (
                                  <div className="bg-orange-100 dark:bg-orange-900/40 rounded p-3">
                                    <label className="text-xs font-medium text-orange-700 dark:text-orange-400 uppercase">
                                      Fecha Esperada de Reinicio
                                    </label>
                                    <p className="text-sm font-medium text-orange-900 dark:text-orange-200 mt-1">
                                      {formatDate(mod.expected_restart_date)}
                                    </p>
                                  </div>
                                )}

                                {mod.suspension_reason && (
                                  <div className="pt-3 border-t border-orange-300 dark:border-orange-700">
                                    <label className="text-xs font-medium text-orange-700 dark:text-orange-400 uppercase">
                                      Motivo de Suspensión
                                    </label>
                                    <p className="text-sm text-orange-900 dark:text-orange-200 mt-1">
                                      {mod.suspension_reason}
                                    </p>
                                  </div>
                                )}

                                {mod.suspension_observations && (
                                  <div>
                                    <label className="text-xs font-medium text-orange-700 dark:text-orange-400 uppercase">
                                      Observaciones
                                    </label>
                                    <p className="text-sm text-orange-900 dark:text-orange-200 mt-1">
                                      {mod.suspension_observations}
                                    </p>
                                  </div>
                                )}

                                {mod.suspension_status && (
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={
                                        mod.suspension_status === "ACTIVE"
                                          ? "warning"
                                          : mod.suspension_status === "RESTARTED"
                                          ? "success"
                                          : "default"
                                      }
                                    >
                                      {mod.suspension_status === "ACTIVE"
                                        ? "Activa"
                                        : mod.suspension_status === "RESTARTED"
                                        ? "Reiniciada"
                                        : mod.suspension_status}
                                    </Badge>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

                          {/* REINICIO */}
                          {mod.type === "RESTART" && mod.restart_date && (
                            <Card className="bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800">
                              <CardHeader>
                                <CardTitle className="text-base text-teal-800 dark:text-teal-300">
                                  ▶️ Detalles de Reinicio
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs font-medium text-teal-700 dark:text-teal-400 uppercase">
                                      Fecha de Reinicio
                                    </label>
                                    <p className="text-lg font-bold text-teal-900 dark:text-teal-200">
                                      {formatDate(mod.restart_date)}
                                    </p>
                                  </div>
                                  {mod.actual_suspension_days && (
                                    <div>
                                      <label className="text-xs font-medium text-teal-700 dark:text-teal-400 uppercase">
                                        Días Suspendidos (Real)
                                      </label>
                                      <p className="text-xl font-bold text-teal-900 dark:text-teal-200">
                                        {mod.actual_suspension_days} días
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {mod.restart_observations && (
                                  <div className="bg-teal-100 dark:bg-teal-900/40 rounded p-3">
                                    <label className="text-xs font-medium text-teal-700 dark:text-teal-400 uppercase">
                                      Observaciones del Reinicio
                                    </label>
                                    <p className="text-sm text-teal-900 dark:text-teal-200 mt-1">
                                      {mod.restart_observations}
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

                          {/* LIQUIDACIÓN */}
                          {mod.type === "LIQUIDATION" && mod.liquidation_date && (
                            <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                              <CardHeader>
                                <CardTitle className="text-base text-red-800 dark:text-red-300">
                                  📋 Detalles de Liquidación
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs font-medium text-red-700 dark:text-red-400 uppercase">
                                      Fecha de Liquidación
                                    </label>
                                    <p className="text-sm font-bold text-red-900 dark:text-red-200">
                                      {formatDate(mod.liquidation_date)}
                                    </p>
                                  </div>
                                  {mod.liquidation_type && (
                                    <div>
                                      <label className="text-xs font-medium text-red-700 dark:text-red-400 uppercase">
                                        Tipo de Liquidación
                                      </label>
                                      <Badge variant={mod.liquidation_type === "BILATERAL" ? "info" : "warning"}>
                                        {mod.liquidation_type}
                                      </Badge>
                                    </div>
                                  )}
                                </div>

                                {mod.final_value && (
                                  <div className="bg-red-100 dark:bg-red-900/40 rounded p-3">
                                    <label className="text-xs font-medium text-red-700 dark:text-red-400 uppercase">
                                      Valor Final del Contrato
                                    </label>
                                    <p className="text-lg font-bold text-red-900 dark:text-red-200">
                                      {formatCurrency(mod.final_value)}
                                    </p>
                                  </div>
                                )}

                                {mod.initial_contract_value && (
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <label className="text-xs font-medium text-red-700 dark:text-red-400 uppercase">
                                        Valor Inicial
                                      </label>
                                      <p className="text-sm font-medium text-red-900 dark:text-red-200">
                                        {formatCurrency(mod.initial_contract_value)}
                                      </p>
                                    </div>
                                    {mod.execution_percentage !== undefined && (
                                      <div>
                                        <label className="text-xs font-medium text-red-700 dark:text-red-400 uppercase">
                                          % Ejecución
                                        </label>
                                        <p className="text-xl font-bold text-red-900 dark:text-red-200">
                                          {mod.execution_percentage}%
                                        </p>
                                      </div>
                                    )}
                                    {mod.executed_value && (
                                      <div>
                                        <label className="text-xs font-medium text-red-700 dark:text-red-400 uppercase">
                                          Valor Ejecutado
                                        </label>
                                        <p className="text-sm font-medium text-red-900 dark:text-red-200">
                                          {formatCurrency(mod.executed_value)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {mod.liquidation_act_number && (
                                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-red-300 dark:border-red-700">
                                    <div>
                                      <label className="text-xs font-medium text-red-700 dark:text-red-400 uppercase">
                                        Número de Resolución
                                      </label>
                                      <p className="text-sm font-medium text-red-900 dark:text-red-200">
                                        {mod.liquidation_act_number}
                                      </p>
                                    </div>
                                    {mod.liquidation_act_date && (
                                      <div>
                                        <label className="text-xs font-medium text-red-700 dark:text-red-400 uppercase">
                                          Fecha de Resolución
                                        </label>
                                        <p className="text-sm font-medium text-red-900 dark:text-red-200">
                                          {formatDate(mod.liquidation_act_date)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {mod.liquidation_observations && (
                                  <div className="pt-3 border-t border-red-300 dark:border-red-700">
                                    <label className="text-xs font-medium text-red-700 dark:text-red-400 uppercase">
                                      Observaciones
                                    </label>
                                    <p className="text-sm text-red-900 dark:text-red-200 mt-1">
                                      {mod.liquidation_observations}
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

                          {/* CESIÓN */}
                          {mod.type === "ASSIGNMENT" && mod.assignee_name && (
                            <Card className="bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800">
                              <CardHeader>
                                <CardTitle className="text-base text-indigo-800 dark:text-indigo-300">
                                  🔄 Detalles de Cesión
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs font-medium text-indigo-700 dark:text-indigo-400 uppercase">
                                      Tipo de Cesión
                                    </label>
                                    <Badge variant="info">{mod.assignment_type}</Badge>
                                  </div>
                                  {mod.assignment_date && (
                                    <div>
                                      <label className="text-xs font-medium text-indigo-700 dark:text-indigo-400 uppercase">
                                        Fecha de Cesión
                                      </label>
                                      <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                                        {formatDate(mod.assignment_date)}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-indigo-100 dark:bg-indigo-900/40 rounded p-3">
                                  <div>
                                    <label className="text-xs font-medium text-indigo-700 dark:text-indigo-400 uppercase">
                                      Cedente
                                    </label>
                                    <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                                      {mod.assignor_name}
                                    </p>
                                    {mod.assignor_id && (
                                      <p className="text-xs text-indigo-700 dark:text-indigo-400">{mod.assignor_id}</p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-indigo-700 dark:text-indigo-400 uppercase">
                                      Cesionario
                                    </label>
                                    <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                                      {mod.assignee_name}
                                    </p>
                                    {mod.assignee_id && (
                                      <p className="text-xs text-indigo-700 dark:text-indigo-400">{mod.assignee_id}</p>
                                    )}
                                  </div>
                                </div>

                                {mod.assignment_value && (
                                  <div className="bg-indigo-100 dark:bg-indigo-900/40 rounded p-3">
                                    <label className="text-xs font-medium text-indigo-700 dark:text-indigo-400 uppercase">
                                      Valor a Ceder
                                    </label>
                                    <p className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
                                      {formatCurrency(mod.assignment_value)}
                                    </p>
                                  </div>
                                )}

                                {(mod.value_paid_to_assignor || mod.value_pending_to_assignor) && (
                                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-indigo-300 dark:border-indigo-700">
                                    {mod.value_paid_to_assignor && (
                                      <div>
                                        <label className="text-xs font-medium text-indigo-700 dark:text-indigo-400 uppercase">
                                          Valor Pagado al Cedente
                                        </label>
                                        <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                                          {formatCurrency(mod.value_paid_to_assignor)}
                                        </p>
                                      </div>
                                    )}
                                    {mod.value_pending_to_assignor && (
                                      <div>
                                        <label className="text-xs font-medium text-indigo-700 dark:text-indigo-400 uppercase">
                                          Valor Pendiente al Cedente
                                        </label>
                                        <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                                          {formatCurrency(mod.value_pending_to_assignor)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

                          {/* MODIFICACIÓN DE CLÁUSULAS */}
                          {mod.type === "MODIFICATION" && mod.clause_number && (
                            <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                              <CardHeader>
                                <CardTitle className="text-base text-yellow-800 dark:text-yellow-300">
                                  📝 Cambio de Cláusulas
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs font-medium text-yellow-700 dark:text-yellow-400 uppercase">
                                      Número de Cláusula
                                    </label>
                                    <p className="text-lg font-bold text-yellow-900 dark:text-yellow-200">
                                      {mod.clause_number}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-yellow-700 dark:text-yellow-400 uppercase">
                                      Nombre de la Cláusula
                                    </label>
                                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                                      {mod.clause_name}
                                    </p>
                                  </div>
                                </div>

                                {mod.original_clause_text && (
                                  <div className="bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded p-3">
                                    <label className="text-xs font-medium text-red-700 dark:text-red-400 uppercase flex items-center gap-1">
                                      <span className="text-red-500">✗</span> Texto Original
                                    </label>
                                    <p className="text-sm text-red-900 dark:text-red-200 mt-1">
                                      {mod.original_clause_text}
                                    </p>
                                  </div>
                                )}

                                {mod.new_clause_text && (
                                  <div className="bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-800 rounded p-3">
                                    <label className="text-xs font-medium text-green-700 dark:text-green-400 uppercase flex items-center gap-1">
                                      <span className="text-green-500">✓</span> Nuevo Texto
                                    </label>
                                    <p className="text-sm text-green-900 dark:text-green-200 mt-1">
                                      {mod.new_clause_text}
                                    </p>
                                  </div>
                                )}

                                {mod.requires_resource_liberation && (
                                  <div className="bg-yellow-100 dark:bg-yellow-900/40 rounded p-3">
                                    <label className="text-xs font-medium text-yellow-700 dark:text-yellow-400 uppercase">
                                      ⚠️ Liberación de Recursos
                                    </label>
                                    <div className="grid grid-cols-3 gap-3 mt-2">
                                      {mod.cdp_to_release && (
                                        <div>
                                          <p className="text-xs text-yellow-700 dark:text-yellow-400">CDP a Liberar</p>
                                          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                                            {mod.cdp_to_release}
                                          </p>
                                        </div>
                                      )}
                                      {mod.rp_to_release && (
                                        <div>
                                          <p className="text-xs text-yellow-700 dark:text-yellow-400">RP a Liberar</p>
                                          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                                            {mod.rp_to_release}
                                          </p>
                                        </div>
                                      )}
                                      {mod.liberation_amount && (
                                        <div>
                                          <p className="text-xs text-yellow-700 dark:text-yellow-400">Monto</p>
                                          <p className="text-sm font-bold text-yellow-900 dark:text-yellow-200">
                                            {formatCurrency(mod.liberation_amount)}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

                          {/* Información adicional común */}
                          {(mod.entity_legal_representative_name || mod.ordering_official_id) && (
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                              {mod.entity_legal_representative_name && (
                                <div>
                                  <label className="text-xs font-medium text-neutral-500 uppercase">
                                    Representante Legal
                                  </label>
                                  <p className="text-sm font-medium mt-1">
                                    {mod.entity_legal_representative_name}
                                  </p>
                                  {mod.entity_legal_representative_id && (
                                    <p className="text-xs text-neutral-500">
                                      {mod.entity_legal_representative_id_type}:{" "}
                                      {mod.entity_legal_representative_id}
                                    </p>
                                  )}
                                </div>
                              )}
                              {mod.ordering_official_id && (
                                <div>
                                  <label className="text-xs font-medium text-neutral-500 uppercase">
                                    Supervisor del Proyecto
                                  </label>
                                  <p className="text-sm font-medium mt-1">ID: {mod.ordering_official_id}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center text-neutral-500 dark:text-neutral-400">
                    <FileEdit className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No hay modificaciones registradas</p>
                    <p className="text-sm mt-2">
                      Las modificaciones aparecerán aquí una vez sean agregadas
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* TAB: LÍNEA DE TIEMPO */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              {/* Header con estadísticas - versión minimalista */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                        <Calendar className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Eventos</p>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                          {timelineEvents.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                        <FileEdit className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Modificaciones</p>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                          {modifications?.length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                        <Target className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Progreso</p>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                          {progress}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                        <Clock className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Días Restantes</p>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                          {Math.max(0, Math.ceil((new Date(project.final_end_date_with_extensions || project.end_date) - new Date()) / (1000 * 60 * 60 * 24)))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Barra de progreso minimalista */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Progreso del Proyecto
                      </span>
                      <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        {progress}%
                      </span>
                    </div>
                    <div className="relative h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-neutral-900 dark:bg-neutral-100 transition-all duration-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                      <span>Inicio: {new Date(project.start_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">Fin: {new Date(project.final_end_date_with_extensions || project.end_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline minimalista con más información */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Historial de Eventos
                  </CardTitle>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Cronología completa del proyecto ordenada por fecha
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="relative space-y-6 py-4">
                    {/* Línea vertical simple */}
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-700"></div>

                    {timelineEvents.map((event, index) => {
                      const Icon = event.icon
                      const isFirst = index === 0
                      
                      return (
                        <div key={index} className="relative pl-10">
                          {/* Dot simple en la línea */}
                          <div className="absolute left-0 w-7 h-7 bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-600 rounded-full flex items-center justify-center z-10">
                            <Icon className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
                          </div>

                          {/* Card del evento - más información */}
                          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                            {/* Header del evento */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100 mb-1">
                                  {event.title}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                  {event.date.toLocaleDateString('es-CO', { 
                                    weekday: 'long',
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric' 
                                  })}
                                </p>
                              </div>
                              {isFirst && (
                                <Badge variant="outline" className="bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600">
                                  Más reciente
                                </Badge>
                              )}
                            </div>

                            {/* Detalles completos de modificación */}
                            {event.details && (
                              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                                {/* Tipo de modificación */}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                                    Tipo:
                                  </span>
                                  <Badge variant="outline">
                                    {getModificationLabel(event.details.type)}
                                  </Badge>
                                </div>

                                {/* Valores financieros */}
                                {(event.details.type === 'ADDITION' || event.details.type === 'BOTH') && (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                        Valor de adición:
                                      </span>
                                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                        +{formatCurrency(event.details.addition_value)}
                                      </span>
                                    </div>
                                    {event.details.cdp && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-neutral-500 dark:text-neutral-400">
                                          CDP: {event.details.cdp}
                                        </span>
                                        {event.details.cdp_value && (
                                          <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                            {formatCurrency(event.details.cdp_value)}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {event.details.rp && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-neutral-500 dark:text-neutral-400">
                                          RP: {event.details.rp}
                                        </span>
                                        {event.details.rp_value && (
                                          <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                            {formatCurrency(event.details.rp_value)}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Extensión de tiempo */}
                                {(event.details.type === 'EXTENSION' || event.details.type === 'BOTH') && (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                        Días extendidos:
                                      </span>
                                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                        +{event.details.extension_days} días
                                      </span>
                                    </div>
                                    {event.details.new_end_date && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-neutral-500 dark:text-neutral-400">
                                          Nueva fecha final:
                                        </span>
                                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                          {formatDate(event.details.new_end_date)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Supervisor */}
                                {event.details.supervisor_name && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-neutral-500 dark:text-neutral-400">
                                      Supervisor:
                                    </span>
                                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                      {event.details.supervisor_name}
                                    </span>
                                  </div>
                                )}

                                {/* Acto administrativo */}
                                {event.details.administrative_act && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-neutral-500 dark:text-neutral-400">
                                      Acto administrativo:
                                    </span>
                                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                      {event.details.administrative_act}
                                    </span>
                                  </div>
                                )}

                                {/* Justificación */}
                                {event.details.justification && (
                                  <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase mb-2">
                                      Justificación:
                                    </p>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                      {event.details.justification}
                                    </p>
                                  </div>
                                )}

                                {/* Fecha de aprobación */}
                                {event.details.approval_date && (
                                  <div className="flex items-center justify-between text-xs mt-2">
                                    <span className="text-neutral-500 dark:text-neutral-400">
                                      Fecha de aprobación:
                                    </span>
                                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                      {formatDate(event.details.approval_date)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Para eventos que no son modificaciones */}
                            {!event.details && event.type !== 'modification' && (
                              <div className="mt-2">
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                  {event.type === 'start' && 'El proyecto inició formalmente en esta fecha'}
                                  {event.type === 'subscription' && 'Fecha de suscripción del contrato'}
                                  {event.type === 'initial_end' && 'Fecha final establecida inicialmente'}
                                  {event.type === 'final_end' && 'Fecha final proyectada incluyendo todas las prórrogas'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {/* Mensaje si no hay eventos */}
                    {timelineEvents.length === 0 && (
                      <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                        <p className="text-neutral-500 dark:text-neutral-400">
                          No hay eventos registrados en la línea de tiempo
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
      </div>
    </div>
  )
}