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
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Cargando proyecto...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <p className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
            Proyecto no encontrado
          </p>
          <Button onClick={() => navigate("/projects")} className="mt-4">
            Volver a Proyectos
          </Button>
        </div>
      </div>
    )
  }

  // Calcular duración del proyecto
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return null
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const years = Math.floor(diffDays / 365)
    const months = Math.floor((diffDays % 365) / 30)
    const days = diffDays % 30
    
    return { years, months, days, totalDays: diffDays }
  }

  const duration = calculateDuration(project.start_date, project.end_date)
  const totalExtensionDays = modificationsSummary?.total_extension_days || 0
  const totalValue = parseFloat(project.project_value || 0)
  const totalModifications = parseFloat(modificationsSummary?.total_additions || 0)
  const finalValue = totalValue + totalModifications

  // Progreso del proyecto
  const calculateProgress = () => {
    if (!project.start_date || !project.end_date) return 0
    const start = new Date(project.start_date)
    const end = new Date(project.end_date)
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
      "En ejecución": "info",
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
      BOTH: { variant: "warning", label: "Ambas" },
    }
    return badges[type] || { variant: "default", label: type }
  }

  const tabs = [
    { id: "general", label: "Información General", icon: FileText },
    { id: "financial", label: "Información Financiera", icon: DollarSign },
    { id: "modifications", label: "Modificaciones", icon: FileEdit },
    { id: "timeline", label: "Línea de Tiempo", icon: Calendar },
  ]

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
                    {project.code}
                  </h1>
                  <Badge variant={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  {project.project_name}
                </p>
              </div>
            </div>
            <Button onClick={() => navigate(`/projects/edit/${id}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>

          {/* Métricas en el header */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 text-sm mb-1">
                <DollarSign className="h-4 w-4" />
                <span>Valor Total</span>
              </div>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {formatCurrency(finalValue)}
              </p>
              {totalModifications > 0 && (
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                  +{formatCurrency(totalModifications)} modificaciones
                </p>
              )}
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 text-sm mb-1">
                <Calendar className="h-4 w-4" />
                <span>Duración</span>
              </div>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {duration ? `${duration.totalDays} días` : "N/A"}
              </p>
              {totalExtensionDays > 0 && (
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
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
                      <p className="text-base font-medium mt-1">{project.code}</p>
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
                      <p className="text-sm font-medium mt-2">{project.entity}</p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide flex items-center gap-2">
                        <Briefcase className="h-3 w-3" />
                        Dependencia Ejecutora
                      </label>
                      <p className="text-sm font-medium mt-2">{project.department}</p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        Funcionario Ordenador
                      </label>
                      <p className="text-sm font-medium mt-2">
                        {project.ordering_official}
                      </p>
                    </div>

                    {project.beneficiaries_count && (
                      <div>
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                          Beneficiarios
                        </label>
                        <p className="text-sm font-medium mt-2">
                          {project.beneficiaries_count} personas
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contacto */}
              {(project.main_email || project.secop_link || project.administrative_act) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      Información de Contacto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.main_email && (
                      <div>
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                          Email
                        </label>
                        <a
                          href={`mailto:${project.main_email}`}
                          className="text-sm text-primary hover:underline block mt-1"
                        >
                          {project.main_email}
                        </a>
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
                          className="text-sm text-primary hover:underline block mt-1 break-all"
                        >
                          {project.secop_link}
                        </a>
                      </div>
                    )}

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
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Columna lateral */}
            <div className="space-y-6">
              {/* Fechas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Cronograma
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Estado
                    </label>
                    <div className="mt-2">
                      <Badge variant={getStatusColor(project.status)} className="text-sm">
                        {project.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Inicio
                    </label>
                    <p className="text-base font-medium mt-1">
                      {formatDate(project.start_date)}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Finalización
                    </label>
                    <p className="text-base font-medium mt-1">
                      {formatDate(project.end_date)}
                    </p>
                  </div>

                  {project.subscription_date && (
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        Suscripción
                      </label>
                      <p className="text-sm mt-1">
                        {formatDate(project.subscription_date)}
                      </p>
                    </div>
                  )}

                  {duration && (
                    <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        Duración Total
                      </label>
                      <p className="text-sm font-medium mt-1">
                        {duration.years > 0 && `${duration.years} año${duration.years !== 1 ? "s" : ""} `}
                        {duration.months > 0 && `${duration.months} mes${duration.months !== 1 ? "es" : ""} `}
                        {duration.days > 0 && `${duration.days} día${duration.days !== 1 ? "s" : ""}`}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {duration.totalDays} días totales
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Clasificación */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Clasificación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Tipo
                    </label>
                    <p className="text-sm font-medium mt-1">{project.type}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Financiación
                    </label>
                    <p className="text-sm font-medium mt-1">{project.financing}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Modalidad Ejecución
                    </label>
                    <p className="text-sm font-medium mt-1">
                      {project.execution_modality}
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
                </CardContent>
              </Card>
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
                    {formatCurrency(totalValue)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                    Modificaciones
                  </p>
                  <p className="text-2xl font-semibold text-success">
                    +{formatCurrency(totalModifications)}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {modificationsSummary?.total_modifications || 0} registradas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                    Valor Final
                  </p>
                  <p className="text-2xl font-semibold text-primary">
                    {formatCurrency(finalValue)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                    Incremento
                  </p>
                  <p className="text-2xl font-semibold text-info">
                    {totalValue > 0
                      ? `+${((totalModifications / totalValue) * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detalle de Aportes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Distribución Presupuestal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Beneficio Institucional ({project.institutional_benefit_percentage}%)
                    </p>
                    <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                      {formatCurrency(project.institutional_benefit_value)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Aporte de la Entidad
                    </p>
                    <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                      {formatCurrency(project.entity_contribution)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Porcentaje</p>
                    <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                      {totalValue > 0
                        ? `${((project.entity_contribution / totalValue) * 100).toFixed(1)}%`
                        : "0%"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Aporte de la Universidad
                    </p>
                    <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                      {formatCurrency(project.university_contribution)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Porcentaje</p>
                    <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                      {totalValue > 0
                        ? `${((project.university_contribution / totalValue) * 100).toFixed(1)}%`
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
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor Adición</TableHead>
                        <TableHead>Extensión</TableHead>
                        <TableHead>Nueva Fecha</TableHead>
                        <TableHead>Justificación</TableHead>
                        <TableHead>Acto Admin.</TableHead>
                        <TableHead>Fecha Aprob.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modifications.map((mod) => {
                        const badge = getModificationBadge(mod.type)
                        return (
                          <TableRow key={mod.id}>
                            <TableCell className="font-semibold">#{mod.number}</TableCell>
                            <TableCell>
                              <Badge variant={badge.variant}>{badge.label}</Badge>
                            </TableCell>
                            <TableCell>
                              {mod.addition_value ? (
                                <span className="font-medium text-success">
                                  +{formatCurrency(mod.addition_value)}
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              {mod.extension_days ? (
                                <span className="font-medium text-info">
                                  +{mod.extension_days} días
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              {mod.new_end_date ? formatDate(mod.new_end_date) : "-"}
                            </TableCell>
                            <TableCell>
                              <p className="max-w-md truncate text-sm">
                                {mod.justification}
                              </p>
                            </TableCell>
                            <TableCell className="text-sm">
                              {mod.administrative_act || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
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
                <CardTitle className="text-lg font-semibold">Línea de Tiempo del Proyecto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Línea vertical */}
                  <div className="absolute left-8 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-700"></div>

                  <div className="space-y-8">
                    {/* Suscripción */}
                    {project.subscription_date && (
                      <div className="relative flex gap-6">
                        <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-info/10 border-2 border-info">
                          <FileText className="h-6 w-6 text-info" />
                        </div>
                        <div className="flex-1 pt-3">
                          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                            Suscripción del Proyecto
                          </h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            {formatDate(project.subscription_date)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Inicio */}
                    <div className="relative flex gap-6">
                      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 border-2 border-success">
                        <Calendar className="h-6 w-6 text-success" />
                      </div>
                      <div className="flex-1 pt-3">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                          Inicio de Ejecución
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          {formatDate(project.start_date)}
                        </p>
                      </div>
                    </div>

                    {/* Modificaciones */}
                    {modifications &&
                      modifications.map((mod) => (
                        <div key={mod.id} className="relative flex gap-6">
                          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 border-2 border-warning">
                            <FileEdit className="h-6 w-6 text-warning" />
                          </div>
                          <div className="flex-1 pt-3">
                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                              Modificación #{mod.number}
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                              {mod.approval_date
                                ? formatDate(mod.approval_date)
                                : "Sin fecha de aprobación"}
                            </p>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 space-y-1">
                              {mod.addition_value && (
                                <p>Adición: +{formatCurrency(mod.addition_value)}</p>
                              )}
                              {mod.extension_days && (
                                <p>Prórroga: +{mod.extension_days} días</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Finalización */}
                    <div className="relative flex gap-6">
                      <div
                        className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 ${
                          project.status === "Finalizado"
                            ? "bg-primary/10 border-primary"
                            : "bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600"
                        }`}
                      >
                        <Clock
                          className={`h-6 w-6 ${
                            project.status === "Finalizado"
                              ? "text-primary"
                              : "text-neutral-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 pt-3">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                          Finalización {project.status === "Finalizado" ? "" : "Programada"}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          {formatDate(modificationsSummary?.final_end_date || project.end_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tiempo Transcurrido</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    {progress}%
                  </p>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Duración Original</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {duration ? duration.totalDays : 0}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">días</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Extensiones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-semibold text-neutral-900 dark:text-neutral-100">
                    +{totalExtensionDays}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    días adicionales
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}