import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SearchableSelect from "@/components/SearchableSelect"
import { Card, CardContent } from "@/components/ui/card"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { rupCodesApi } from "@/lib/api"
import RupCodeSelector from "@/components/RupCodeSelector"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  entitiesApi, 
  dependenciesApi, 
  statesApi, 
  projectTypesApi,
  financingTypesApi,
  executionModalitiesApi,
  officialsApi,
  projectsApi
} from "@/lib/api"

export default function EditProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // Queries para cargar datos de los catálogos
  const { data: entities } = useQuery({
    queryKey: ["entities-active"],
    queryFn: entitiesApi.getActive,
  })

  const { data: dependencies } = useQuery({
    queryKey: ["dependencies-active"],
    queryFn: dependenciesApi.getActive,
  })

  const { data: projectStates } = useQuery({
    queryKey: ["project-states-active"],
    queryFn: statesApi.getActive,
  })

  const { data: projectTypes } = useQuery({
    queryKey: ["project-types-active"],
    queryFn: projectTypesApi.getActive,
  })

  const { data: financingTypes } = useQuery({
    queryKey: ["financing-types-active"],
    queryFn: financingTypesApi.getActive,
  })

  const { data: executionModalities } = useQuery({
    queryKey: ["execution-modalities-active"],
    queryFn: executionModalitiesApi.getActive,
  })

  const { data: officials } = useQuery({
    queryKey: ["officials-active"],
    queryFn: officialsApi.getActive,
  })

  // Cargar proyecto
  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.getById(id),
  })

  // Cargar códigos RUP del proyecto
  const { data: projectRupCodes } = useQuery({
    queryKey: ["project-rup-codes", id],
    queryFn: () => {
      if (project) {
        return rupCodesApi.getByProject(project.project_year, project.internal_project_number)
      }
      return Promise.resolve([])
    },
    enabled: !!project,
  })

  const [formData, setFormData] = useState({
    anio_proyecto: new Date().getFullYear(),
    numero_proyecto_externo: "",
    nombre_proyecto: "",
    objeto_proyecto: "",
    entidad_id: "",
    dependencia_ejecutora_id: "",
    estado_proyecto_id: "",
    tipo_proyecto_id: "",
    tipo_financiacion_id: "",
    modalidad_ejecucion_id: "",
    valor_proyecto: "",
    codigo_contable: "",
    porcentaje_beneficio: 12,
    valor_beneficio: "",
    aporte_universidad: "",
    aporte_entidad: "",
    cantidad_beneficiarios: "",
    fecha_suscripcion: "",
    fecha_inicio: "",
    fecha_finalizacion: "",
    funcionario_ordenador_id: "",
    correo_principal: "",
    acto_administrativo: "",
    enlace_secop: "",
    observaciones: "",
     session_type: "",
    minutes_date: "",
    minutes_number: "",
  })

  const [correosSecundarios, setCorreosSecundarios] = useState([])
  const [selectedRupCodes, setSelectedRupCodes] = useState([])
  const [observacionesGeneralesRup, setObservacionesGeneralesRup] = useState('')
  const [showSecondaryEmails, setShowSecondaryEmails] = useState(false)
  const [duration, setDuration] = useState({ years: 0, months: 0, days: 0 })
  const [showConfirm, setShowConfirm] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Formatear fecha para input type="date"
  const formatDateForInput = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  // Formatear número con separadores de miles
  const formatNumber = (value) => {
    if (!value) return ""
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  // Limpiar número (quitar puntos)
  const cleanNumber = (value) => {
    if (!value) return 0
    return parseFloat(value.toString().replace(/\./g, "")) || 0
  }

  // Formatear moneda
  const formatCurrency = (value) => {
    const num = cleanNumber(value)
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(num)
  }

  // Cargar datos del proyecto
  useEffect(() => {
    if (project) {
      setFormData({
        anio_proyecto: project.project_year || new Date().getFullYear(),
        numero_proyecto_externo: project.external_project_number || "",
        nombre_proyecto: project.project_name || "",
        objeto_proyecto: project.project_purpose || "",
        entidad_id: project.entity_id || "",
        dependencia_ejecutora_id: project.executing_department_id || "",
        estado_proyecto_id: project.project_status_id || "",
        tipo_proyecto_id: project.project_type_id || "",
        tipo_financiacion_id: project.financing_type_id || "",
        modalidad_ejecucion_id: project.execution_modality_id || "",
        valor_proyecto: formatNumber(Math.round(project.project_value)),
        codigo_contable: project.accounting_code || "",
        porcentaje_beneficio: project.institutional_benefit_percentage || 12,
        valor_beneficio: formatNumber(Math.round(project.institutional_benefit_value)),
        aporte_universidad: formatNumber(Math.round(project.university_contribution)),
        aporte_entidad: formatNumber(Math.round(project.entity_contribution)),
        cantidad_beneficiarios: project.beneficiaries_count || "",
        fecha_suscripcion: formatDateForInput(project.subscription_date),
        fecha_inicio: formatDateForInput(project.start_date),
        fecha_finalizacion: formatDateForInput(project.end_date),
        funcionario_ordenador_id: project.ordering_official_id,
        correo_principal: project.main_email || "",
        acto_administrativo: project.administrative_act || "",
        enlace_secop: project.secop_link || "",
        observaciones: project.observations || "",
        session_type: project.session_type || "",
        minutes_date: formatDateForInput(project.minutes_date),
        minutes_number: project.minutes_number || "",
      })

      // Cargar correos secundarios
      if (project.secondary_emails && project.secondary_emails.length > 0) {
        setCorreosSecundarios(project.secondary_emails)
        setShowSecondaryEmails(true)
      }
    }
  }, [project])

  // Cargar los códigos RUP ya asignados
  useEffect(() => {
    if (projectRupCodes) {
      if (projectRupCodes.codes && Array.isArray(projectRupCodes.codes)) {
        if (projectRupCodes.codes.length > 0) {
          const formattedCodes = projectRupCodes.codes.map(code => ({
            rup_code_id: code.rup_code_id,
            code: code.code,
            description: code.description,
            segment_code: code.segment_code,
            segment_name: code.segment_name,
            family_code: code.family_code,
            family_name: code.family_name,
            class_code: code.class_code,
            class_name: code.class_name,
            product_code: code.product_code,
            product_name: code.product_name,
            is_main_code: code.is_main_code
          }))
          setSelectedRupCodes(formattedCodes)
        }
        
        if (projectRupCodes.general_observations) {
          setObservacionesGeneralesRup(projectRupCodes.general_observations)
        }
      }
    }
  }, [projectRupCodes])

  // Calcular beneficio institucional
  useEffect(() => {
    const valor = cleanNumber(formData.valor_proyecto)
    const porcentaje = parseFloat(formData.porcentaje_beneficio) || 0
    const beneficio = (valor * porcentaje) / 100
    
    setFormData(prev => ({
      ...prev,
      valor_beneficio: formatNumber(Math.round(beneficio))
    }))
  }, [formData.valor_proyecto, formData.porcentaje_beneficio])

  // Calcular aporte entidad
  useEffect(() => {
    const valor = cleanNumber(formData.valor_proyecto)
    const aporteUni = cleanNumber(formData.aporte_universidad)
    const aporteEnt = valor - aporteUni
    
    if (aporteEnt >= 0) {
      setFormData(prev => ({
        ...prev,
        aporte_entidad: formatNumber(aporteEnt)
      }))
    }
  }, [formData.valor_proyecto, formData.aporte_universidad])

  // Calcular duración
  useEffect(() => {
    if (!formData.fecha_inicio || !formData.fecha_finalizacion) {
      setDuration({ years: 0, months: 0, days: 0 })
      return
    }

    const inicio = new Date(formData.fecha_inicio)
    const fin = new Date(formData.fecha_finalizacion)

    if (fin < inicio) {
      setDuration({ years: 0, months: 0, days: 0 })
      return
    }

    let years = fin.getFullYear() - inicio.getFullYear()
    let months = fin.getMonth() - inicio.getMonth()
    let days = fin.getDate() - inicio.getDate()

    if (days < 0) {
      months--
      const lastMonth = new Date(fin.getFullYear(), fin.getMonth(), 0)
      days += lastMonth.getDate()
    }

    if (months < 0) {
      years--
      months += 12
    }

    setDuration({ years, months, days })
  }, [formData.fecha_inicio, formData.fecha_finalizacion])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNumberInput = (e) => {
    const { name, value } = e.target
    const cleanValue = value.replace(/\D/g, "")
    setFormData(prev => ({ ...prev, [name]: formatNumber(cleanValue) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setShowConfirm(true)
  }

  const confirmarActualizacion = async () => {
    setIsUpdating(true)
    try {
      const datos = {
        ...formData,
        valor_proyecto: cleanNumber(formData.valor_proyecto),
        valor_beneficio: cleanNumber(formData.valor_beneficio),
        aporte_universidad: cleanNumber(formData.aporte_universidad),
        aporte_entidad: cleanNumber(formData.aporte_entidad),
        correos_secundarios: correosSecundarios.filter((e) => e.trim() !== ""),
      }

      // Actualizar el proyecto
      await projectsApi.update(id, datos)
      
      // Actualizar códigos RUP
      if (project) {
        await rupCodesApi.assignToProject(
          formData.anio_proyecto,
          project.internal_project_number,
          selectedRupCodes.map(code => ({ 
            rup_code_id: code.rup_code_id, 
            is_main_code: code.is_main_code 
          })),
          observacionesGeneralesRup
        )
      }

      // Invalidar caché
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["project", id] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })

      setShowConfirm(false)
      alert("¡Proyecto actualizado exitosamente!")
      navigate("/projects")
    } catch (error) {
      console.error("Error al actualizar proyecto:", error)
      alert("Error al actualizar el proyecto: " + error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const agregarCorreo = () => {
    setCorreosSecundarios([...correosSecundarios, ""])
  }

  const actualizarCorreo = (index, value) => {
    const nuevos = [...correosSecundarios]
    nuevos[index] = value
    setCorreosSecundarios(nuevos)
  }

  const eliminarCorreo = (index) => {
    setCorreosSecundarios(correosSecundarios.filter((_, i) => i !== index))
  }

  // Calcular porcentajes para la vista previa
  const valorTotal = cleanNumber(formData.valor_proyecto)
  const beneficioInst = cleanNumber(formData.valor_beneficio)
  const aporteEntidad = cleanNumber(formData.aporte_entidad)
  const aporteUniv = cleanNumber(formData.aporte_universidad)
  
  const porcentajeBeneficio = valorTotal > 0 ? (beneficioInst / valorTotal) * 100 : 0
  const porcentajeEntidad = valorTotal > 0 ? (aporteEntidad / valorTotal) * 100 : 0
  const porcentajeUniv = valorTotal > 0 ? (aporteUniv / valorTotal) * 100 : 0
  const porcentajeOtros = 100 - porcentajeBeneficio - porcentajeEntidad - porcentajeUniv

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Cargando proyecto...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-xl text-text-secondary">Proyecto no encontrado</p>
          <Button onClick={() => navigate("/projects")} className="mt-4">
            Volver a Proyectos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header fijo */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/projects')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Editar Proyecto</h1>
                <p className="text-sm text-text-secondary mt-0.5">
                  {project.code} - {project.project_name}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/projects')}
              >
                Cancelar
              </Button>
              <Button onClick={handleSubmit} form="project-form" disabled={isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? "Actualizando..." : "Actualizar Proyecto"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-[1800px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Formulario - 2 columnas */}
          <div className="lg:col-span-2">
            <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* INFORMACIÓN GENERAL */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white text-xl">
                      📋
                    </div>
                    <h2 className="text-xl font-semibold">Información General</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Año del Proyecto <span className="text-danger">*</span>
                      </label>
                      <Input
                        type="number"
                        name="anio_proyecto"
                        value={formData.anio_proyecto}
                        onChange={handleInputChange}
                        required
                        min="2020"
                        max="2030"
                        disabled
                        className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                      />
                      <p className="text-xs text-warning mt-1">
                        El año no se puede modificar
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Número Proyecto Externo
                      </label>
                      <Input
                        name="numero_proyecto_externo"
                        value={formData.numero_proyecto_externo}
                        onChange={handleInputChange}
                        maxLength={20}
                        placeholder="Ej: CONV-2024-001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Nombre del Proyecto <span className="text-danger">*</span>
                    </label>
                    <Input
                      name="nombre_proyecto"
                      value={formData.nombre_proyecto}
                      onChange={handleInputChange}
                      required
                      maxLength={800}
                      placeholder="Ingrese el nombre completo del proyecto"
                    />
                    <p className="text-xs text-right mt-1 text-text-secondary">
                      {formData.nombre_proyecto.length}/800
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Objeto del Proyecto <span className="text-danger">*</span>
                    </label>
                    <textarea
                      name="objeto_proyecto"
                      value={formData.objeto_proyecto}
                      onChange={handleInputChange}
                      required
                      maxLength={1800}
                      placeholder="Describa el objeto y propósito del proyecto"
                      className="w-full min-h-[100px] px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-right mt-1 text-text-secondary">
                      {formData.objeto_proyecto.length}/1800
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Entidad <span className="text-danger">*</span>
                      </label>
                      <SearchableSelect
                        name="entidad_id"
                        value={formData.entidad_id}
                        onChange={handleInputChange}
                        options={entities || []}
                        placeholder="Seleccione una entidad..."
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Dependencia Ejecutora <span className="text-danger">*</span>
                      </label>
                      <SearchableSelect
                        name="dependencia_ejecutora_id"
                        value={formData.dependencia_ejecutora_id}
                        onChange={handleInputChange}
                        options={dependencies || []}
                        placeholder="Seleccione una dependencia..."
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Supervisor del Proyecto <span className="text-danger">*</span>
                    </label>
                    <SearchableSelect
                      name="funcionario_ordenador_id"
                      value={formData.funcionario_ordenador_id}
                      onChange={handleInputChange}
                      options={officials || []}
                      placeholder="Seleccione supervisor del proyecto..."
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Acto Administrativo
                    </label>
                    <Input
                      name="acto_administrativo"
                      value={formData.acto_administrativo}
                      onChange={handleInputChange}
                      maxLength={50}
                      placeholder="Ej: Resolución 001-2024"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* CLASIFICACIÓN */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white text-xl">
                      📊
                    </div>
                    <h2 className="text-xl font-semibold">Clasificación del Proyecto</h2>
                  </div>

                  {/* Fila 1: Estado + Tipo de Proyecto */}
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Estado del Proyecto <span className="text-danger">*</span>
                      </label>
                      <SearchableSelect
                        name="estado_proyecto_id"
                        value={formData.estado_proyecto_id}
                        onChange={handleInputChange}
                        options={projectStates || []}
                        placeholder="Seleccione un estado..."
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Tipo de Proyecto <span className="text-danger">*</span>
                      </label>
                      <SearchableSelect
                        name="tipo_proyecto_id"
                        value={formData.tipo_proyecto_id}
                        onChange={handleInputChange}
                        options={projectTypes || []}
                        placeholder="Seleccione un tipo..."
                        required
                      />
                    </div>
                  </div>

                  {/* Fila 2: Tipo de Financiación + Modalidad de Ejecución */}
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Tipo de Financiación <span className="text-danger">*</span>
                      </label>
                      <SearchableSelect
                        name="tipo_financiacion_id"
                        value={formData.tipo_financiacion_id}
                        onChange={handleInputChange}
                        options={financingTypes || []}
                        placeholder="Seleccione tipo de financiación..."
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Modalidad de Ejecución <span className="text-danger">*</span>
                      </label>
                      <SearchableSelect
                        name="modalidad_ejecucion_id"
                        value={formData.modalidad_ejecucion_id}
                        onChange={handleInputChange}
                        options={executionModalities || []}
                        placeholder="Seleccione modalidad de ejecución..."
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* INFORMACIÓN ECONÓMICA */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white text-xl">
                      💰
                    </div>
                    <h2 className="text-xl font-semibold">Información Económica</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Valor del Proyecto (COP) <span className="text-danger">*</span>
                      </label>
                      <Input
                        name="valor_proyecto"
                        value={formData.valor_proyecto}
                        onChange={handleNumberInput}
                        required
                        placeholder="1.000.000"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Código Contable
                      </label>
                      <Input
                        name="codigo_contable"
                        value={formData.codigo_contable}
                        onChange={handleInputChange}
                        maxLength={50}
                        placeholder="Ej: 1234-5678-90"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Porcentaje Beneficio
                      </label>
                      <Input
                        type="number"
                        name="porcentaje_beneficio"
                        value={formData.porcentaje_beneficio}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-sm font-medium block mb-2">
                        Valor Beneficio Institucional (Calculado)
                      </label>
                      <Input
                        value={formData.valor_beneficio}
                        disabled
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Contrapartida en Especie (COP)
                      </label>
                      <Input
                        name="aporte_universidad"
                        value={formData.aporte_universidad}
                        onChange={handleNumberInput}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Aporte Entidad (COP) <span className="text-danger">*</span>
                      </label>
                      <Input
                        name="aporte_entidad"
                        value={formData.aporte_entidad}
                        onChange={handleNumberInput}
                        required
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Población Impactada Proyectada (Cantidad de Beneficiarios)
                    </label>
                    <Input
                      type="number"
                      name="cantidad_beneficiarios"
                      value={formData.cantidad_beneficiarios}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="Ingrese la cantidad estimada de beneficiarios"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* CRONOGRAMA */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white text-xl">
                      📅
                    </div>
                    <h2 className="text-xl font-semibold">Cronograma</h2>
                  </div>

                  <div className="grid grid-cols-3 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Fecha de Suscripción <span className="text-danger">*</span>
                      </label>
                      <Input
                        type="date"
                        name="fecha_suscripcion"
                        value={formData.fecha_suscripcion}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Fecha de Inicio <span className="text-danger">*</span>
                      </label>
                      <Input
                        type="date"
                        name="fecha_inicio"
                        value={formData.fecha_inicio}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Fecha de Finalización <span className="text-danger">*</span>
                      </label>
                      <Input
                        type="date"
                        name="fecha_finalizacion"
                        value={formData.fecha_finalizacion}
                        onChange={handleInputChange}
                        required
                        min={formData.fecha_inicio}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* DATOS DE APROBACIÓN DEL PROYECTO */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white text-xl">
                      ✅
                    </div>
                    <h2 className="text-xl font-semibold">Datos de Aprobación del Proyecto - Comité Central</h2>
                  </div>

                  <div className="grid grid-cols-3 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Tipo de Sesión <span className="text-danger">*</span>
                      </label>
                      <select
                        name="session_type"
                        value={formData.session_type}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Seleccione...</option>
                        <option value="Ordinaria">Sesión Ordinaria</option>
                        <option value="Extraordinaria">Sesión Extraordinaria</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Fecha del Acta <span className="text-danger">*</span>
                      </label>
                      <Input
                        type="date"
                        name="minutes_date"
                        value={formData.minutes_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Número del Acta <span className="text-danger">*</span>
                      </label>
                      <Input
                        name="minutes_number"
                        value={formData.minutes_number}
                        onChange={handleInputChange}
                        required
                        maxLength={50}
                        placeholder="Ej: 001-2024"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CÓDIGOS RUP */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white text-xl">
                      🏷️
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Códigos RUP</h2>
                      <p className="text-sm text-text-secondary">
                        Clasificación según el Registro Único de Proponentes (opcional)
                      </p>
                    </div>
                  </div>

                  <RupCodeSelector
                    selectedRupCodes={selectedRupCodes}
                    onSelectionChange={setSelectedRupCodes}
                  />

                  {selectedRupCodes.length > 0 && (
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Observaciones para Códigos RUP
                      </label>
                      <textarea
                        value={observacionesGeneralesRup}
                        onChange={(e) => setObservacionesGeneralesRup(e.target.value)}
                        maxLength={500}
                        placeholder="Observaciones generales para los códigos RUP (opcional)"
                        className="w-full min-h-[80px] px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-xs text-right mt-1 text-text-secondary">
                        {observacionesGeneralesRup.length}/500
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* INFORMACIÓN ADICIONAL */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white text-xl">
                      📄
                    </div>
                    <h2 className="text-xl font-semibold">Información Adicional</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Correo Principal
                      </label>
                      <Input
                        type="email"
                        name="correo_principal"
                        value={formData.correo_principal}
                        onChange={handleInputChange}
                        placeholder="correo@udistrital.edu.co"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 mb-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showSecondaryEmails}
                        onChange={(e) => setShowSecondaryEmails(e.target.checked)}
                        className="w-11 h-6 appearance-none bg-gray-300 rounded-full relative cursor-pointer transition-colors checked:bg-primary
                          before:content-[''] before:absolute before:w-[18px] before:h-[18px] before:rounded-full before:bg-white before:top-[3px] before:left-[3px] before:transition-transform
                          checked:before:translate-x-5"
                      />
                      <span className="text-sm font-medium">¿Desea registrar correos secundarios?</span>
                    </label>

                    {showSecondaryEmails && (
                      <div className="space-y-3">
                        {correosSecundarios.map((email, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              type="email"
                              value={email}
                              onChange={(e) => actualizarCorreo(index, e.target.value)}
                              placeholder="correo@ejemplo.com"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => eliminarCorreo(index)}
                              className="text-danger hover:bg-red-100"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={agregarCorreo}
                          className="w-full border-dashed"
                        >
                          + Agregar Correo Secundario
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Enlace SECOP
                    </label>
                    <Input
                      type="url"
                      name="enlace_secop"
                      value={formData.enlace_secop}
                      onChange={handleInputChange}
                      placeholder="https://www.colombiacompra.gov.co/..."
                      maxLength={1000}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Observaciones
                    </label>
                    <textarea
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleInputChange}
                      maxLength={500}
                      placeholder="Observaciones generales del proyecto"
                      className="w-full min-h-[80px] px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-right mt-1 text-text-secondary">
                      {formData.observaciones.length}/500
                    </p>
                  </div>
                </CardContent>
              </Card>

            </form>
          </div>

          {/* Vista Previa - 1 columna sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white text-xl">
                      📊
                    </div>
                    <h3 className="text-lg font-semibold">Vista Previa del Proyecto</h3>
                  </div>

                  {/* Nombre */}
                  <div>
                    <p className="text-xs font-medium text-text-secondary uppercase mb-2">NOMBRE</p>
                    <p className="text-base font-medium">
                      {formData.nombre_proyecto || "Sin especificar"}
                    </p>
                  </div>

                  {/* Año */}
                  <div>
                    <p className="text-xs font-medium text-text-secondary uppercase mb-2">AÑO</p>
                    <p className="text-2xl font-bold text-primary">{formData.anio_proyecto}</p>
                  </div>

                  {/* Valor Total */}
                  <div>
                    <p className="text-xs font-medium text-text-secondary uppercase mb-2">VALOR TOTAL</p>
                    <p className="text-2xl font-bold text-warning">
                      {valorTotal > 0 ? formatCurrency(valorTotal) : "$ 0"}
                    </p>
                  </div>

                  {/* Beneficio Institucional */}
                  <div>
                    <p className="text-xs font-medium text-text-secondary uppercase mb-2">BENEFICIO INSTITUCIONAL</p>
                    <p className="text-xl font-bold">
                      {beneficioInst > 0 ? formatCurrency(beneficioInst) : "$ 0"}
                    </p>
                  </div>

                  {/* Duración */}
                  <div>
                    <p className="text-xs font-medium text-text-secondary uppercase mb-2">DURACIÓN</p>
                    {duration.years > 0 || duration.months > 0 || duration.days > 0 ? (
                      <p className="text-base font-medium">
                        {duration.years > 0 && `${duration.years} año${duration.years > 1 ? 's' : ''} `}
                        {duration.months > 0 && `${duration.months} mes${duration.months > 1 ? 'es' : ''} `}
                        {duration.days > 0 && `${duration.days} día${duration.days > 1 ? 's' : ''}`}
                      </p>
                    ) : (
                      <p className="text-base text-text-secondary">Sin especificar</p>
                    )}
                  </div>

                  {/* Distribución Económica */}
                  <div className="pt-4 border-t">
                    <p className="text-xs font-medium text-text-secondary uppercase mb-4">DISTRIBUCIÓN ECONÓMICA</p>
                    <div className="space-y-3">
                      {/* Valor Total */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-text-secondary">Valor Total</span>
                          <span className="font-medium">{valorTotal > 0 ? formatCurrency(valorTotal) : "$0"}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-warning h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>

                      {/* Beneficio Inst */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-text-secondary">Beneficio Inst.</span>
                          <span className="font-medium">{beneficioInst > 0 ? formatCurrency(beneficioInst) : "$0"}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-[#FF9800] h-2 rounded-full" style={{ width: `${porcentajeBeneficio}%` }}></div>
                        </div>
                      </div>

                      {/* Aporte Entidad */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-text-secondary">Aporte Entidad</span>
                          <span className="font-medium">{aporteEntidad > 0 ? formatCurrency(aporteEntidad) : "$0"}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-success h-2 rounded-full" style={{ width: `${porcentajeEntidad}%` }}></div>
                        </div>
                      </div>

                      {/* Aporte Univ */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-text-secondary">Aporte Univ.</span>
                          <span className="font-medium">{aporteUniv > 0 ? formatCurrency(aporteUniv) : "$0"}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-info h-2 rounded-full" style={{ width: `${porcentajeUniv}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Distribución Porcentual */}
                  <div className="pt-4 border-t">
                    <p className="text-xs font-medium text-text-secondary uppercase mb-4">DISTRIBUCIÓN PORCENTUAL</p>
                    
                    {/* Gráfico de Dona */}
                    <div className="relative w-48 h-48 mx-auto mb-4">
                      <svg viewBox="0 0 200 200" className="transform -rotate-90">
                        {/* Círculo de fondo */}
                        <circle
                          cx="100"
                          cy="100"
                          r="80"
                          fill="none"
                          stroke="#e0e0e0"
                          strokeWidth="40"
                        />
                        
                        {/* Segmentos del gráfico */}
                        {valorTotal > 0 && (
                          <>
                            {/* Beneficio Inst - Naranja */}
                            <circle
                              cx="100"
                              cy="100"
                              r="80"
                              fill="none"
                              stroke="#FF9800"
                              strokeWidth="40"
                              strokeDasharray={`${(porcentajeBeneficio / 100) * 502.65} 502.65`}
                              strokeDashoffset="0"
                            />
                            
                            {/* Aporte Entidad - Verde */}
                            <circle
                              cx="100"
                              cy="100"
                              r="80"
                              fill="none"
                              stroke="#43A047"
                              strokeWidth="40"
                              strokeDasharray={`${(porcentajeEntidad / 100) * 502.65} 502.65`}
                              strokeDashoffset={`-${(porcentajeBeneficio / 100) * 502.65}`}
                            />
                            
                            {/* Aporte Univ - Azul */}
                            <circle
                              cx="100"
                              cy="100"
                              r="80"
                              fill="none"
                              stroke="#00ACC1"
                              strokeWidth="40"
                              strokeDasharray={`${(porcentajeUniv / 100) * 502.65} 502.65`}
                              strokeDashoffset={`-${((porcentajeBeneficio + porcentajeEntidad) / 100) * 502.65}`}
                            />
                            
                            {/* Otros - Amarillo */}
                            {porcentajeOtros > 0 && (
                              <circle
                                cx="100"
                                cy="100"
                                r="80"
                                fill="none"
                                stroke="#F9A825"
                                strokeWidth="40"
                                strokeDasharray={`${(porcentajeOtros / 100) * 502.65} 502.65`}
                                strokeDashoffset={`-${((porcentajeBeneficio + porcentajeEntidad + porcentajeUniv) / 100) * 502.65}`}
                              />
                            )}
                          </>
                        )}
                      </svg>
                      
                      {/* Texto central */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-xs text-text-secondary">Total</p>
                        <p className="text-3xl font-bold text-warning">100%</p>
                      </div>
                    </div>

                    {/* Leyenda */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-sm bg-[#FF9800]"></div>
                          <span className="text-sm">Beneficio Inst.</span>
                        </div>
                        <span className="text-sm font-medium">{porcentajeBeneficio.toFixed(1)}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-sm bg-success"></div>
                          <span className="text-sm">Aporte Entidad</span>
                        </div>
                        <span className="text-sm font-medium">{porcentajeEntidad.toFixed(1)}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-sm bg-info"></div>
                          <span className="text-sm">Aporte Univ.</span>
                        </div>
                        <span className="text-sm font-medium">{porcentajeUniv.toFixed(1)}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-sm bg-warning"></div>
                          <span className="text-sm">Otros</span>
                        </div>
                        <span className="text-sm font-medium">{porcentajeOtros.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>

      {/* Modal de Confirmación */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md" onClose={() => setShowConfirm(false)}>
          <DialogHeader>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center text-4xl">
              📋
            </div>
            <DialogTitle className="text-center text-2xl">
              ¿Confirmar actualización del proyecto?
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-text-secondary">
            Está a punto de actualizar el proyecto en el sistema. Por favor verifique que toda la información sea correcta.
          </p>
          <DialogFooter className="flex justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button onClick={confirmarActualizacion} disabled={isUpdating}>
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? "Actualizando..." : "Sí, Actualizar Proyecto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}