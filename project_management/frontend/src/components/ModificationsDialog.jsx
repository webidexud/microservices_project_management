import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  X,
  Plus,
  DollarSign,
  Calendar,
  FileEdit,
  Trash2,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { modificationsApi } from "@/lib/api"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function ModificationsDialog({ project, open, onClose }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
  modification_type: "ADDITION",
  addition_value: "",
  extension_days: "",
  new_end_date: "",
  justification: "",
  administrative_act: "",
  approval_date: "",
  // Campos nuevos:
  extension_period_text: "",
  cdp: "",
  cdp_value: "",
  rp: "",
  rp_value: "",
  supervisor_name: "",
  supervisor_id: "",
  supervisor_entity_name: "",
  entity_legal_representative_name: "",
  entity_legal_representative_id: "",
  entity_legal_representative_id_type: "CC",
  ordering_official_id: "",
  requires_policy_update: false,
  policy_update_description: "",
  payment_method_modification: "",
  // Campos de suspensión:
  suspension_start_date: "",
  suspension_reason: "",
  suspension_days: "",
  expected_restart_date: "",
  suspension_observations: "",
  // Campos de reinicio:
  restart_date: "",
  actual_suspension_days: "",
  restart_observations: "",
  // Campos de liquidación:
  liquidation_date: "",
  liquidation_type: "BILATERAL",
  initial_contract_value: "",
  execution_percentage: "",
  executed_value: "",
  unilateral_cause: "",
  cause_analysis: "",
  pending_payment_value: "",
  value_to_release: "",
  liquidation_signature_date: "",
  final_value: "",
  liquidation_act_number: "",
  liquidation_act_date: "",
  penalties_amount: "",
  final_balance: "",
  has_pending_obligations: false,
  pending_obligations_description: "",
  liquidation_observations: "",
  // Campos de cambio de cláusulas:
  clause_number: "",
  clause_name: "",
  original_clause_text: "",
  new_clause_text: "",
  requires_resource_liberation: false,
  cdp_to_release: "",
  rp_to_release: "",
  liberation_amount: "",
  // Campos de cesión:
  assignment_type: "UNIVERSITY_AS_ASSIGNEE",
  assignor_name: "",
  assignor_id: "",
  assignor_id_type: "CC",
  assignee_name: "",
  assignee_id: "",
  assignee_id_type: "CC",
  assignment_date: "",
  assignment_signature_date: "",
  value_paid_to_assignor: "",
  value_pending_to_assignor: "",
  value_to_assign: "",
  handover_report_path: "",
  technical_report_path: "",
  account_statement_path: "",
  guarantee_modification_request: "",
  related_derived_project_id: "",
})

  const queryClient = useQueryClient()
  const projectId = project?.id || project?.project_id

  // Cargar modificaciones
  const { data: modifications, isLoading } = useQuery({
    queryKey: ["modifications", projectId],
    queryFn: () => modificationsApi.getByProject(projectId),
    enabled: !!projectId && open,
  })

  // Cargar resumen
  const { data: summary } = useQuery({
    queryKey: ["modifications-summary", projectId],
    queryFn: () => modificationsApi.getSummary(projectId),
    enabled: !!projectId && open,
  })

  // Mutación para crear modificación
  const createMutation = useMutation({
    mutationFn: (data) => modificationsApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modifications", projectId] })
      queryClient.invalidateQueries({ queryKey: ["modifications-summary", projectId] })
      setShowForm(false)
      resetForm()
      alert("Modificación creada exitosamente")
    },
    onError: (error) => {
      alert("Error al crear modificación: " + error.message)
    },
  })

  // Mutación para eliminar modificación
  const deleteMutation = useMutation({
    mutationFn: (id) => modificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modifications", projectId] })
      queryClient.invalidateQueries({ queryKey: ["modifications-summary", projectId] })
      alert("Modificación eliminada exitosamente")
    },
    onError: (error) => {
      alert("Error al eliminar modificación: " + error.message)
    },
  })

  const resetForm = () => {
    setFormData({
      modification_type: "ADDITION",
      addition_value: "",
      extension_days: "",
      new_end_date: "",
      justification: "",
      administrative_act: "",
      approval_date: "",
      // Campos nuevos:
      extension_period_text: "",
      cdp: "",
      cdp_value: "",
      rp: "",
      rp_value: "",
      supervisor_name: "",
      supervisor_id: "",
      supervisor_entity_name: "",
      entity_legal_representative_name: "",
      entity_legal_representative_id: "",
      entity_legal_representative_id_type: "CC",
      ordering_official_id: "",
      requires_policy_update: false,
      policy_update_description: "",
      payment_method_modification: "",
      // Campos de suspensión:
      suspension_start_date: "",
      suspension_reason: "",
      suspension_days: "",
      expected_restart_date: "",
      suspension_observations: "",
      // Campos de reinicio:
      restart_date: "",
      actual_suspension_days: "",
      restart_observations: "",
      // Campos de liquidación:
      liquidation_date: "",
      liquidation_type: "BILATERAL",
      initial_contract_value: "",
      execution_percentage: "",
      executed_value: "",
      unilateral_cause: "",
      cause_analysis: "",
      pending_payment_value: "",
      value_to_release: "",
      liquidation_signature_date: "",
      final_value: "",
      liquidation_act_number: "",
      liquidation_act_date: "",
      penalties_amount: "",
      final_balance: "",
      has_pending_obligations: false,
      pending_obligations_description: "",
      liquidation_observations: "",
      // Campos de cambio de cláusulas:
      clause_number: "",
      clause_name: "",
      original_clause_text: "",
      new_clause_text: "",
      requires_resource_liberation: false,
      cdp_to_release: "",
      rp_to_release: "",
      liberation_amount: "",
      // Campos de cesión:
      assignment_type: "UNIVERSITY_AS_ASSIGNEE",
      assignor_name: "",
      assignor_id: "",
      assignor_id_type: "CC",
      assignee_name: "",
      assignee_id: "",
      assignee_id_type: "CC",
      assignment_date: "",
      assignment_signature_date: "",
      value_paid_to_assignor: "",
      value_pending_to_assignor: "",
      value_to_assign: "",
      handover_report_path: "",
      technical_report_path: "",
      account_statement_path: "",
      guarantee_modification_request: "",
      related_derived_project_id: "",
    })
  }

  // Calcular nueva fecha al cambiar días de extensión
  useEffect(() => {
    if (formData.extension_days && project?.end_date) {
      const currentEndDate = new Date(project.end_date)
      const days = parseInt(formData.extension_days)
      if (!isNaN(days) && days > 0) {
        const newDate = new Date(currentEndDate)
        newDate.setDate(newDate.getDate() + days)
        const formattedDate = newDate.toISOString().split('T')[0]
        setFormData(prev => ({ ...prev, new_end_date: formattedDate }))
      }
    }
  }, [formData.extension_days, project?.end_date])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNumberInput = (e) => {
    const { name, value } = e.target
    const cleanValue = value.replace(/\D/g, "")
    setFormData(prev => ({ ...prev, [name]: cleanValue }))
  }

  const formatNumber = (value) => {
    if (!value) return ""
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const cleanNumber = (value) => {
    if (!value) return 0
    return parseFloat(value.toString().replace(/\./g, "")) || 0
  }

const handleSubmit = (e) => {
  e.preventDefault()
  
  // Validación básica
  if (!formData.justification.trim()) {
    alert("❌ ERROR: La justificación es obligatoria")
    return
  }
  
  // Validaciones para ADICIÓN
  if (formData.modification_type === "ADDITION") {
    // Verificar valor de adición
    if (!formData.addition_value || formData.addition_value === "0") {
      alert("❌ ERROR: El Valor de Adición es obligatorio.\n\n📍 Busca el campo 'Valor de Adición' en la sección 'Información de Adición'")
      return
    }
    
    // Verificar CDP
    if (!formData.cdp || !formData.cdp.trim()) {
      alert("❌ ERROR: El número de CDP es obligatorio.\n\n📍 Ejemplo: CDP-2024-001\n\n⚠️ Este campo es requerido para adiciones presupuestales")
      return
    }
    
    // Verificar Valor CDP
    if (!formData.cdp_value || formData.cdp_value === "0") {
      alert("❌ ERROR: El Valor del CDP es obligatorio.\n\n⚠️ El valor del CDP debe ser mayor o igual al valor de la adición")
      return
    }
    
    // Verificar RP
    if (!formData.rp || !formData.rp.trim()) {
      alert("❌ ERROR: El número de RP es obligatorio.\n\n📍 Ejemplo: RP-2024-001\n\n⚠️ Este campo es requerido para adiciones presupuestales")
      return
    }
    
    // Verificar Valor RP
    if (!formData.rp_value || formData.rp_value === "0") {
      alert("❌ ERROR: El Valor del RP es obligatorio.\n\n⚠️ El valor del RP debe ser mayor o igual al valor de la adición")
      return
    }
    
    // Validar que CDP value >= addition value
    const addValue = cleanNumber(formData.addition_value)
    const cdpVal = cleanNumber(formData.cdp_value)
    const rpVal = cleanNumber(formData.rp_value)
    
    if (cdpVal < addValue) {
      alert(`❌ ERROR: El Valor del CDP debe ser mayor o igual al Valor de Adición\n\nValor de Adición: $${formatNumber(formData.addition_value)}\nValor CDP: $${formatNumber(formData.cdp_value)}\n\n⚠️ Corrige el Valor del CDP`)
      return
    }
    
    if (rpVal < addValue) {
      alert(`❌ ERROR: El Valor del RP debe ser mayor o igual al Valor de Adición\n\nValor de Adición: $${formatNumber(formData.addition_value)}\nValor RP: $${formatNumber(formData.rp_value)}\n\n⚠️ Corrige el Valor del RP`)
      return
    }
  }
  
  // Validaciones para PRÓRROGA
  if (formData.modification_type === "EXTENSION") {
    if (!formData.extension_days || !formData.new_end_date) {
      alert("❌ ERROR: Para una prórroga son obligatorios:\n\n- Días de extensión\n- Nueva fecha de finalización")
      return
    }
  }
  
  // Validaciones para AMBAS (Adición Y Prórroga)
  if (formData.modification_type === "BOTH") {
    if (!formData.addition_value) {
      alert("❌ ERROR: El Valor de Adición es obligatorio")
      return
    }
    if (!formData.cdp || !formData.rp) {
      alert("❌ ERROR: CDP y RP son obligatorios para adiciones presupuestales")
      return
    }
    if (!formData.cdp_value || !formData.rp_value) {
      alert("❌ ERROR: Los Valores de CDP y RP son obligatorios")
      return
    }
    if (!formData.extension_days || !formData.new_end_date) {
      alert("❌ ERROR: Los Días de extensión y Nueva fecha son obligatorios")
      return
    }
  }
  
  // Validaciones para SUSPENSIÓN
  if (formData.modification_type === "SUSPENSION") {
    if (!formData.suspension_start_date || !formData.suspension_reason) {
      alert("❌ ERROR: Para una suspensión son obligatorios:\n\n- Fecha de inicio\n- Motivo de suspensión")
      return
    }
  }

  // Validaciones para REINICIO
  if (formData.modification_type === "RESTART") {
    if (!formData.restart_date) {
      alert("❌ ERROR: La fecha de reinicio es obligatoria")
      return
    }
  }
  
  // Validaciones para LIQUIDACIÓN
  if (formData.modification_type === "LIQUIDATION") {
    const requiredFields = []
    
    if (!formData.liquidation_date) requiredFields.push("Fecha de liquidación")
    if (!formData.final_value) requiredFields.push("Valor final")
    if (!formData.liquidation_type) requiredFields.push("Tipo de liquidación")
    if (!formData.initial_contract_value) requiredFields.push("Valor inicial del contrato")
    if (!formData.execution_percentage) requiredFields.push("Porcentaje de ejecución")
    if (!formData.executed_value) requiredFields.push("Valor ejecutado")
    if (!formData.liquidation_observations) requiredFields.push("Observaciones del supervisor")
    
    if (requiredFields.length > 0) {
      alert(`❌ ERROR: Faltan los siguientes campos obligatorios:\n\n${requiredFields.map(f => `- ${f}`).join('\n')}`)
      return
    }
    
    if (formData.liquidation_type === 'UNILATERAL') {
      if (!formData.liquidation_act_number) {
        alert("❌ ERROR: El número de resolución es obligatorio para liquidación unilateral")
        return
      }
      if (!formData.unilateral_cause) {
        alert("❌ ERROR: La causa es obligatoria para liquidación unilateral")
        return
      }
    }
  }
  
  // Validaciones para MODIFICACIÓN DE CLÁUSULAS
  if (formData.modification_type === "MODIFICATION") {
    if (!formData.clause_number || !formData.clause_name || !formData.new_clause_text) {
      alert("❌ ERROR: Para modificación de cláusulas son obligatorios:\n\n- Número de cláusula\n- Nombre de cláusula\n- Nuevo texto")
      return
    }
  }
  
  // Validaciones para CESIÓN
  if (formData.modification_type === "ASSIGNMENT") {
    const requiredFields = []
    
    if (!formData.assignment_type) requiredFields.push("Tipo de cesión")
    if (!formData.assignor_name) requiredFields.push("Nombre del cedente")
    if (!formData.assignor_id) requiredFields.push("Identificación del cedente")
    if (!formData.assignee_name) requiredFields.push("Nombre del cesionario")
    if (!formData.assignee_id) requiredFields.push("Identificación del cesionario")
    if (!formData.assignment_date) requiredFields.push("Fecha de cesión")
    if (!formData.value_to_assign) requiredFields.push("Valor a ceder")
    
    if (requiredFields.length > 0) {
      alert(`❌ ERROR: Faltan los siguientes campos obligatorios:\n\n${requiredFields.map(f => `- ${f}`).join('\n')}`)
      return
    }
  }
  
  // Si llegamos aquí, todas las validaciones pasaron
  console.log("✅ Todas las validaciones pasaron. Enviando datos...")
  
  const datos = {
    modification_type: formData.modification_type,
    addition_value: formData.addition_value ? cleanNumber(formData.addition_value) : null,
    extension_days: formData.extension_days ? parseInt(formData.extension_days) : null,
    new_end_date: formData.new_end_date || null,
    justification: formData.justification,
    administrative_act: formData.administrative_act || null,
    approval_date: formData.approval_date || null,
    // Campos de adición:
    extension_period_text: formData.extension_period_text || null,
    cdp: formData.cdp || null,
    cdp_value: formData.cdp_value ? cleanNumber(formData.cdp_value) : null,
    rp: formData.rp || null,
    rp_value: formData.rp_value ? cleanNumber(formData.rp_value) : null,
    supervisor_name: formData.supervisor_name || null,
    supervisor_id: formData.supervisor_id || null,
    supervisor_entity_name: formData.supervisor_entity_name || null,
    entity_legal_representative_name: formData.entity_legal_representative_name || null,
    entity_legal_representative_id: formData.entity_legal_representative_id || null,
    entity_legal_representative_id_type: formData.entity_legal_representative_id_type || null,
    ordering_official_id: formData.ordering_official_id ? parseInt(formData.ordering_official_id) : null,
    requires_policy_update: formData.requires_policy_update || false,
    policy_update_description: formData.policy_update_description || null,
    payment_method_modification: formData.payment_method_modification || null,
    // Campos de suspensión:
    suspension_start_date: formData.suspension_start_date || null,
    suspension_reason: formData.suspension_reason || null,
    suspension_days: formData.suspension_days ? parseInt(formData.suspension_days) : null,
    expected_restart_date: formData.expected_restart_date || null,
    suspension_observations: formData.suspension_observations || null,
    // Campos de reinicio:
    restart_date: formData.restart_date || null,
    actual_suspension_days: formData.actual_suspension_days ? parseInt(formData.actual_suspension_days) : null,
    restart_observations: formData.restart_observations || null,
// Campos de liquidación (mapeo correcto para el backend):
liquidation_date: formData.liquidation_date || null,
liquidation_type: formData.liquidation_type || null,
resolution_number: formData.liquidation_act_number || null,
resolution_date: formData.liquidation_act_date || null,
unilateral_cause: formData.unilateral_cause || null,
cause_analysis: formData.cause_analysis || null,
initial_contract_value: formData.initial_contract_value ? cleanNumber(formData.initial_contract_value) : null,
final_value_with_additions: formData.final_value ? cleanNumber(formData.final_value) : null,
execution_percentage: formData.execution_percentage ? parseFloat(formData.execution_percentage) : null,
executed_value: formData.executed_value ? cleanNumber(formData.executed_value) : null,
pending_payment_value: formData.pending_payment_value ? cleanNumber(formData.pending_payment_value) : null,
value_to_release: formData.value_to_release ? cleanNumber(formData.value_to_release) : null,
liquidation_signature_date: formData.liquidation_signature_date || null,
supervisor_liquidation_request: formData.liquidation_observations || null,
// Campos adicionales (no van a la BD pero se usan para display):
penalties_amount: formData.penalties_amount ? cleanNumber(formData.penalties_amount) : null,
final_balance: formData.final_balance ? cleanNumber(formData.final_balance) : null,
has_pending_obligations: formData.has_pending_obligations || false,
pending_obligations_description: formData.pending_obligations_description || null,
    // Campos de cambio de cláusulas:
    clause_number: formData.clause_number || null,
    clause_name: formData.clause_name || null,
    original_clause_text: formData.original_clause_text || null,
    new_clause_text: formData.new_clause_text || null,
    requires_resource_liberation: formData.requires_resource_liberation || false,
    cdp_to_release: formData.cdp_to_release || null,
    rp_to_release: formData.rp_to_release || null,
    liberation_amount: formData.liberation_amount ? cleanNumber(formData.liberation_amount) : null,
    // Campos de cesión (mapeo correcto para el backend):
    assignment_type: formData.assignment_type || null,
    assignor_name: formData.assignor_name || null,
    assignor_id: formData.assignor_id || null,
    assignor_id_type: formData.assignor_id_type || null,
    assignee_name: formData.assignee_name || null,
    assignee_id: formData.assignee_id || null,
    assignee_id_type: formData.assignee_id_type || null,
    supervisor_name: formData.supervisor_name || null,
    supervisor_id: formData.supervisor_id || null,
    assignment_date: formData.assignment_date || null,
    assignment_signature_date: formData.assignment_signature_date || null,
    value_paid_to_assignor: formData.value_paid_to_assignor ? cleanNumber(formData.value_paid_to_assignor) : null,
    value_pending_to_assignor: formData.value_pending_to_assignor ? cleanNumber(formData.value_pending_to_assignor) : null,
    value_to_assign: formData.value_to_assign ? cleanNumber(formData.value_to_assign) : null,  // ✅ CORREGIDO
    handover_report_path: formData.handover_report_path || null,
    technical_report_path: formData.technical_report_path || null,
    account_statement_path: formData.account_statement_path || null,
    guarantee_modification_request: formData.guarantee_modification_request || null,
    related_derived_project_id: formData.related_derived_project_id ? parseInt(formData.related_derived_project_id) : null,
  }
  console.log("📤 Datos a enviar:", datos)
  createMutation.mutate(datos)
}

  const getTypeIcon = (type) => {
    switch (type) {
      case "ADDITION":
        return <DollarSign className="h-4 w-4" />
      case "EXTENSION":
        return <Calendar className="h-4 w-4" />
      case "BOTH":
        return <TrendingUp className="h-4 w-4" />
      default:
        return null
    }
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case "ADDITION":
        return <Badge variant="success">Adición</Badge>
      case "EXTENSION":
        return <Badge variant="info">Prórroga</Badge>
      case "BOTH":
        return <Badge variant="warning">Adición y Prórroga</Badge>
      case "SUSPENSION":
        return <Badge className="bg-orange-500 text-white">Suspensión</Badge>
      case "RESTART":
        return <Badge className="bg-green-500 text-white">Reinicio</Badge>
      case "LIQUIDATION":
        return <Badge className="bg-red-500 text-white">Liquidación</Badge>
      case "MODIFICATION":
        return <Badge className="bg-purple-500 text-white">Modificación de Cláusulas</Badge>
      case "ASSIGNMENT":
        return <Badge className="bg-indigo-500 text-white">Cesión</Badge>
      default:
        return null
    }
  }

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
     <DialogContent className="max-w-[1400px] !fixed !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 max-h-[90vh] overflow-y-auto"onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Modificaciones - {project.code}
          </DialogTitle>
        </DialogHeader>

        {/* Resumen */}
        {summary && modifications && modifications.length > 0 && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Modificaciones</p>
              <p className="text-2xl font-bold">{summary.total_modifications}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Adiciones Acumuladas</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.total_additions)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Extensión Total</p>
              <p className="text-2xl font-bold text-blue-600">
                {summary.total_extension_days} días
              </p>
            </div>
          </div>
        )}

        {/* Botón Agregar */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Modificación
          </Button>
        )}

        {/* Formulario */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fila 1: Tipo y Acto Administrativo */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tipo de Modificación <span className="text-red-500">*</span>
                </label>
                <select
                  name="modification_type"
                  value={formData.modification_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="ADDITION">Adición</option>
                  <option value="EXTENSION">Prórroga</option>
                  <option value="BOTH">Adición y Prórroga</option>
                  <option value="SUSPENSION">Suspensión</option>
                  <option value="RESTART">Reinicio</option>
                  <option value="LIQUIDATION">Liquidación</option>
                  <option value="MODIFICATION">Modificación de Cláusulas</option>
                  <option value="ASSIGNMENT">Cesión</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Acto Administrativo
                </label>
                <input
                  type="text"
                  name="administrative_act"
                  value={formData.administrative_act}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Ej: Resolución 123"
                />
              </div>
            </div>

            {/* CAMPOS PARA ADICIÓN */}
            {(formData.modification_type === "ADDITION" || formData.modification_type === "BOTH") && (
              <>
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-700">
                    <DollarSign className="h-5 w-5" />
                    Información de Adición
                  </h4>
                  
                  {/* Valores: Adición, CDP y RP */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Valor de Adición <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="addition_value"
                        value={formData.addition_value}
                        onChange={handleNumberInput}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="0"
                        required
                      />
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        {formData.addition_value && `$ ${formatNumber(formData.addition_value)}`}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Valor CDP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="cdp_value"
                        value={formData.cdp_value}
                        onChange={handleNumberInput}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="0"
                        required
                      />
                      <p className="text-xs text-gray-600 mt-1 font-medium">
                        {formData.cdp_value && `$ ${formatNumber(formData.cdp_value)}`}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Valor RP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="rp_value"
                        value={formData.rp_value}
                        onChange={handleNumberInput}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="0"
                        required
                      />
                      <p className="text-xs text-gray-600 mt-1 font-medium">
                        {formData.rp_value && `$ ${formatNumber(formData.rp_value)}`}
                      </p>
                    </div>
                  </div>

                  {/* Números de CDP y RP */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Número de CDP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="cdp"
                        value={formData.cdp}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="Número de CDP"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Número de RP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="rp"
                        value={formData.rp}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="Número de RP"
                        required
                      />
                    </div>
                  </div>

                  {/* Supervisor */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                    <h5 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Información del Supervisor</h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nombre Completo
                        </label>
                        <input
                          type="text"
                          name="supervisor_name"
                          value={formData.supervisor_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="Nombre del supervisor"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Identificación
                        </label>
                        <input
                          type="text"
                          name="supervisor_id"
                          value={formData.supervisor_id}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="Número de cédula"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Entidad
                        </label>
                        <input
                          type="text"
                          name="supervisor_entity_name"
                          value={formData.supervisor_entity_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="Entidad del supervisor"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Representante Legal */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                    <h5 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Representante Legal de la Entidad</h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nombre Completo
                        </label>
                        <input
                          type="text"
                          name="entity_legal_representative_name"
                          value={formData.entity_legal_representative_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="Nombre completo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Tipo de ID
                        </label>
                        <select
                          name="entity_legal_representative_id_type"
                          value={formData.entity_legal_representative_id_type}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        >
                          <option value="CC">Cédula de Ciudadanía</option>
                          <option value="CE">Cédula de Extranjería</option>
                          <option value="PA">Pasaporte</option>
                          <option value="NIT">NIT</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Número de Identificación
                        </label>
                        <input
                          type="text"
                          name="entity_legal_representative_id"
                          value={formData.entity_legal_representative_id}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="Número"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Póliza y Forma de Pago */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="checkbox"
                          name="requires_policy_update"
                          checked={formData.requires_policy_update}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            requires_policy_update: e.target.checked 
                          }))}
                          className="w-4 h-4"
                        />
                        <label className="text-sm font-medium">
                          ¿Requiere actualización de póliza?
                        </label>
                      </div>
                      
                      {formData.requires_policy_update && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Descripción
                          </label>
                          <textarea
                            name="policy_update_description"
                            value={formData.policy_update_description}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                            rows="2"
                            placeholder="Describa los cambios en la póliza"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Modificación de Forma de Pago
                      </label>
                      <textarea
                        name="payment_method_modification"
                        value={formData.payment_method_modification}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        rows="3"
                        placeholder="Describa cambios en la forma de pago (opcional)"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* CAMPOS PARA PRÓRROGA */}
            {(formData.modification_type === "EXTENSION" || formData.modification_type === "BOTH") && (
              <div className="border-t pt-6">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-blue-700">
                  <Calendar className="h-5 w-5" />
                  Información de Prórroga
                </h4>
                
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Días de Extensión <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="extension_days"
                      value={formData.extension_days}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nueva Fecha de Finalización <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="new_end_date"
                      value={formData.new_end_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Descripción del Período
                    </label>
                    <input
                      type="text"
                      name="extension_period_text"
                      value={formData.extension_period_text}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Ej: CINCO (5) MESES"
                    />
                  </div>
                </div>
              </div>
            )}
            {/* CAMPOS PARA SUSPENSIÓN */}
            {formData.modification_type === "SUSPENSION" && (
              <div className="border-t pt-6">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-orange-700">
                  <AlertCircle className="h-5 w-5" />
                  Información de Suspensión
                </h4>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Fecha de Inicio de Suspensión <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="suspension_start_date"
                      value={formData.suspension_start_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Días de Suspensión Estimados
                    </label>
                    <input
                      type="number"
                      name="suspension_days"
                      value={formData.suspension_days}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Motivo de la Suspensión <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="suspension_reason"
                      value={formData.suspension_reason}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Seleccione un motivo</option>
                      <option value="FUERZA_MAYOR">Fuerza Mayor</option>
                      <option value="CASO_FORTUITO">Caso Fortuito</option>
                      <option value="ORDEN_ENTIDAD">Orden de la Entidad</option>
                      <option value="INCUMPLIMIENTO_ENTIDAD">Incumplimiento de la Entidad</option>
                      <option value="PROBLEMA_TECNICO">Problema Técnico</option>
                      <option value="PROBLEMA_PRESUPUESTAL">Problema Presupuestal</option>
                      <option value="MUTUO_ACUERDO">Mutuo Acuerdo</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Fecha Estimada de Reinicio
                    </label>
                    <input
                      type="date"
                      name="expected_restart_date"
                      value={formData.expected_restart_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Observaciones de la Suspensión
                  </label>
                  <textarea
                    name="suspension_observations"
                    value={formData.suspension_observations}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    rows="3"
                    placeholder="Describa detalles adicionales sobre la suspensión"
                  />
                </div>
              </div>
            )}

            {/* CAMPOS PARA REINICIO */}
            {formData.modification_type === "RESTART" && (
              <div className="border-t pt-6">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-700">
                  <Calendar className="h-5 w-5" />
                  Información de Reinicio
                </h4>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    ℹ️ El reinicio se registrará en la suspensión activa más reciente de este proyecto.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Fecha de Reinicio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="restart_date"
                      value={formData.restart_date || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Días Reales de Suspensión
                    </label>
                    <input
                      type="number"
                      name="actual_suspension_days"
                      value={formData.actual_suspension_days || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Observaciones del Reinicio
                  </label>
                  <textarea
                    name="restart_observations"
                    value={formData.restart_observations || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    rows="3"
                    placeholder="Describa las condiciones del reinicio"
                  />
                </div>
              </div>
            )}
            {/* CAMPOS PARA LIQUIDACIÓN */}
              {formData.modification_type === "LIQUIDATION" && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-red-700">
                    <FileEdit className="h-5 w-5" />
                    Información de Liquidación
                  </h4>
                  
                  {/* PRIMERA FILA - Campos obligatorios principales */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Fecha de Liquidación <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="liquidation_date"
                        value={formData.liquidation_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Tipo de Liquidación <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="liquidation_type"
                        value={formData.liquidation_type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="BILATERAL">Bilateral (Mutuo Acuerdo)</option>
                        <option value="UNILATERAL">Unilateral (Por Incumplimiento)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Fecha de Firma de Liquidación
                      </label>
                      <input
                        type="date"
                        name="liquidation_signature_date"
                        value={formData.liquidation_signature_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* SEGUNDA FILA - Valores del contrato */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Valor Inicial del Contrato <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="initial_contract_value"
                        value={formData.initial_contract_value}
                        onChange={handleNumberInput}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="0"
                        required
                      />
                      <p className="text-xs text-gray-600 mt-1 font-medium">
                        {formData.initial_contract_value && `$ ${formatNumber(formData.initial_contract_value)}`}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Valor Final del Contrato <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="final_value"
                        value={formData.final_value}
                        onChange={handleNumberInput}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="0"
                        required
                      />
                      <p className="text-xs text-gray-600 mt-1 font-medium">
                        {formData.final_value && `$ ${formatNumber(formData.final_value)}`}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Valor Ejecutado <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="executed_value"
                        value={formData.executed_value}
                        onChange={handleNumberInput}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="0"
                        required
                      />
                      <p className="text-xs text-gray-600 mt-1 font-medium">
                        {formData.executed_value && `$ ${formatNumber(formData.executed_value)}`}
                      </p>
                    </div>
                  </div>

                  {/* TERCERA FILA - Porcentajes y valores pendientes */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Porcentaje de Ejecución (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="execution_percentage"
                        value={formData.execution_percentage}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Valor Pendiente de Pago
                      </label>
                      <input
                        type="text"
                        name="pending_payment_value"
                        value={formData.pending_payment_value}
                        onChange={handleNumberInput}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-600 mt-1 font-medium">
                        {formData.pending_payment_value && `$ ${formatNumber(formData.pending_payment_value)}`}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Valor a Liberar
                      </label>
                      <input
                        type="text"
                        name="value_to_release"
                        value={formData.value_to_release}
                        onChange={handleNumberInput}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-600 mt-1 font-medium">
                        {formData.value_to_release && `$ ${formatNumber(formData.value_to_release)}`}
                      </p>
                    </div>
                  </div>

                  {/* CUARTA FILA - Acta de liquidación */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Número del Acta de Liquidación {formData.liquidation_type === 'UNILATERAL' && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        name="liquidation_act_number"
                        value={formData.liquidation_act_number}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="Ej: ACTA-001-2025"
                        required={formData.liquidation_type === 'UNILATERAL'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Fecha del Acta
                      </label>
                      <input
                        type="date"
                        name="liquidation_act_date"
                        value={formData.liquidation_act_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Penalidades
                      </label>
                      <input
                        type="text"
                        name="penalties_amount"
                        value={formData.penalties_amount}
                        onChange={handleNumberInput}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="0"
                      />
                      <p className="text-xs text-red-600 mt-1 font-medium">
                        {formData.penalties_amount && `$ ${formatNumber(formData.penalties_amount)}`}
                      </p>
                    </div>
                  </div>

                  {/* SECCIÓN ESPECIAL PARA LIQUIDACIÓN UNILATERAL */}
                  {formData.liquidation_type === 'UNILATERAL' && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6 border border-red-200">
                      <h5 className="font-semibold mb-3 text-red-700">Información de Liquidación Unilateral</h5>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          Causa de Liquidación Unilateral <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="unilateral_cause"
                          value={formData.unilateral_cause}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          rows="3"
                          placeholder="Describa la causa que justifica la liquidación unilateral (incumplimiento, irregularidades, etc.)"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Análisis de la Causa
                        </label>
                        <textarea
                          name="cause_analysis"
                          value={formData.cause_analysis}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          rows="3"
                          placeholder="Análisis detallado de la situación que lleva a la liquidación unilateral"
                        />
                      </div>
                    </div>
                  )}

                  {/* OBLIGACIONES PENDIENTES */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        name="has_pending_obligations"
                        checked={formData.has_pending_obligations}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          has_pending_obligations: e.target.checked 
                        }))}
                        className="w-4 h-4"
                      />
                      <label className="text-sm font-medium">
                        ¿Existen obligaciones pendientes?
                      </label>
                    </div>
                    
                    {formData.has_pending_obligations && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Descripción de Obligaciones Pendientes
                        </label>
                        <textarea
                          name="pending_obligations_description"
                          value={formData.pending_obligations_description}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          rows="2"
                          placeholder="Describa las obligaciones que quedan pendientes"
                        />
                      </div>
                    )}
                  </div>

                  {/* OBSERVACIONES DEL SUPERVISOR */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Observaciones del Supervisor <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="liquidation_observations"
                      value={formData.liquidation_observations}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      rows="4"
                      placeholder="Observaciones generales del supervisor sobre la liquidación del contrato"
                      required
                    />
                  </div>
                </div>
              )}

            {/* CAMPOS PARA MODIFICACIÓN DE CLÁUSULAS */}
                {formData.modification_type === "MODIFICATION" && (
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-purple-700">
                      <FileEdit className="h-5 w-5" />
                      Modificación de Cláusulas Contractuales
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Número de Cláusula <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="clause_number"
                          value={formData.clause_number}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="Ej: 3.2"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nombre de la Cláusula <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="clause_name"
                          value={formData.clause_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="Ej: Forma de Pago"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Texto Original de la Cláusula
                        </label>
                        <textarea
                          name="original_clause_text"
                          value={formData.original_clause_text}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          rows="4"
                          placeholder="Texto actual de la cláusula (opcional)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nuevo Texto de la Cláusula <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="new_clause_text"
                          value={formData.new_clause_text}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          rows="4"
                          placeholder="Nuevo texto que reemplazará la cláusula"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="checkbox"
                          name="requires_resource_liberation"
                          checked={formData.requires_resource_liberation}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            requires_resource_liberation: e.target.checked 
                          }))}
                          className="w-4 h-4"
                        />
                        <label className="text-sm font-medium">
                          ¿Requiere liberación de recursos presupuestales?
                        </label>
                      </div>
                      
                      {formData.requires_resource_liberation && (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              CDP a Liberar
                            </label>
                            <input
                              type="text"
                              name="cdp_to_release"
                              value={formData.cdp_to_release}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                              placeholder="Número de CDP"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              RP a Liberar
                            </label>
                            <input
                              type="text"
                              name="rp_to_release"
                              value={formData.rp_to_release}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                              placeholder="Número de RP"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Monto a Liberar
                            </label>
                            <input
                              type="text"
                              name="liberation_amount"
                              value={formData.liberation_amount}
                              onChange={handleNumberInput}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                              placeholder="0"
                            />
                            <p className="text-xs text-gray-600 mt-1 font-medium">
                              {formData.liberation_amount && `$ ${formatNumber(formData.liberation_amount)}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            {/* CAMPOS PARA CESIÓN */}
              {formData.modification_type === "ASSIGNMENT" && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-indigo-700">
                    <TrendingUp className="h-5 w-5" />
                    Cesión Contractual
                  </h4>
                  
                  {/* PRIMERA FILA - Tipo y fechas */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Tipo de Cesión <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="assignment_type"
                        value={formData.assignment_type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="UNIVERSITY_AS_ASSIGNEE">Universidad como Cesionaria (Recibe el contrato)</option>
                        <option value="UNIVERSITY_AS_ASSIGNOR">Universidad como Cedente (Cede el contrato)</option>
                      </select>
                      <p className="text-xs text-gray-600 mt-1">
                        {formData.assignment_type === 'UNIVERSITY_AS_ASSIGNEE' 
                          ? 'La universidad recibe las obligaciones del contrato' 
                          : 'La universidad transfiere las obligaciones del contrato'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Fecha de Cesión <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="assignment_date"
                        value={formData.assignment_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Fecha de Firma del Acta
                      </label>
                      <input
                        type="date"
                        name="assignment_signature_date"
                        value={formData.assignment_signature_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* SEGUNDA FILA - Datos del CEDENTE (quien cede) */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                    <h5 className="font-semibold mb-3 text-blue-700">Datos del Cedente (Quien Cede)</h5>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nombre del Cedente <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="assignor_name"
                          value={formData.assignor_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="Nombre completo o razón social"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Tipo de Identificación
                        </label>
                        <select
                          name="assignor_id_type"
                          value={formData.assignor_id_type}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        >
                          <option value="CC">Cédula de Ciudadanía</option>
                          <option value="CE">Cédula de Extranjería</option>
                          <option value="NIT">NIT</option>
                          <option value="PP">Pasaporte</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Número de Identificación <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="assignor_id"
                          value={formData.assignor_id}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="Número de documento"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* TERCERA FILA - Datos del CESIONARIO (quien recibe) */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6">
                    <h5 className="font-semibold mb-3 text-green-700">Datos del Cesionario (Quien Recibe)</h5>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nombre del Cesionario <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="assignee_name"
                          value={formData.assignee_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="Nombre completo o razón social"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Tipo de Identificación
                        </label>
                        <select
                          name="assignee_id_type"
                          value={formData.assignee_id_type}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        >
                          <option value="CC">Cédula de Ciudadanía</option>
                          <option value="CE">Cédula de Extranjería</option>
                          <option value="NIT">NIT</option>
                          <option value="PP">Pasaporte</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Número de Identificación <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="assignee_id"
                          value={formData.assignee_id}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="Número de documento"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* CUARTA FILA - Valores */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Valor a Ceder <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="value_to_assign"
                        value={formData.value_to_assign}
                        onChange={handleNumberInput}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="0"
                        required
                      />
                      <p className="text-xs text-gray-600 mt-1 font-medium">
                        {formData.value_to_assign && `$ ${formatNumber(formData.value_to_assign)}`}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Valor Pagado al Cedente
                      </label>
                      <input
                        type="text"
                        name="value_paid_to_assignor"
                        value={formData.value_paid_to_assignor}
                        onChange={handleNumberInput}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-600 mt-1 font-medium">
                        {formData.value_paid_to_assignor && `$ ${formatNumber(formData.value_paid_to_assignor)}`}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Valor Pendiente al Cedente
                      </label>
                      <input
                        type="text"
                        name="value_pending_to_assignor"
                        value={formData.value_pending_to_assignor}
                        onChange={handleNumberInput}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-600 mt-1 font-medium">
                        {formData.value_pending_to_assignor && `$ ${formatNumber(formData.value_pending_to_assignor)}`}
                      </p>
                    </div>
                  </div>

                  {/* QUINTA FILA - Supervisor */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nombre del Supervisor
                      </label>
                      <input
                        type="text"
                        name="supervisor_name"
                        value={formData.supervisor_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="Nombre del supervisor del contrato"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Identificación del Supervisor
                      </label>
                      <input
                        type="text"
                        name="supervisor_id"
                        value={formData.supervisor_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="CC, CE, etc."
                      />
                    </div>
                  </div>

                  {/* SEXTA FILA - Documentos (rutas) */}
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg mb-6">
                    <h5 className="font-semibold mb-3">Rutas de Documentos</h5>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Informe de Entrega
                        </label>
                        <input
                          type="text"
                          name="handover_report_path"
                          value={formData.handover_report_path}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="/documentos/entrega.pdf"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Informe Técnico
                        </label>
                        <input
                          type="text"
                          name="technical_report_path"
                          value={formData.technical_report_path}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="/documentos/tecnico.pdf"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Estado de Cuenta
                        </label>
                        <input
                          type="text"
                          name="account_statement_path"
                          value={formData.account_statement_path}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="/documentos/cuenta.pdf"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SÉPTIMA FILA - Proyecto derivado y solicitud de póliza */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        ID del Proyecto Derivado Relacionado
                      </label>
                      <input
                        type="number"
                        name="related_derived_project_id"
                        value={formData.related_derived_project_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="Dejar vacío si no aplica"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        ⚠️ Solo completar si existe un proyecto derivado. Dejar vacío si no aplica.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Solicitud de Modificación de Póliza
                      </label>
                      <textarea
                        name="guarantee_modification_request"
                        value={formData.guarantee_modification_request}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        rows="2"
                        placeholder="Descripción de cambios requeridos en la póliza"
                      />
                    </div>
                  </div>
                </div>
              )}
            {/* Justificación y Fecha de Aprobación */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Justificación <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="justification"
                    value={formData.justification}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    rows="4"
                    placeholder="Describa la justificación de esta modificación"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fecha de Aprobación
                  </label>
                  <input
                    type="date"
                    name="approval_date"
                    value={formData.approval_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Guardando..." : "Guardar Modificación"}
              </Button>
            </div>
          </form>
        )}

        {/* Lista de Modificaciones */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Historial de Modificaciones</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : modifications && modifications.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Detalles</TableHead>
                    <TableHead>Justificación</TableHead>
                    <TableHead>Fecha Aprobación</TableHead>
                    <TableHead className="w-20">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modifications.map((mod) => (
                    <TableRow key={mod.id}>
                      <TableCell className="font-medium">#{mod.number}</TableCell>
                      <TableCell>{getTypeBadge(mod.type)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {(mod.type === "ADDITION" || mod.type === "BOTH") && (
                            <>
                              <div className="flex items-center gap-1 text-green-600">
                                <DollarSign className="h-3 w-3" />
                                <span className="text-sm font-semibold">+{formatCurrency(mod.addition_value)}</span>
                              </div>
                              {mod.cdp && (
                                <div className="text-xs text-gray-600">
                                  CDP: {mod.cdp} {mod.cdp_value && `(${formatCurrency(mod.cdp_value)})`}
                                </div>
                              )}
                              {mod.rp && (
                                <div className="text-xs text-gray-600">
                                  RP: {mod.rp} {mod.rp_value && `(${formatCurrency(mod.rp_value)})`}
                                </div>
                              )}
                              {mod.supervisor_name && (
                                <div className="text-xs text-gray-600">
                                  Supervisor: {mod.supervisor_name}
                                </div>
                              )}
                            </>
                          )}
                          {(mod.type === "EXTENSION" || mod.type === "BOTH") && (
                            <>
                              <div className="flex items-center gap-1 text-blue-600">
                                <Calendar className="h-3 w-3" />
                                <span className="text-sm">+{mod.extension_days} días → {formatDate(mod.new_end_date)}</span>
                              </div>
                              {mod.extension_period_text && (
                                <div className="text-xs text-gray-600">
                                  {mod.extension_period_text}
                                </div>
                              )}
                            </>
                          )}
                          {mod.administrative_act && (
                            <div className="text-xs text-gray-500 mt-1">{mod.administrative_act}</div>
                          )}
                          {mod.requires_policy_update && (
                            <div className="text-xs text-orange-600 mt-1">
                              ⚠️ Requiere actualización de póliza
                            </div>
                          )}
                          {mod.type === "SUSPENSION" && (
                            <>
                              <div className="flex items-center gap-1 text-orange-600">
                                <AlertCircle className="h-3 w-3" />
                                <span className="text-sm font-semibold">Suspendido desde {formatDate(mod.suspension_start_date)}</span>
                              </div>
                              {mod.suspension_reason && (
                                <div className="text-xs text-gray-600">
                                  Motivo: {mod.suspension_reason.replace(/_/g, ' ')}
                                </div>
                              )}
                              {mod.suspension_days && (
                                <div className="text-xs text-gray-600">
                                  Días estimados: {mod.suspension_days}
                                </div>
                              )}
                              {mod.expected_restart_date && (
                                <div className="text-xs text-gray-600">
                                  Reinicio estimado: {formatDate(mod.expected_restart_date)}
                                </div>
                              )}
                            </>
                          )}
                          {mod.type === "RESTART" && (
                            <>
                              <div className="flex items-center gap-1 text-green-600">
                                <Calendar className="h-3 w-3" />
                                <span className="text-sm font-semibold">Reiniciado el {formatDate(mod.restart_date)}</span>
                              </div>
                              {mod.actual_suspension_days && (
                                <div className="text-xs text-gray-600">
                                  Días reales de suspensión: {mod.actual_suspension_days}
                                </div>
                              )}
                            </>
                          )}
                          {mod.type === "LIQUIDATION" && (
                            <>
                              <div className="flex items-center gap-1 text-red-600">
                                <FileEdit className="h-3 w-3" />
                                <span className="text-sm font-semibold">Liquidado el {formatDate(mod.liquidation_date)}</span>
                              </div>
                              {mod.final_value && (
                                <div className="text-xs text-gray-600">
                                  Valor final: {formatCurrency(mod.final_value)}
                                </div>
                              )}
                              {mod.penalties_amount && parseFloat(mod.penalties_amount) > 0 && (
                                <div className="text-xs text-red-600">
                                  Penalidades: {formatCurrency(mod.penalties_amount)}
                                </div>
                              )}
                              {mod.liquidation_act_number && (
                                <div className="text-xs text-gray-600">
                                  Acta: {mod.liquidation_act_number}
                                </div>
                              )}
                              {mod.has_pending_obligations && (
                                <div className="text-xs text-orange-600">
                                  ⚠️ Tiene obligaciones pendientes
                                </div>
                              )}
                            </>
                          )}
                          {mod.type === "MODIFICATION" && (
                            <>
                              <div className="flex items-center gap-1 text-purple-600">
                                <FileEdit className="h-3 w-3" />
                                <span className="text-sm font-semibold">Cláusula {mod.clause_number}: {mod.clause_name}</span>
                              </div>
                              {mod.new_clause_text && (
                                <div className="text-xs text-gray-600 line-clamp-2">
                                  Nuevo texto: {mod.new_clause_text}
                                </div>
                              )}
                              {mod.requires_resource_liberation && (
                                <div className="text-xs text-orange-600">
                                  ⚠️ Requiere liberación de recursos
                                  {mod.liberation_amount && ` (${formatCurrency(mod.liberation_amount)})`}
                                </div>
                              )}
                            </>
                          )}
                          {mod.type === "ASSIGNMENT" && (
                            <>
                              <div className="flex items-center gap-1 text-indigo-600">
                                <TrendingUp className="h-3 w-3" />
                                <span className="text-sm font-semibold">
                                  {mod.assignment_type === 'TOTAL' ? 'Cesión Total' : 
                                  mod.assignment_type === 'PARTIAL' ? 'Cesión Parcial' : 
                                  'Subcontratación'}
                                </span>
                              </div>
                              {mod.assignee_name && (
                                <div className="text-xs text-gray-600">
                                  Cesionario: {mod.assignee_name} ({mod.assignee_id})
                                </div>
                              )}
                              {mod.assignor_name && (
                                <div className="text-xs text-gray-600">
                                  Cedente: {mod.assignor_name}
                                </div>
                              )}
                              {mod.assignment_percentage && (
                                <div className="text-xs text-blue-600">
                                  {mod.assignment_percentage}% del contrato
                                </div>
                              )}
                              {mod.assignment_value && (
                                <div className="text-xs text-green-600">
                                  Valor: {formatCurrency(mod.assignment_value)}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm line-clamp-2">{mod.justification}</p>
                      </TableCell>
                      <TableCell>
                        {mod.approval_date ? formatDate(mod.approval_date) : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("¿Está seguro de eliminar esta modificación?")) {
                              deleteMutation.mutate(mod.id)
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay modificaciones registradas</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded flex items-start gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800 dark:text-blue-200">Nota Importante</p>
            <p className="text-blue-700 dark:text-blue-300">
              Las modificaciones NO cambian el valor ni las fechas originales del proyecto.
              Solo registran cambios históricos para trazabilidad.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}