import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { rupCodesApi } from "@/lib/api"
import RupCodeSelector from "@/components/RupCodeSelector"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  projectsApi,
  entitiesApi,
  dependenciesApi,
  statesApi,
  projectTypesApi,
  financingTypesApi,
  executionModalitiesApi,
  contractingModalitiesApi,
  officialsApi,
} from "@/lib/api"

export default function EditProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Cargar datos del proyecto
  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.getById(id),
  })

  // Cargar catálogos
  const { data: entities } = useQuery({
    queryKey: ["entities"],
    queryFn: () => entitiesApi.getActive(),
  })

  const { data: departments } = useQuery({
    queryKey: ["dependencies"],
    queryFn: () => dependenciesApi.getActive(),
  })

  const { data: projectStates } = useQuery({
    queryKey: ["project-states"],
    queryFn: () => statesApi.getActive(),
  })

  const { data: projectTypes } = useQuery({
    queryKey: ["project-types"],
    queryFn: () => projectTypesApi.getActive(),
  })

  const { data: financingTypes } = useQuery({
    queryKey: ["financing-types"],
    queryFn: () => financingTypesApi.getActive(),
  })

  const { data: executionModalities } = useQuery({
    queryKey: ["execution-modalities"],
    queryFn: () => executionModalitiesApi.getActive(),
  })

  const { data: contractingModalities } = useQuery({
    queryKey: ["contracting-modalities"],
    queryFn: () => contractingModalitiesApi.getActive(),
  })

  const { data: officials } = useQuery({
    queryKey: ["officials"],
    queryFn: () => officialsApi.getActive(),
  })
// Cargar todos los códigos RUP disponibles
const { data: rupCodes } = useQuery({
  queryKey: ["rup-codes"],
  queryFn: () => rupCodesApi.getAll(),
})

// Cargar códigos RUP ya asignados al proyecto
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
    modalidad_contratacion_id: "",
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
  })

  const [correosSecundarios, setCorreosSecundarios] = useState([])
  const [showConfirm, setShowConfirm] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [duration, setDuration] = useState({ years: 0, months: 0, days: 0 })
  const [selectedRupCodes, setSelectedRupCodes] = useState([])

  // Formatear número con separadores de miles
  const formatNumber = (value) => {
    if (!value) return ""
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  // Limpiar número
  const cleanNumber = (value) => {
    if (!value) return 0
    return parseFloat(value.toString().replace(/\./g, "")) || 0
  }

// Formatear fecha para input date (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return ""
    
    // Si ya viene en formato correcto (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString
    }
    
    // Si viene con hora (YYYY-MM-DDTHH:mm:ss)
    if (dateString.includes('T')) {
      return dateString.split('T')[0]
    }
    
    // Si viene en otro formato, intentar parsearlo
    try {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    } catch {
      return ""
    }
  }

// Cargar datos del proyecto cuando esté disponible
  useEffect(() => {
    if (project) {
      setFormData({
        anio_proyecto: project.project_year,
        numero_proyecto_externo: project.external_project_number || "",
        nombre_proyecto: project.project_name,
        objeto_proyecto: project.project_purpose,
        entidad_id: project.entity_id,
        dependencia_ejecutora_id: project.executing_department_id,
        estado_proyecto_id: project.project_status_id,
        tipo_proyecto_id: project.project_type_id,
        tipo_financiacion_id: project.financing_type_id,
        modalidad_ejecucion_id: project.execution_modality_id,
        modalidad_contratacion_id: project.contracting_modality_id || "",
        valor_proyecto: formatNumber(project.project_value),
        codigo_contable: project.accounting_code || "",
        porcentaje_beneficio: project.institutional_benefit_percentage || 12,
        valor_beneficio: formatNumber(project.institutional_benefit_value),
        aporte_universidad: formatNumber(project.university_contribution),
        aporte_entidad: formatNumber(project.entity_contribution),
        cantidad_beneficiarios: project.beneficiaries_count || "",
        // ✅ USAR LA FUNCIÓN HELPER PARA LAS FECHAS:
        fecha_suscripcion: formatDateForInput(project.subscription_date),
        fecha_inicio: formatDateForInput(project.start_date),
        fecha_finalizacion: formatDateForInput(project.end_date),
        funcionario_ordenador_id: project.ordering_official_id,
        correo_principal: project.main_email || "",
        acto_administrativo: project.administrative_act || "",
        enlace_secop: project.secop_link || "",
        observaciones: project.observations || "",
      })

      if (project.secondary_emails && Array.isArray(project.secondary_emails)) {
        setCorreosSecundarios(project.secondary_emails)
      }
    }
  }, [project])

  // Cargar códigos RUP del proyecto
useEffect(() => {
  if (projectRupCodes) {
    const formattedRupCodes = projectRupCodes.map((code) => ({
      rup_code_id: code.rup_code_id,
      code: code.code,
      description: code.description,
      main_category: code.main_category,
      subcategory: code.subcategory,
      is_main_code: code.is_main_code,
      participation_percentage: code.participation_percentage,
      observations: code.observations || "",
    }))
    setSelectedRupCodes(formattedRupCodes)
  }
}, [projectRupCodes])

  // Auto-calcular beneficio institucional
  useEffect(() => {
    const valor = cleanNumber(formData.valor_proyecto)
    const porcentaje = formData.porcentaje_beneficio || 12

    if (valor > 0) {
      const beneficio = (valor * porcentaje) / 100
      setFormData((prev) => ({
        ...prev,
        valor_beneficio: formatNumber(beneficio),
      }))
    }
  }, [formData.valor_proyecto, formData.porcentaje_beneficio])

  // Auto-calcular aporte entidad
  useEffect(() => {
    const valorTotal = cleanNumber(formData.valor_proyecto)
    const aporteUniv = cleanNumber(formData.aporte_universidad)
    const aporteEnt = valorTotal - aporteUniv

    if (aporteEnt >= 0) {
      setFormData((prev) => ({
        ...prev,
        aporte_entidad: formatNumber(aporteEnt),
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
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberInput = (e) => {
    const { name, value } = e.target
    const cleanValue = value.replace(/\D/g, "")
    setFormData((prev) => ({ ...prev, [name]: formatNumber(cleanValue) }))
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

    // ✅ AGREGAR: Actualizar códigos RUP
    if (project) {
      await rupCodesApi.assignToProject(
        project.project_year,
        project.internal_project_number,
        selectedRupCodes
      )
    }

    // Invalidar caché
    queryClient.invalidateQueries({ queryKey: ["projects"] })
    queryClient.invalidateQueries({ queryKey: ["project", id] })
    queryClient.invalidateQueries({ queryKey: ["project-rup-codes", id] })

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

  const formatCurrency = (value) => {
    if (!value) return "$0"
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Calcular porcentajes para la vista previa
  const valorTotal = cleanNumber(formData.valor_proyecto)
  const beneficioInst = cleanNumber(formData.valor_beneficio)
  const aporteEntidad = cleanNumber(formData.aporte_entidad)
  const aporteUniv = cleanNumber(formData.aporte_universidad)

  const porcentajeBeneficio = valorTotal > 0 ? (beneficioInst / valorTotal) * 100 : 0
  const porcentajeEntidad = valorTotal > 0 ? (aporteEntidad / valorTotal) * 100 : 0
  const porcentajeUniv = valorTotal > 0 ? (aporteUniv / valorTotal) * 100 : 0

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                onClick={() => navigate("/projects")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Editar Proyecto</h1>
                <p className="text-sm text-text-secondary mt-0.5">
                  Modifique la información del proyecto
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/projects")}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isUpdating}>
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
                        className="bg-gray-100 dark:bg-gray-800"
                      />
                      <p className="text-xs text-warning mt-1">
                        <Info className="h-3 w-3 inline mr-1" />
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
                </CardContent>
              </Card>

              {/* RELACIONES */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white text-xl">
                      🏢
                    </div>
                    <h2 className="text-xl font-semibold">Relaciones del Proyecto</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Entidad <span className="text-danger">*</span>
                      </label>
                      <Select
                        name="entidad_id"
                        value={formData.entidad_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccione...</option>
                        {entities?.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Dependencia Ejecutora <span className="text-danger">*</span>
                      </label>
                      <Select
                        name="dependencia_ejecutora_id"
                        value={formData.dependencia_ejecutora_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccione...</option>
                        {departments?.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Estado del Proyecto <span className="text-danger">*</span>
                      </label>
                      <Select
                        name="estado_proyecto_id"
                        value={formData.estado_proyecto_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccione...</option>
                        {projectStates?.map((state) => (
                          <option key={state.id} value={state.id}>
                            {state.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Tipo de Proyecto <span className="text-danger">*</span>
                      </label>
                      <Select
                        name="tipo_proyecto_id"
                        value={formData.tipo_proyecto_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccione...</option>
                        {projectTypes?.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Financiación <span className="text-danger">*</span>
                      </label>
                      <Select
                        name="tipo_financiacion_id"
                        value={formData.tipo_financiacion_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccione...</option>
                        {financingTypes?.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Modalidad de Ejecución <span className="text-danger">*</span>
                      </label>
                      <Select
                        name="modalidad_ejecucion_id"
                        value={formData.modalidad_ejecucion_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccione...</option>
                        {executionModalities?.map((modality) => (
                          <option key={modality.id} value={modality.id}>
                            {modality.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Modalidad de Contratación
                      </label>
                      <Select
                        name="modalidad_contratacion_id"
                        value={formData.modalidad_contratacion_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Seleccione...</option>
                        {contractingModalities?.map((modality) => (
                          <option key={modality.id} value={modality.id}>
                            {modality.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* INFORMACIÓN FINANCIERA */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white text-xl">
                      💰
                    </div>
                    <h2 className="text-xl font-semibold">Información Financiera</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Valor Total del Proyecto <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                          $
                        </span>
                        <Input
                          name="valor_proyecto"
                          value={formData.valor_proyecto}
                          onChange={handleNumberInput}
                          required
                          placeholder="0"
                          className="pl-7"
                        />
                      </div>
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
                        placeholder="Ej: A-1234-2024"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold mb-3 text-blue-900 dark:text-blue-100">
                      Beneficio Institucional (Auto-calculado)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium block mb-2">
                          Porcentaje de Beneficio
                        </label>
                        <div className="relative">
                          <Input
                            type="number"
                            name="porcentaje_beneficio"
                            value={formData.porcentaje_beneficio}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                            %
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium block mb-2">
                          Valor del Beneficio
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                            $
                          </span>
                          <Input
                            name="valor_beneficio"
                            value={formData.valor_beneficio}
                            disabled
                            className="pl-7 bg-gray-100 dark:bg-gray-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Aporte de la Universidad
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                          $
                        </span>
                        <Input
                          name="aporte_universidad"
                          value={formData.aporte_universidad}
                          onChange={handleNumberInput}
                          placeholder="0"
                          className="pl-7"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Aporte de la Entidad (Auto-calculado)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                          $
                        </span>
                        <Input
                          name="aporte_entidad"
                          value={formData.aporte_entidad}
                          disabled
                          className="pl-7 bg-gray-100 dark:bg-gray-800"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Cantidad de Beneficiarios
                    </label>
                    <Input
                      type="number"
                      name="cantidad_beneficiarios"
                      value={formData.cantidad_beneficiarios}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="Ej: 500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* FECHAS */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white text-xl">
                      📅
                    </div>
                    <h2 className="text-xl font-semibold">Fechas del Proyecto</h2>
                  </div>

                  <div className="grid grid-cols-3 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Fecha de Suscripción
                      </label>
                      <Input
                        type="date"
                        name="fecha_suscripcion"
                        value={formData.fecha_suscripcion}
                        onChange={handleInputChange}
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
                      />
                    </div>
                  </div>

                  {duration.years > 0 || duration.months > 0 || duration.days > 0 ? (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        Duración del proyecto:{" "}
                        <span className="font-bold">
                          {duration.years > 0 && `${duration.years} año${duration.years !== 1 ? "s" : ""} `}
                          {duration.months > 0 && `${duration.months} mes${duration.months !== 1 ? "es" : ""} `}
                          {duration.days > 0 && `${duration.days} día${duration.days !== 1 ? "s" : ""}`}
                        </span>
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* RESPONSABLES Y CONTACTO */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white text-xl">
                      👤
                    </div>
                    <h2 className="text-xl font-semibold">Responsables y Contacto</h2>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Funcionario Ordenador <span className="text-danger">*</span>
                    </label>
                    <Select
                      name="funcionario_ordenador_id"
                      value={formData.funcionario_ordenador_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccione...</option>
                      {officials?.map((official) => (
                        <option key={official.id} value={official.id}>
                          {official.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Correo Principal del Proyecto
                    </label>
                    <Input
                      type="email"
                      name="correo_principal"
                      value={formData.correo_principal}
                      onChange={handleInputChange}
                      maxLength={200}
                      placeholder="proyecto@udistrital.edu.co"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Correos Secundarios
                    </label>
                    <div className="space-y-3">
                      {correosSecundarios.map((correo, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            type="email"
                            value={correo}
                            onChange={(e) => actualizarCorreo(index, e.target.value)}
                            placeholder="correo@ejemplo.com"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => eliminarCorreo(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={agregarCorreo}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Correo Secundario
                      </Button>
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
                    allRupCodes={rupCodes || []}
                    selectedRupCodes={selectedRupCodes}
                    onSelectionChange={setSelectedRupCodes}
                    />
                </CardContent>
                </Card>

              {/* DOCUMENTACIÓN */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white text-xl">
                      📄
                    </div>
                    <h2 className="text-xl font-semibold">Documentación</h2>
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
                      placeholder="Ej: Agreement 001-2024"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Enlace SECOP
                    </label>
                    <Input
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
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white text-xl">
                      📊
                    </div>
                    <h3 className="text-lg font-semibold">Vista Previa</h3>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-text-secondary uppercase mb-2">
                      NOMBRE
                    </p>
                    <p className="text-base font-medium">
                      {formData.nombre_proyecto || "Sin especificar"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-text-secondary uppercase mb-2">
                      AÑO
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {formData.anio_proyecto}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-text-secondary uppercase mb-2">
                      VALOR TOTAL
                    </p>
                    <p className="text-2xl font-bold text-warning">
                      {valorTotal > 0 ? formatCurrency(valorTotal) : "$0"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">Beneficio Inst.</span>
                        <span className="font-medium">
                          {beneficioInst > 0 ? formatCurrency(beneficioInst) : "$0"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#FF9800] h-2 rounded-full"
                          style={{ width: `${porcentajeBeneficio}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">Aporte Entidad</span>
                        <span className="font-medium">
                          {aporteEntidad > 0 ? formatCurrency(aporteEntidad) : "$0"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-success h-2 rounded-full"
                          style={{ width: `${porcentajeEntidad}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">Aporte Univ.</span>
                        <span className="font-medium">
                          {aporteUniv > 0 ? formatCurrency(aporteUniv) : "$0"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-info h-2 rounded-full"
                          style={{ width: `${porcentajeUniv}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {duration.years > 0 || duration.months > 0 || duration.days > 0 ? (
                    <div className="bg-primary/5 p-3 rounded-lg">
                      <p className="text-xs font-medium text-text-secondary uppercase mb-1">
                        DURACIÓN
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        {duration.years > 0 &&
                          `${duration.years} año${duration.years !== 1 ? "s" : ""} `}
                        {duration.months > 0 &&
                          `${duration.months} mes${duration.months !== 1 ? "es" : ""} `}
                        {duration.days > 0 &&
                          `${duration.days} día${duration.days !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center text-4xl">
              📋
            </div>
            <DialogTitle className="text-center text-2xl">
              ¿Confirmar actualización?
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-text-secondary">
            Está a punto de actualizar la información de este proyecto. Por favor
            verifique que los cambios sean correctos.
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
              {isUpdating ? "Actualizando..." : "Sí, Actualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}