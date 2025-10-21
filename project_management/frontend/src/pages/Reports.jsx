import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Download,
  Filter,
  FileText,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export default function Reports() {
  const [reportType, setReportType] = useState("financial")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedEntity, setSelectedEntity] = useState("all")

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["reports", reportType, dateFrom, dateTo, selectedEntity],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: reportType,
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(selectedEntity !== "all" && { entity: selectedEntity }),
      })
      const response = await fetch(`${API_BASE_URL}/reports?${params}`)
      if (!response.ok) throw new Error('Error al cargar reportes')
      return response.json()
    },
  })

  const { data: entities } = useQuery({
    queryKey: ["entities-list"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/entities`)
      if (!response.ok) throw new Error('Error al cargar entidades')
      return response.json()
    },
  })

  const handleExportPDF = () => {
    console.log("Exportando a PDF...")
    // Implementar exportación PDF
  }

  const handleExportExcel = () => {
    console.log("Exportando a Excel...")
    // Implementar exportación Excel
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-text-secondary mt-1">
            Análisis y estadísticas del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Tipo de Reporte
              </label>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="financial">Financiero</option>
                <option value="by-entity">Por Entidad</option>
                <option value="by-dependency">Por Dependencia</option>
                <option value="by-status">Por Estado</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Fecha Desde
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Fecha Hasta
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Entidad</label>
              <Select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
              >
                <option value="all">Todas</option>
                {entities?.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Resumen */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Proyectos</p>
                <p className="text-2xl font-bold">{reportData?.totalProjects || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Valor Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(reportData?.totalValue || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Entidades</p>
                <p className="text-2xl font-bold">{reportData?.totalEntities || 0}</p>
              </div>
              <PieChartIcon className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">
                  Promedio Proyecto
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(reportData?.averageValue || 0)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principales */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Valor por Entidad */}
        <Card>
          <CardHeader>
            <CardTitle>Valor por Entidad</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData?.byEntity?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.byEntity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #CFD8DC",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#0097A7" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-text-secondary">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Proyectos por Estado */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {reportData?.byStatus?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.byStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportData.byStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-text-secondary">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Evolución Mensual */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          {reportData?.byMonth?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.byMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #CFD8DC",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0097A7"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-text-secondary">
              No hay datos disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {/* Valor por Dependencia */}
      <Card>
        <CardHeader>
          <CardTitle>Valor por Dependencia</CardTitle>
        </CardHeader>
        <CardContent>
          {reportData?.byDependency?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.byDependency} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #CFD8DC",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="#26C6DA" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-text-secondary">
              No hay datos disponibles
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}