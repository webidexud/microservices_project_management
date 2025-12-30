import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"

// import handleDownloadWord from "../lib/handleDowload.jsx"
import { useDownload } from "../lib/handleDowload.jsx"

// import { generateHash, changeStatus } from "../lib/api.jsx"

// Puerto publico anterior y dominio anterior puertos

import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  FileText,
  Calendar,
  DollarSign,
  X,
  User,
  FileDigit,
  ListPlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

import { getContracts } from '../lib/api.jsx'

export default function Contracts() {
  const navigate = useNavigate()
  const location = useLocation()
  const { downloadingId, handleDownloadWord } = useDownload();


  // Estados para el popup
  const [selectedContract, setSelectedContract] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Usar react-hook-form para los filtros
  const { register, watch, reset, handleSubmit, setValue } = useForm({
    defaultValues: {
      search: "",
      contractType: "",
      status: "",
      minValue: "",
      maxValue: ""
    }
  })

  // Observar todos los campos del formulario
  const filters = watch()
  const [showFilters, setShowFilters] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(null) // { contract, action, label }
  const openConfirmDialog = (contract, action, label) => {
    setPendingAction({ contract, action, label })
    setConfirmDialogOpen(true)
  }
  // const executePendingAction = async () => {
  //   if (!pendingAction) return

  //   const { contract, action } = pendingAction

  //   try {
  //     if (action === "sign") {
  //       await generateHash(contract.number_contract, contract.status)
  //       alert("Firmado correctamente")
  //     } else {
  //       await changeStatus(contract.number_contract, action)
  //       alert(`Estado cambiado a ${action}`)
  //     }

  //     refetch()
  //   } catch (error) {
  //     alert(error.response?.data?.message || "Error al ejecutar la acción")
  //   }

  //   setConfirmDialogOpen(false)
  // }



  // Función para abrir el popup con los datos del contrato
  const handleViewContract = (contract) => {
    setSelectedContract(contract)
    setIsViewDialogOpen(true)
  }


  const { data: contracts = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["contract"],
    queryFn: async () => {
      const response = await getContracts()
      return response.data.contracts || []
    },
    staleTime: 1000 * 60 * 5,
  })


  // Los filtros se aplican automáticamente cuando cambian los valores
  const filteredContracts = contracts.filter(contract => {

    // FILTRO POR TABS (estados)


    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        contract.project_name?.toLowerCase().includes(searchLower) ||
        contract.number_contract?.toString().includes(searchLower)
      if (!matchesSearch) return false
    }

    if (filters.contractType && contract.contract_type !== filters.contractType) {
      return false
    }

    if (filters.status && contract.status !== filters.status) {
      return false
    }

    if (filters.minValue && contract.value < parseFloat(filters.minValue)) {
      return false
    }

    if (filters.maxValue && contract.value > parseFloat(filters.maxValue)) {
      return false
    }

    return true
  })

  // Limpiar filtros
  const clearFilters = () => {
    reset()
  }

  // Opcional: Si quieres manejar submit (para búsquedas con Enter)
  const onFilterSubmit = (data) => {
    console.log("Filtros aplicados:", data)
    // Aquí podrías hacer refetch con los filtros si es necesario
  }

  const uniqueContractTypes = [...new Set(contracts.map(c => c.contract_type))].filter(Boolean)
  const uniqueStatuses = [...new Set(contracts.map(c => c.status))].filter(Boolean)

  const header_name = ["# contrato", "Nombre del proyecto", "Tipo de contrato", "Valor contrato", "Finalización", "Estado"]


  // Puedes poner esto en un archivo de constantes o arriba del componente
  const statusConfig = {
    incompleto: { variant: 'secondary', label: 'incompleto' },
    firmando_abogado: { variant: 'outline', label: 'firmando abogado' },
    firmando_cliente: { variant: 'secondary', label: 'firmando cliente' },
    firmando_lider: { variant: 'secondary', label: 'firmando lider' },
    firmando_director: { variant: 'outline', label: 'firmando director' },
    firmando_cesionado: { variant: 'outline', label: 'firmando cesionado' },
    activa: { variant: 'default', label: 'activa' },
    suspendida: { variant: 'destructive', label: 'suspendida' },
    cancelada: { variant: 'destructive', label: 'cancelada' }
  };


  return (
    <div className="space-y-6">
      {/* Header (igual que antes) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-text-secondary mt-1">
            Gestión de contratos de la oficina de extensión
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => navigate('/contract/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros CON REACT-HOOK-FORM */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onFilterSubmit)}>
            <div className="flex flex-col gap-4">
              {/* Primera fila: Búsqueda y botón de filtros */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por proyecto o número de contrato..."
                    {...register("search")}
                    className="pl-10"
                  />
                </div>
                <Button
                  type="button" // importante: type="button" para que no submittee
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                  {(filters.contractType || filters.status || filters.minValue || filters.maxValue) && (
                    <Badge variant="secondary" className="ml-1">
                      !
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Panel de filtros avanzados */}
              {showFilters && (
                <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Filtros Avanzados</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      Limpiar
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Filtro por tipo de contrato */}
                    <div>
                      <label className="text-sm font-medium mb-1 block">Tipo de Contrato</label>
                      <select
                        {...register("contractType")}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Todos los tipos</option>
                        {uniqueContractTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filtro por estado */}
                    <div>
                      <label className="text-sm font-medium mb-1 block">Estado</label>
                      <select
                        {...register("status")}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Todos los estados</option>
                        {uniqueStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filtro por valor mínimo */}
                    <div>
                      <label className="text-sm font-medium mb-1 block">Valor Mínimo</label>
                      <Input
                        type="number"
                        placeholder="Mínimo"
                        {...register("minValue")}
                      />
                    </div>

                    {/* Filtro por valor máximo */}
                    <div>
                      <label className="text-sm font-medium mb-1 block">Valor Máximo</label>
                      <Input
                        type="number"
                        placeholder="Máximo"
                        {...register("maxValue")}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Contador de resultados */}
          <div className="mt-3 text-sm text-gray-600">
            Mostrando {filteredContracts.length} de {contracts.length} contratos
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent>
          {isLoading ? (
            <div>Cargando información</div>
          ) : isError ? (
            <div>Error al cargar</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {header_name.map((hn) => (
                    <TableHead key={hn}>{hn}</TableHead>
                  ))}
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((data) => (
                  <TableRow key={data.CB_id}>
                    <TableCell>{data.CB_id}</TableCell>
                    <TableCell>{data.CB_project_name}</TableCell>
                    <TableCell>{data.CB_contract_type_name}</TableCell>
                    <TableCell>{formatCurrency(data.CB_value)}</TableCell>
                    <TableCell>{formatDate(data.CB_end_date)}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[data.CB_status_type_name]?.variant || 'outline'}>
                        {statusConfig[data.CB_status_type_name]?.label || data.CB_status_type_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* Botón para ver detalles */}
                        <Button
                          onClick={() => {
                            setIsViewDialogOpen(false)
                            navigate(`/contract/details/${data.CB_id}`)
                          }}
                        >
                          {/* <Eye className="h-4 w-4" /> */}
                          <ListPlus className="h-4 w-4" />
                        </Button>

                        <Button
                          onClick={() => navigate(`/contract/edit/${data.CB_id}`)}
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Botón para descargar */}

                        {/* <Button
                          onClick={() => handleDownloadWord(data.CB_id)}
                          disabled={downloadingId === data.CB_id}
                        >
                          <Download className="h-4 w-4" />
                        </Button> */}

                        {/* <Button
                          size="sm"
                          onClick={() =>
                            openConfirmDialog(
                              data,
                              "sign",
                              "¿Confirmas que deseas firmar este documento?"
                            )
                          }
                        >
                          <span className="material-symbols-outlined">signature</span>
                        </Button> */}

                        {/* <Button
                          size="sm"
                          onClick={() =>
                            openConfirmDialog(
                              data,
                              "suspendida",
                              "¿Seguro que deseas suspender este contrato?"
                            )
                          }
                        >
                          <i className="bi bi-archive"></i>
                        </Button> */}




                        {/* <Button
                          size="sm"
                          onClick={() =>
                            openConfirmDialog(
                              data,
                              "incompleto",
                              "¿Seguro que deseas marcar el contrato como incompleto?"
                            )
                          }
                        >
                          <i className="bi bi-align-start"></i>
                        </Button> */}

                        {/* <Button
                          size="sm"
                          className="bg-red-500"
                          onClick={() =>
                            openConfirmDialog(
                              data,
                              "cancelada",
                              "¿Seguro que deseas CANCELAR este contrato? Esta acción es irreversible."
                            )
                          }
                        >
                          <i className="bi bi-x-circle"></i>
                        </Button> */}

                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog/Popup para ver detalles del contrato */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-[100%] max-h-[90%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalles del Contrato
            </DialogTitle>
            <DialogDescription>
              Información completa del contrato #{selectedContract?.number_contract}
            </DialogDescription>
          </DialogHeader>

          {selectedContract && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* Columna izquierda - Información básica */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileDigit className="h-5 w-5" />
                      Información General
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Número de Contrato</label>
                      <p className="font-semibold">{selectedContract.number_contract}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nombre del Proyecto</label>
                      <p className="font-semibold">{selectedContract.project_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tipo de Contrato</label>
                      <p>{selectedContract.contract_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Estado</label>
                      <div className="mt-1">
                        <Badge variant={statusConfig[selectedContract.status]?.variant || 'outline'}>
                          {statusConfig[selectedContract.status]?.label || selectedContract.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Información de fechas */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Fechas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fecha de Inicio</label>
                      <p>{formatDate(selectedContract.start_date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fecha de Finalización</label>
                      <p>{formatDate(selectedContract.end_date)}</p>
                    </div>
                    {selectedContract.created_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Fecha de Creación</label>
                        <p>{formatDate(selectedContract.created_at)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Columna derecha - Información financiera y partes */}
              <div className="space-y-4">
                {/* Información financiera */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Información Financiera
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Valor del Contrato</label>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(selectedContract.value)}
                      </p>
                    </div>
                    {selectedContract.budget && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Presupuesto</label>
                        <p>{formatCurrency(selectedContract.budget)}</p>
                      </div>
                    )}
                    {selectedContract.payment_method && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Método de Pago</label>
                        <p>{selectedContract.payment_method}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Información de las partes */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Partes del Contrato
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedContract.client && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Cliente</label>
                        <p>{selectedContract.client}</p>
                      </div>
                    )}
                    {selectedContract.contractor && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Contratista</label>
                        <p>{selectedContract.contractor}</p>
                      </div>
                    )}
                    {selectedContract.company && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Empresa</label>
                        <p>{selectedContract.company}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>
            </div>
          )}
          {/* <Route path="contract/details/:id" element={<Detalles />} /> */}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsViewDialogOpen(false)
                navigate(`/contract/details/${selectedContract.number_contract}`)
              }}
            >
              Ver Contrato
            </Button>
            {selectedContract && (
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false)
                  navigate(`/contract/edit/${selectedContract.number_contract}`)
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Contrato
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmación</DialogTitle>
            <DialogDescription>
              {pendingAction?.label}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>

            <Button
              variant="destructive"
              onClick={executePendingAction}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

    </div>
  )
}