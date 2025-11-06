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
  Paperclip,
  AlertCircle,
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
import { projectsApi, modificationsApi } from "@/lib/api"

export default function ProjectView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("general")

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

  const getModificationBadge = (type) => {
    const badges = {
      ADDITION: { variant: "success", label: "Adición" },
      EXTENSION: { variant: "info", label: "Prórroga" },
      BOTH: { variant: "warning", label: "Adición y Prórroga" },
    }
    return badges[type] || { variant: "default", label: type }
  }

  const tabs = [
    { id: "general", label: "Información General", icon: FileText },
    { id: "financial", label: "Información Financiera", icon: DollarSign },
    { id: "modifications", label: "Modificaciones", icon: FileEdit },
    { id: "timeline", label: "Línea de Tiempo", icon: Calendar },
  ]

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
    
    // Agregar modificaciones
    if (modifications && modifications.length > 0) {
      modifications.forEach(mod => {
        events.push({
          date: new Date(mod.created_at),
          type: 'modification',
          title: `Modificación #${mod.number}`,
          icon: FileEdit,
          color: 'warning',
          description: formatDate(mod.created_at),
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
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  {project.code} {project.external_project_number && `• ${project.external_project_number}`}
                </p>
              </div>
            </div>
            <Button onClick={() => navigate(`/projects/edit/${id}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>

          {/* Métricas rápidas */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 text-sm mb-1">
                <Clock className="h-4 w-4" />
                <span>Cronograma</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Estado</p>
                  <Badge variant={getStatusColor(project.status_name)} className="mt-1">
                    {project.status_name}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Duración Total</p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                    {duration.years > 0 && `${duration.years}a `}
                    {duration.months > 0 && `${duration.months}m `}
                    {duration.days}d
                  </p>
                </div>
              </div>
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
                      ? "text-primary"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto p-6">
        {/* TAB: INFORMACIÓN GENERAL */}
        {activeTab === "general" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información Básica */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Información Básica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        Código
                      </label>
                      <p className="text-base font-medium mt-1">{project.project_id || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        Año
                      </label>
                      <p className="text-base font-medium mt-1">{project.project_year}</p>
                    </div>

                    {project.external_project_number && (
                      <div className="col-span-2">
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
                      <p className="text-sm font-medium mt-2">
                        {project.entity_name || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide flex items-center gap-2">
                        <Briefcase className="h-3 w-3" />
                        Dependencia Ejecutora
                      </label>
                      <p className="text-sm font-medium mt-2">
                        {project.department_name || 'N/A'}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        Funcionario Ordenador
                      </label>
                      <p className="text-sm font-medium mt-2">
                        {project.ordering_official_name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Clasificación */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Clasificación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        Tipo de Proyecto
                      </label>
                      <p className="text-sm font-medium mt-1">
                        {project.project_type || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        Tipo de Financiación
                      </label>
                      <p className="text-sm font-medium mt-1">
                        {project.financing_type || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        Modalidad de Ejecución
                      </label>
                      <p className="text-sm font-medium mt-1">
                        {project.execution_modality || 'N/A'}
                      </p>
                    </div>

                    {project.contracting_modality && (
                      <div>
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                          Modalidad Contratación
                        </label>
                        <p className="text-sm font-medium mt-1">
                          {project.contracting_modality}
                        </p>
                      </div>
                    )}

                    {project.accounting_code && (
                      <div>
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                          Código Contable
                        </label>
                        <p className="text-sm font-mono mt-1">
                          {project.accounting_code}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Columna lateral */}
            <div className="space-y-6">
              {/* Cronograma */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Cronograma
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Estado del Proyecto
                    </label>
                    <Badge variant={getStatusColor(project.status_name)} className="mt-2">
                      {project.status_name}
                    </Badge>
                  </div>

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
                      ({duration.totalDays} días totales)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contacto */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.main_email && (
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        Email Principal
                      </label>
                      <p className="text-sm mt-1">{project.main_email}</p>
                    </div>
                  )}

                  {project.secondary_emails && project.secondary_emails.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        Emails Secundarios
                      </label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.secondary_emails.map((email, index) => (
                          <Badge key={index} variant="outline">
                            {email}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enlaces */}
              {(project.administrative_act || project.secop_link) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <LinkIcon className="h-5 w-5 text-primary" />
                      Enlaces
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.administrative_act && (
                      <div>
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                          Acto Administrativo
                        </label>
                        <p className="text-sm mt-1">{project.administrative_act}</p>
                      </div>
                    )}

                    {project.secop_link && (
                      <div>
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                          SECOP
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
                  </CardContent>
                </Card>
              )}
            </div>
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

        {/* TAB: MODIFICACIONES */}
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

            {/* Tabla */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Historial de Modificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                {modifications && modifications.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Adición</TableHead>
                        <TableHead>Días Extendidos</TableHead>
                        <TableHead>Nueva Fecha Fin</TableHead>
                        <TableHead>Aprobación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modifications.map((mod) => {
                        const badge = getModificationBadge(mod.type)
                        return (
                          <TableRow key={mod.modification_id}>
                            <TableCell className="font-medium">
                              {mod.number}
                            </TableCell>
                            <TableCell>
                              <Badge variant={badge.variant}>{badge.label}</Badge>
                            </TableCell>
                            <TableCell>{formatDate(mod.created_at)}</TableCell>
                            <TableCell>
                              {mod.addition_value > 0
                                ? formatCurrency(mod.addition_value)
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {mod.extension_days > 0 ? `+${mod.extension_days}` : "-"}
                            </TableCell>
                            <TableCell>
                              {mod.new_end_date ? formatDate(mod.new_end_date) : "-"}
                            </TableCell>
                            <TableCell>
                              {mod.approval_date ? formatDate(mod.approval_date) : "-"}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <FileEdit className="h-16 w-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                    <p className="text-neutral-600 dark:text-neutral-400">
                      No hay modificaciones registradas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB: LÍNEA DE TIEMPO */}
        {activeTab === "timeline" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Línea de Tiempo del Proyecto
                </CardTitle>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Eventos ordenados de más reciente a más antiguo
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Línea vertical */}
                  <div className="absolute left-8 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-700"></div>

                  <div className="space-y-8">
                    {timelineEvents.map((event, index) => {
                      const Icon = event.icon
                      const colorClasses = {
                        info: 'bg-info/10 border-info text-info',
                        success: 'bg-success/10 border-success text-success',
                        warning: 'bg-warning/10 border-warning text-warning',
                        neutral: 'bg-neutral-100 border-neutral-300 text-neutral-600',
                        primary: 'bg-primary/10 border-primary text-primary',
                      }
                      
                      return (
                        <div key={index} className="relative flex gap-6">
                          <div className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 ${colorClasses[event.color]}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 pt-3">
                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {event.title}
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                              {event.description}
                            </p>
                            {event.details && (
                              <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">
                                {event.details.addition_value > 0 && (
                                  <p>Adición: {formatCurrency(event.details.addition_value)}</p>
                                )}
                                {event.details.extension_days > 0 && (
                                  <p>Prórroga: +{event.details.extension_days} días</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}