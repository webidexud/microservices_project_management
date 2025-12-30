import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
    ArrowLeft,
    PenTool,
    Plus,
    FileText,
    Calendar,
    DollarSign,
    User,
    History,
    Edit,
    CheckCircle2,
    AlertCircle,
    Download
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
// import { getContractById } from "../lib/api"
import { getContractById, signContract } from "../lib/api.jsx"
import { formatDate, formatCurrency } from "../lib/utils"
import ContractAllPreview from "../components/docs/ContractAllPreview.jsx"
import CreateAditions from "../components/addition/CreateAditions.jsx"
import ContractProgressBar from "../components/ui/progressBar.jsx"
import DownloadDocumentButton from "../components/docs/DownloadDocumentButton.jsx"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert.jsx"
import {
    AlertDialog, AlertDialogContent,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction,
    AlertDialogDescription
} from "@/components/ui/alertdialog.jsx"

export default function Detalles() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [isAdditionOpen, setIsAdditionOpen] = useState(false)
    const [isSigning, setIsSigning] = useState(false)
    const [signError, setSignError] = useState(null)
    const [signSuccess, setSignSuccess] = useState(null)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)

    const handlePopupOpen = () => {
        setIsPopupOpen(true)
    }

    const handlePopupClose = () => {
        setIsPopupOpen(false)
    }

    const handleAdditionClose = () => {
        setIsAdditionOpen(false)
    }

    const handleAdditionOpen = () => {
        setIsAdditionOpen(true)
    }

    // Función para firmar el contrato
    const handleSignContract = async () => {
        if (!id || !contract?.CB_status_type_id) {
            setSignError("No se puede firmar el contrato: información incompleta")
            return
        }

        // Confirmar antes de firmar
        // const confirmed = window.confirm(
        //     "¿Está seguro que desea firmar este contrato?\n\n" +
        //     "Esta acción es irreversible y cambiará el estado del contrato."
        // )

        // if (!confirmed) return

        try {
            setIsSigning(true)
            setSignError(null)
            setSignSuccess(null)

            // Determinar el siguiente estado según el estado actual
            const currentStatus = contract.CB_status_type_id
            let nextStatus

            // Lógica de transición de estados (ajusta según tu flujo)
            switch (currentStatus) {
                case 1: // Incompleto → Firmando por Abogado
                    nextStatus = 2
                    break
                case 2: // Firmando por Abogado → Firmando por Cliente
                    nextStatus = 3
                    break
                case 3: // Firmando por Cliente → Firmando por Lider de Area
                    nextStatus = 4
                    break
                case 4: // Firmando por Lider de Area → Firmando por Director
                    nextStatus = 5
                    break
                case 5: // Firmando por Director → Activa
                    nextStatus = 6
                    break
                case 6: // Firmado por Cesionado → Activa
                    nextStatus = 6
                    break

                default:
                    throw new Error("Estado no permitido para firma")
            }

            // Llamar a la API de firma
            const response = await signContract(id, contract?.CB_status_type_id)

            // Mostrar mensaje de éxito
            setSignSuccess(response.data?.message || "✅ Contrato firmado exitosamente")

            // Actualizar los datos del contrato
            setTimeout(() => {
                refetch()
                setSignSuccess(null)
            }, 3000)

        } catch (error) {
            console.error("Error al firmar el contrato:", error)
            setSignError(
                error.response?.data?.message ||
                error.message ||
                "❌ Error al firmar el contrato. Por favor, intente nuevamente."
            )

            // Limpiar error después de 5 segundos
            setTimeout(() => {
                setSignError(null)
            }, 5000)
        } finally {
            setIsSigning(false)
        }
    }

    const openConfirmDialog = () => {
        setShowConfirmDialog(true)
    }

    const confirmSign = () => {
        setShowConfirmDialog(false)
        handleSignContract()
    }

    // Fetch contract data
    const { data: contract, isLoading, refetch } = useQuery({
        queryKey: ["contract", id],
        queryFn: async () => {
            try {
                const res = await getContractById(id)
                return res.data.contract || {}
            } catch (error) {
                console.error("Error fetching contract:", error)
                return null
            }
        },
        enabled: !!id,
    })



    const modifications = contract?.baseAddition || []
    const additions = modifications.filter(mod => mod.BA_addition_type_id === 2)

    const totalValue = additions.reduce((acc, mod) => {
        return acc + (parseFloat(mod.specific_data?.AD_value) || 0)
    }, parseFloat(contract?.CB_value) || 0)

    const prorrogation = modifications.filter(mod => mod.BA_addition_type_id === 1)

    // 1. Calcular suma total de días de prórroga
    const totalDiasProrroga = prorrogation.reduce((sum, prorroga) => {
        const dias = prorroga.specific_data?.EX_time_extension
        return sum + (parseInt(dias) || 0)
    }, 0)

    // 2. Calcular fecha final considerando prórrogas
    const calculateFinalEndDate = (contract, totalDiasProrroga) => {
        if (!contract?.CB_end_date) return null

        const fechaOriginal = new Date(contract.CB_end_date)
        const fechaFinal = new Date(fechaOriginal)

        // Sumar días de prórroga
        fechaFinal.setDate(fechaFinal.getDate() + totalDiasProrroga)

        return fechaFinal.toISOString().split('T')[0]
    }

    const fechaFinal = calculateFinalEndDate(contract, totalDiasProrroga)

    // Determinar si se puede firmar
    const canSign = contract?.CB_status_type_id &&
        contract.CB_status_type_id >= 1 &&
        contract.CB_status_type_id <= 6

    // Texto del botón según estado
    const getSignButtonText = () => {
        switch (contract?.CB_status_type_id) {
            case 1: return "Firmar (Iniciar Proceso)"
            case 2: return "Firmar como Abogado"
            case 3: return "Firmar como Cliente"
            case 4: return "Firmar como Lider de Area"
            case 5: return "Firmar como Director"
            case 6: return "Firmar como Cesionado"
            case 7: return "Contrato Activo ✓"
            case 8: return "Contrato Suspendido"
            case 9: return "Contrato Cancelado"
            default: return "Firmar Contrato"
        }
    }
    // Función auxiliar para obtener nombre del siguiente estado
    const getNextStatusName = (currentStatus) => {
        switch (currentStatus) {
            case 1: return "Firmando por Abogado"
            case 2: return "Firmando por Cliente"
            case 3: return "Firmar como Lider de Area"
            case 4: return "Firmar como Director"
            case 5: return "Activo"
            default: return "Sin cambios"
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-10">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b shadow-sm">
                <div className="max-w-[1800px] mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/contract")}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Detalles del Contrato #{id}
                                <span className={`text-sm px-2 py-0.5 rounded-full ${contract?.CB_status_type_id === 1 ? 'bg-yellow-100 text-yellow-800' :
                                    contract?.CB_status_type_id === 6 ? 'bg-green-100 text-green-800' :
                                        contract?.CB_status_type_id === 5 ? 'bg-blue-100 text-blue-800' :
                                            contract?.CB_status_type_id === 7 ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {contract?.CB_status_type_name}
                                </span>
                            </h1>
                            <p className="text-sm text-text-secondary mt-0.5">
                                Vista general y gestión del contrato
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleAdditionOpen}>
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Adicional
                        </Button>
                        <Button
                            onClick={openConfirmDialog}
                            disabled={isSigning || !canSign}
                            className={`${canSign ? 'bg-primary hover:bg-primary/90' : 'bg-gray-400 cursor-not-allowed'}`}
                        >
                            {isSigning ? (
                                <Download className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <PenTool className="h-4 w-4 mr-2" />
                            )}
                            {isSigning ? "Procesando..." : getSignButtonText()}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Diálogo de confirmación */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmar firma de contrato?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción es irreversible y cambiará el estado del contrato.
                            <br /><br />
                            <strong>Contrato #{id}</strong>
                            <br />
                            {contract?.CB_project_name && (
                                <>Proyecto: {contract.CB_project_name}<br /></>
                            )}
                            Estado actual: {contract?.CB_status_type_name}
                            <br />
                            Nuevo estado: {getNextStatusName(contract?.CB_status_type_id)}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmSign}
                            className="bg-primary hover:bg-primary/90"
                        >
                            <PenTool className="h-4 w-4 mr-2" />
                            Confirmar Firma
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Notificaciones de firma */}
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 pt-4">
                {signError && (
                    <Alert variant="destructive" className="mb-4">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                            {signError}
                        </AlertDescription>
                    </Alert>
                )}

                {signSuccess && (
                    <Alert variant="success" className="mb-4">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                            {signSuccess}
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">


                <div className="col-span-1 lg:col-span-3">
                    <ContractProgressBar contract={contract} modifications={modifications} currentDate={new Date()} />
                </div>
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Key Details Cards - Responsive grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
                        <Card className="h-full">
                            <CardContent className="pt-5 sm:pt-6 flex items-center gap-3 sm:gap-4">
                                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 flex-shrink-0">
                                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Valor Total</p>
                                    <p className="text-lg sm:text-xl font-bold truncate" title={formatCurrency(totalValue)}>
                                        {formatCurrency(totalValue)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="h-full">
                            <CardContent className="pt-5 sm:pt-6 flex items-center gap-3 sm:gap-4">
                                <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 flex-shrink-0">
                                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Fecha Inicio</p>
                                    <p className="text-base sm:text-lg font-semibold truncate" title={contract?.CB_start_date ? new Date(contract.CB_start_date).toLocaleDateString() : 'N/A'}>
                                        {contract?.CB_start_date ? new Date(contract.CB_start_date).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="h-full">
                            <CardContent className="pt-5 sm:pt-6 flex items-center gap-3 sm:gap-4">
                                <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 flex-shrink-0">
                                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Fecha Fin</p>
                                    <p className="text-base sm:text-lg font-semibold truncate" title={contract?.CB_end_date ? new Date(contract.CB_end_date).toLocaleDateString() : 'N/A'}>
                                        {contract?.CB_end_date ? new Date(fechaFinal).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="h-full">
                            <CardContent className="pt-5 sm:pt-6 flex items-center gap-3 sm:gap-4">
                                <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400 flex-shrink-0">
                                    <User className="h-5 w-5 sm:h-6 sm:w-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Supervisor</p>
                                    <p className="text-base sm:text-lg font-semibold truncate" title={contract?.supervisor_name || 'No asignado'}>
                                        {contract?.supervisor_name || 'No asignado'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Info Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                                Información del Contrato
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-1">
                                    <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Objeto del Contrato</h4>
                                    <p className="text-sm sm:text-base line-clamp-2 md:line-clamp-3" title={contract?.CB_project_name || "Sin descripción"}>
                                        {contract?.CB_project_name || "Sin descripción"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Lugar de Ejecución</h4>
                                    <p className="text-sm sm:text-base truncate" title={contract?.CB_execution_location || "No especificado"}>
                                        {contract?.CB_execution_location || "No especificado"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Entidad Contratante</h4>
                                    <p className="text-sm sm:text-base truncate" title={contract?.CD_contracting_entity || "N/A"}>
                                        {contract?.CD_contracting_entity || "N/A"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Duración</h4>
                                    <p className="text-sm sm:text-base">
                                        {contract?.CB_total_duration ? `${contract.CB_total_duration + totalDiasProrroga} días` : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Modifications History Table - Scrollable en móvil */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                <History className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                                Historial de Modificaciones
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto -mx-2 sm:mx-0">
                                <div className="min-w-[640px] sm:min-w-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="py-3 text-xs sm:text-sm">Fecha Inicio</TableHead>
                                                <TableHead className="py-3 text-xs sm:text-sm">Fecha Fin</TableHead>
                                                <TableHead className="py-3 text-xs sm:text-sm">Tipo</TableHead>
                                                <TableHead className="py-3 text-xs sm:text-sm">Justificación</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {modifications.map((mod) => (
                                                <TableRow key={mod.BA_id}>
                                                    <TableCell className="py-3 text-xs sm:text-sm font-medium whitespace-nowrap">
                                                        {mod.BA_start_date_addition}
                                                    </TableCell>
                                                    <TableCell className="py-3 text-xs sm:text-sm whitespace-nowrap">
                                                        {mod.BA_end_date_addition}
                                                    </TableCell>
                                                    <TableCell className="py-3 text-xs sm:text-sm">
                                                        <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                                            {mod.BA_addition_type_name}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-3 text-xs sm:text-sm max-w-[200px] lg:max-w-[300px]">
                                                        <div className="truncate" title={mod.BA_justification}>
                                                            {mod.BA_justification}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                            {modifications.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    No hay modificaciones registradas
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column: Sidebar / Actions / Summary */}
                <div className="space-y-6">
                    {/* Financial Summary Card */}
                    <Card className="bg-slate-50 dark:bg-slate-900/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base sm:text-lg">Resumen Financiero</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-xs sm:text-sm text-muted-foreground">Valor Inicial</span>
                                <span className="font-medium text-xs sm:text-sm truncate pl-2" title={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(contract?.CB_value || 0)}>
                                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', notation: 'compact' }).format(contract?.CB_value || 0)}
                                </span>
                            </div>
                            {additions.map((addition, index) => (
                                <div key={index} className="flex justify-between items-center border-b pb-2">
                                    <span className="text-xs sm:text-sm text-muted-foreground">Adición {index + 1}</span>
                                    <span className="font-medium text-green-600 text-xs sm:text-sm truncate pl-2">
                                        +{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', notation: 'compact' }).format(addition.specific_data.AD_value)}
                                    </span>
                                </div>
                            ))}


                            <div className="flex justify-between items-center pt-2">
                                <span className="font-bold text-sm sm:text-base">Valor Actual</span>
                                <span className="font-bold text-sm sm:text-lg truncate pl-2" title={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format((contract?.CB_value || 0) + 5000000)}>
                                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', notation: 'compact' }).format((totalValue || 0))}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base sm:text-lg">Acciones Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 sm:space-y-3">
                            <Button
                                variant="outline"
                                className="w-full justify-start h-auto py-2 sm:py-3"
                                onClick={handlePopupOpen}
                            >
                                <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span className="truncate text-left">Ver Previsualización</span>
                            </Button>

                            <DownloadDocumentButton
                                contractId={id}
                                variant="outline"
                            >
                                Descargar Documento Word
                            </DownloadDocumentButton>

                            {/* Botón de estado de firma */}
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                                <h4 className="text-sm font-medium mb-2">Estado de Firma</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-xs text-muted-foreground">Actual:</span>
                                        <span className="text-xs font-medium">{contract?.CB_status_type_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-muted-foreground">Próximo paso:</span>
                                        <span className="text-xs">
                                            {canSign ? (
                                                <span className="text-green-600 font-medium">Pendiente de firma</span>
                                            ) : (
                                                <span className="text-gray-500">Proceso completado</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Optional: Additional Info Card para pantallas grandes */}
                    <div className="hidden xl:block">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Información Adicional</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-xs text-muted-foreground">Estado</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full`}>
                                        {contract?.CB_status_type_name || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-muted-foreground">Tipo de Contrato</span>
                                    <span className="text-xs font-medium">{contract?.CB_contract_type_name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-muted-foreground">Método de Pago</span>
                                    <span className="text-xs font-medium">{contract?.CB_payment_method_name || 'N/A'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>

            </div>


            {/* popup/Modal */}
            {isPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
                        {/* Encabezado del popup */}
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-lg font-semibold">Previsualización del Contrato</h2>
                            <button
                                onClick={handlePopupClose}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Contenido del popup con scroll */}
                        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-4">
                            <ContractAllPreview data={contract} />
                        </div>

                        {/* Pie del popup */}
                        <div className="p-4 border-t flex justify-end">
                            <Button
                                onClick={handlePopupClose}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* popup/Modal Adiciones */}
            {isAdditionOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
                        {/* Encabezado del popup */}
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-lg font-semibold">Crear Adicional</h2>
                            <button
                                onClick={handleAdditionClose}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Contenido del popup con scroll */}
                        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-4">
                            <CreateAditions id={id}
                                onSuccess={() => {
                                    handleAdditionClose()
                                    refetch()
                                }}
                            />
                        </div>

                        {/* Pie del popup */}
                        <div className="p-4 border-t flex justify-end">
                            <Button
                                onClick={handleAdditionClose}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </div>
            )}









        </div>
    )
}



