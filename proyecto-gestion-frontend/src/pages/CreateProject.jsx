import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function CreateProject({ open, onClose, onSuccess }) {
  const currentYear = new Date().getFullYear()
  
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
  const [showSecondaryEmails, setShowSecondaryEmails] = useState(false)
  const [duration, setDuration] = useState({ years: 0, months: 0, days: 0 })
  const [showConfirm, setShowConfirm] = useState(false)

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

  const confirmarCreacion = () => {
    // Preparar datos para enviar
    const datos = {
      ...formData,
      valor_proyecto: cleanNumber(formData.valor_proyecto),
      valor_beneficio: cleanNumber(formData.valor_beneficio),
      aporte_universidad: cleanNumber(formData.aporte_universidad),
      aporte_entidad: cleanNumber(formData.aporte_entidad),
      correos_secundarios: correosSecundarios.filter(e => e.trim() !== ""),
    }

    console.log("Proyecto a crear:", datos)
    setShowConfirm(false)
    onSuccess?.(datos)
    onClose()
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

  if (!open) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0" onClose={onClose}>
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="sticky top-0 bg-background-light dark:bg-gray-900 border-b p-6 z-10">
              <DialogTitle className="text-2xl font-bold">Nuevo Proyecto</DialogTitle>
              <p className="text-sm text-text-secondary mt-1">
                Complete la información del proyecto. Los campos con (*) son obligatorios.
              </p>
            </div>

            {/* Body */}
            <div className="p-8 space-y-8">
              
              {/* INFORMACIÓN GENERAL */}
              <section className="space-y-5 pb-8 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary">
                    📋
                  </div>
                  <h3 className="text-lg font-semibold">Información General</h3>
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
                    <p className="text-xs text-right mt-1 text-text-secondary">
                      {formData.numero_proyecto_externo.length}/20
                    </p>
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
                    className="w-full min-h-[100px] px-3 py-2 border rounded-lg resize-none"
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
                      <option value="1">Ministerio de Educación Nacional</option>
                      <option value="2">SENA</option>
                      <option value="3">Alcaldía Mayor de Bogotá</option>
                      <option value="4">Colciencias - Minciencias</option>
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
                      <option value="1">Facultad de Ingeniería</option>
                      <option value="2">Facultad de Ciencias y Educación</option>
                      <option value="3">Facultad de Artes - ASAB</option>
                      <option value="4">Facultad Tecnológica</option>
                    </Select>
                  </div>
                </div>
              </section>

              {/* CLASIFICACIÓN */}
              <section className="space-y-5 pb-8 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary">
                    📊
                  </div>
                  <h3 className="text-lg font-semibold">Clasificación del Proyecto</h3>
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
                      <option value="0">EN ESTUDIO</option>
                      <option value="2">FORMULADO</option>
                      <option value="4">PRE-APROBADO</option>
                      <option value="6">APROBADO</option>
                      <option value="8">SUSCRITO</option>
                      <option value="12">SIN INICIAR</option>
                      <option value="14">EN EJECUCIÓN</option>
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
                      <option value="1">Consultoría</option>
                      <option value="2">Investigación Aplicada</option>
                      <option value="3">Capacitación</option>
                      <option value="4">Desarrollo Tecnológico</option>
                      <option value="5">Extensión Social</option>
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
                      <option value="1">Recursos Propios</option>
                      <option value="2">Recursos Externos</option>
                      <option value="3">Cofinanciación</option>
                      <option value="4">Donación</option>
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
                      <option value="1">Directa</option>
                      <option value="2">Indirecta</option>
                      <option value="3">Mixta</option>
                      <option value="4">Cofinanciación</option>
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
                      <option value="1">Licitación Pública</option>
                      <option value="2">Selección Abreviada</option>
                      <option value="3">Contratación Directa</option>
                      <option value="4">Mínima Cuantía</option>
                    </Select>
                  </div>
                </div>
              </section>

              {/* INFORMACIÓN ECONÓMICA */}
              <section className="space-y-5 pb-8 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary">
                    💰
                  </div>
                  <h3 className="text-lg font-semibold">Información Económica</h3>
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
              </section>

              {/* CRONOGRAMA */}
              <section className="space-y-5 pb-8 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary">
                    📅
                  </div>
                  <h3 className="text-lg font-semibold">Cronograma</h3>
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
                    Duración del Proyecto (Calculada)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{duration.years}</div>
                      <div className="text-xs text-text-secondary mt-1">Años</div>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{duration.months}</div>
                      <div className="text-xs text-text-secondary mt-1">Meses</div>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{duration.days}</div>
                      <div className="text-xs text-text-secondary mt-1">Días</div>
                    </div>
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
                    <option value="1">Dr. Juan Carlos Pérez - Rector</option>
                    <option value="2">Dra. María Elena García - Vicerrectora Académica</option>
                    <option value="3">Dr. Carlos Andrés López - Vicerrector Administrativo</option>
                  </Select>
                </div>
              </section>

              {/* INFORMACIÓN ADICIONAL */}
              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary">
                    📄
                  </div>
                  <h3 className="text-lg font-semibold">Información Adicional</h3>
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

                {/* Correos Secundarios */}
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
                    className="w-full min-h-[80px] px-3 py-2 border rounded-lg resize-none"
                  />
                  <p className="text-xs text-right mt-1 text-text-secondary">
                    {formData.observaciones.length}/500
                  </p>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-background-light dark:bg-gray-900 border-t p-5 flex justify-between items-center">
              <p className="text-sm text-text-secondary">
                <span className="text-danger">*</span> Campos obligatorios
              </p>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  ✓ Crear Proyecto
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md" onClose={() => setShowConfirm(false)}>
          <DialogHeader>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-4xl">
              📋
            </div>
            <DialogTitle className="text-center text-2xl">
              ¿Confirmar creación del proyecto?
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-text-secondary">
            Está a punto de crear un nuevo proyecto en el sistema. Por favor verifique que toda la información ingresada sea correcta antes de continuar.
          </p>
          <DialogFooter className="flex justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirm(false)}
            >
              Cancelar
            </Button>
            <Button onClick={confirmarCreacion}>
              ✓ Sí, Crear Proyecto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}