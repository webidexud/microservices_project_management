import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
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
  contractingModalitiesApi,
  officialsApi,
  projectsApi
} from "@/lib/api"

export default function CreateProject() {
  const navigate = useNavigate()
  const currentYear = new Date().getFullYear()
  
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

  const { data: contractingModalities } = useQuery({
    queryKey: ["contracting-modalities-active"],
    queryFn: contractingModalitiesApi.getActive,
  })

  const { data: officials } = useQuery({
    queryKey: ["officials-active"],
    queryFn: officialsApi.getActive,
  })

  const { data: rupCodes } = useQuery({
    queryKey: ["rup-codes"],
    queryFn: () => rupCodesApi.getAll(),
  })
  
  const [formData, setFormData] = useState({
    anio_proyecto: currentYear,
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
  const [selectedRupCodes, setSelectedRupCodes] = useState([])
  const [showSecondaryEmails, setShowSecondaryEmails] = useState(false)
  const [duration, setDuration] = useState({ years: 0, months: 0, days: 0 })
  const [showConfirm, setShowConfirm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

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

const confirmarCreacion = async () => {
  setIsCreating(true)
  try {
    const datos = {
      ...formData,
      valor_proyecto: cleanNumber(formData.valor_proyecto),
      valor_beneficio: cleanNumber(formData.valor_beneficio),
      aporte_universidad: cleanNumber(formData.aporte_universidad),
      aporte_entidad: cleanNumber(formData.aporte_entidad),
      correos_secundarios: correosSecundarios.filter((e) => e.trim() !== ""),
    }

    // Crear el proyecto
    const nuevoProyecto = await projectsApi.create(datos)
    
    // ✅ AGREGAR: Asignar códigos RUP si hay seleccionados
    if (selectedRupCodes.length > 0 && nuevoProyecto) {
      await rupCodesApi.assignToProject(
        formData.anio_proyecto,
        nuevoProyecto.internal_project_number,
        selectedRupCodes
      )
    }

    // Invalidar caché
    queryClient.invalidateQueries({ queryKey: ["projects"] })
    queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })

    setShowConfirm(false)
    alert("¡Proyecto creado exitosamente!")
    navigate("/projects")
  } catch (error) {
    console.error("Error al crear proyecto:", error)
    alert("Error al crear el proyecto: " + error.message)
  } finally {
    setIsCreating(false)
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
                <h1 className="text-2xl font-bold">Crear Nuevo Proyecto</h1>
                <p className="text-sm text-text-secondary mt-0.5">
                  Complete la información del proyecto
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
              <Button onClick={handleSubmit} form="project-form">
                <Save className="h-4 w-4 mr-2" />
                Crear Proyecto
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
                      />
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
                        {dependencies?.map((dep) => (
                          <option key={dep.id} value={dep.id}>
                            {dep.name}
                          </option>
                        ))}
                      </Select>
                    </div>
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

                  <div className="grid grid-cols-3 gap-5">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Estado <span className="text-danger">*</span>
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
                        {executionModalities?.map((mod) => (
                          <option key={mod.id} value={mod.id}>
                            {mod.name}
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
                        {contractingModalities?.map((mod) => (
                          <option key={mod.id} value={mod.id}>
                            {mod.name}
                          </option>
                        ))}
                      </Select>
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
                        Aporte Universidad (COP)
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
                        Aporte Entidad (COP)
                      </label>
                      <Input
                        value={formData.aporte_entidad}
                        disabled
                        className="bg-gray-100 cursor-not-allowed"
                      />
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
                      placeholder="0"
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
                        min={formData.fecha_inicio}
                      />
                    </div>
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
                          {official.name} - {official.position}
                        </option>
                      ))}
                    </Select>
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

              {/* INFORMACIÓN ADICIONAL */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white text-xl">
                      📄
                    </div>
                    <h2 className="text-xl font-semibold">Información Adicional</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
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

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Acto Administrativo
                      </label>
                      <Input
                        name="acto_administrativo"
                        value={formData.acto_administrativo}
                        onChange={handleInputChange}
                        maxLength={50}
                        placeholder="Resolución o acto"
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
              ¿Confirmar creación del proyecto?
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-text-secondary">
            Está a punto de crear un nuevo proyecto en el sistema. Por favor verifique que toda la información ingresada sea correcta.
          </p>
          <DialogFooter className="flex justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button onClick={confirmarCreacion} disabled={isCreating}>
              <Save className="h-4 w-4 mr-2" />
              {isCreating ? "Creando..." : "Sí, Crear Proyecto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}