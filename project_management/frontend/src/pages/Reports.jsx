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
  FileSpreadsheet,
  Tag,
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
import { rupCodesApi } from "@/lib/api"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function Reports() {
  const [reportType, setReportType] = useState("general")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedEntity, setSelectedEntity] = useState("all")
  const [selectedDependency, setSelectedDependency] = useState("all")
  const [selectedProjectType, setSelectedProjectType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedRupSegment, setSelectedRupSegment] = useState("all")
  const [selectedRupFamily, setSelectedRupFamily] = useState("all")
  const [selectedRupClass, setSelectedRupClass] = useState("all")
  const [showRupFilters, setShowRupFilters] = useState(false)

  // Queries
  const { data: reportData, isLoading } = useQuery({
    queryKey: ["reports", reportType, dateFrom, dateTo, selectedEntity, selectedDependency, 
               selectedProjectType, selectedStatus, selectedRupSegment, selectedRupFamily, selectedRupClass],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: reportType,
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(selectedEntity !== "all" && { entity: selectedEntity }),
        ...(selectedDependency !== "all" && { dependency: selectedDependency }),
        ...(selectedProjectType !== "all" && { projectType: selectedProjectType }),
        ...(selectedStatus !== "all" && { status: selectedStatus }),
        ...(selectedRupSegment !== "all" && { rupSegment: selectedRupSegment }),
        ...(selectedRupFamily !== "all" && { rupFamily: selectedRupFamily }),
        ...(selectedRupClass !== "all" && { rupClass: selectedRupClass }),
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

  const { data: dependencies } = useQuery({
    queryKey: ["dependencies-list"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/dependencies`)
      if (!response.ok) throw new Error('Error al cargar dependencias')
      return response.json()
    },
  })

  const { data: projectTypes } = useQuery({
    queryKey: ["project-types-list"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/project-types`)
      if (!response.ok) throw new Error('Error al cargar tipos de proyecto')
      return response.json()
    },
  })

  const { data: rupSegments } = useQuery({
    queryKey: ["rup-segments"],
    queryFn: () => rupCodesApi.getSegments(),
  })

  const { data: rupFamilies } = useQuery({
    queryKey: ["rup-families", selectedRupSegment],
    queryFn: () => rupCodesApi.getFamilies(selectedRupSegment),
    enabled: !!selectedRupSegment && selectedRupSegment !== 'all',
  })

  const { data: rupClasses } = useQuery({
    queryKey: ["rup-classes", selectedRupFamily],
    queryFn: () => rupCodesApi.getClasses(selectedRupFamily),
    enabled: !!selectedRupFamily && selectedRupFamily !== 'all',
  })

  const handleExportDetailed = async () => {
    try {
      const params = new URLSearchParams({
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(selectedEntity !== "all" && { entity: selectedEntity }),
        ...(selectedDependency !== "all" && { dependency: selectedDependency }),
        ...(selectedProjectType !== "all" && { projectType: selectedProjectType }),
        ...(selectedStatus !== "all" && { status: selectedStatus }),
      })
      
      const response = await fetch(`${API_BASE_URL}/reports/detailed?${params}`)
      const data = await response.json()
      
      // Convertir a CSV
      const csv = convertToCSV(data.projects)
      downloadCSV(csv, `reporte_${new Date().toISOString().split('T')[0]}.csv`)
    } catch (error) {
      console.error('Error al exportar:', error)
      alert('Error al exportar el reporte')
    }
  }

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const rows = data.map(row => 
      headers.map(header => {
        const value = row[header]
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      }).join(',')
    )
    
    return [headers.join(','), ...rows].join('\n')
  }

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
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
          <h1 className="text-3xl font-bold">Reportes y Analítica</h1>
          <p className="text-text-secondary mt-1">
            Análisis detallado de proyectos y códigos RUP
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportDetailed}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tipo de Reporte
                </label>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="general">General</option>
                  <option value="rup">Por Códigos RUP</option>
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
                <label className="text-sm font-medium mb-2 block">Estado</label>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="En ejecución">En ejecución</option>
                  <option value="Por iniciar">Por iniciar</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Suspendido">Suspendido</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
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
              <div>
                <label className="text-sm font-medium mb-2 block">Dependencia</label>
                <Select
                  value={selectedDependency}
                  onChange={(e) => setSelectedDependency(e.target.value)}
                >
                  <option value="all">Todas</option>
                  {dependencies?.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Proyecto</label>
                <Select
                  value={selectedProjectType}
                  onChange={(e) => setSelectedProjectType(e.target.value)}
                >
                  <option value="all">Todos</option>
                  {projectTypes?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Filtros RUP */}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRupFilters(!showRupFilters)}
                className="gap-2"
              >
                <Tag className="h-4 w-4" />
                {showRupFilters ? 'Ocultar' : 'Mostrar'} Filtros RUP
              </Button>
            </div>

            {showRupFilters && (
              <div className="grid gap-4 md:grid-cols-3 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <div>
                  <label className="text-sm font-medium mb-2 block">Segmento RUP</label>
                  <Select
                    value={selectedRupSegment}
                    onChange={(e) => {
                      setSelectedRupSegment(e.target.value)
                      setSelectedRupFamily("all")
                      setSelectedRupClass("all")
                    }}
                  >
                    <option value="all">Todos los segmentos</option>
                    {rupSegments?.map((seg) => (
                      <option key={seg.code} value={seg.code}>
                        {seg.code} - {seg.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Familia RUP</label>
                  <Select
                    value={selectedRupFamily}
                    onChange={(e) => {
                      setSelectedRupFamily(e.target.value)
                      setSelectedRupClass("all")
                    }}
                    disabled={!selectedRupSegment || selectedRupSegment === 'all'}
                  >
                    <option value="all">Todas las familias</option>
                    {rupFamilies?.map((fam) => (
                      <option key={fam.code} value={fam.code}>
                        {fam.code} - {fam.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Clase RUP</label>
                  <Select
                    value={selectedRupClass}
                    onChange={(e) => setSelectedRupClass(e.target.value)}
                    disabled={!selectedRupFamily || selectedRupFamily === 'all'}
                  >
                    <option value="all">Todas las clases</option>
                    {rupClasses?.map((cls) => (
                      <option key={cls.code} value={cls.code}>
                        {cls.code} - {cls.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Métricas Resumen */}
      {reportData?.metrics && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Total Proyectos</p>
                  <p className="text-2xl font-bold">{reportData.metrics.total_projects || 0}</p>
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
                    {formatCurrency(reportData.metrics.total_value || 0)}
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
                  <p className="text-sm text-text-secondary">Promedio</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(reportData.metrics.average_value || 0)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Entidades</p>
                  <p className="text-2xl font-bold">{reportData.metrics.total_entities || 0}</p>
                </div>
                <PieChartIcon className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Dependencias</p>
                  <p className="text-2xl font-bold">{reportData.metrics.total_dependencies || 0}</p>
                </div>
                <PieChartIcon className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos Principales */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Valor por Entidad */}
        {reportData?.byEntity?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Valor por Entidad (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.byEntity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
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
            </CardContent>
          </Card>
        )}

        {/* Proyectos por Estado */}
        {reportData?.byStatus?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Estado</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.byStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {reportData.byStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gráficos RUP */}
      {(reportType === 'rup' || reportType === 'general') && (
        <>
          {/* Por Segmento RUP */}
          {reportData?.byRupSegment?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Proyectos por Segmento RUP (Top 15)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={reportData.byRupSegment} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={200} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'value') return [formatCurrency(value), 'Valor']
                        if (name === 'count') return [value, 'Proyectos']
                        return value
                      }}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #CFD8DC",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" fill="#26C6DA" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Top Códigos RUP */}
          {reportData?.topRupCodes?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top 20 Códigos RUP Más Utilizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.topRupCodes.map((rup, index) => (
                    <div key={rup.code} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-primary">#{index + 1}</span>
                          <span className="font-mono text-sm font-semibold">{rup.code}</span>
                        </div>
                        <p className="text-sm font-medium">{rup.name}</p>
                        <div className="flex gap-2 mt-1">
                          {rup.segment_name && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {rup.segment_name}
                            </span>
                          )}
                          {rup.family_name && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              {rup.family_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{rup.count} proyectos</p>
                        <p className="text-xs text-text-secondary">{formatCurrency(rup.value)}</p>
                        {rup.avg_participation && (
                          <p className="text-xs text-info mt-1">
                            {parseFloat(rup.avg_participation).toFixed(1)}% promedio
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerta de proyectos sin RUP */}
          {reportData?.projectsWithoutRup > 0 && (
            <Card className="border-warning bg-warning/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="font-semibold">Proyectos sin códigos RUP</p>
                    <p className="text-sm text-text-secondary">
                      Hay <strong>{reportData.projectsWithoutRup}</strong> proyecto(s) sin códigos RUP asignados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Valor por Dependencia */}
      {reportData?.byDependency?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Valor por Dependencia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.byDependency} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
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
          </CardContent>
        </Card>
      )}

      {/* Evolución Mensual */}
      {reportData?.byMonth?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolución Mensual</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}