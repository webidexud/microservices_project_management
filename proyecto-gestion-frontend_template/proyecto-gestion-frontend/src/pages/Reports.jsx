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

const mockReportData = {
  byEntity: [
    { name: "Min. Educación", value: 450000000, projects: 8 },
    { name: "Alcaldía Mayor", value: 380000000, projects: 6 },
    { name: "Sec. Educación", value: 280000000, projects: 5 },
    { name: "CAR", value: 190000000, projects: 3 },
    { name: "Otros", value: 234567890, projects: 4 },
  ],
  byDependency: [
    { name: "Ingeniería", value: 520000000, projects: 10 },
    { name: "Educación", value: 380000000, projects: 7 },
    { name: "Artes", value: 290000000, projects: 5 },
    { name: "Ciencias", value: 344567890, projects: 4 },
  ],
  byStatus: [
    { name: "En ejecución", value: 12, color: "#0097A7" },
    { name: "Por iniciar", value: 5, color: "#26C6DA" },
    { name: "Finalizados", value: 7, color: "#43A047" },
    { name: "Suspendidos", value: 2, color: "#E53935" },
  ],
  byMonth: [
    { month: "Ene", value: 850000000, projects: 15 },
    { month: "Feb", value: 920000000, projects: 18 },
    { month: "Mar", value: 1100000000, projects: 22 },
    { month: "Abr", value: 1050000000, projects: 20 },
    { month: "May", value: 1234567890, projects: 26 },
  ],
}

export default function Reports() {
  const [reportType, setReportType] = useState("financial")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedEntity, setSelectedEntity] = useState("all")

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["reports", reportType],
    queryFn: async () => mockReportData,
  })

  const handleExportPDF = () => {
    console.log("Exportando a PDF...")
  }

  const handleExportExcel = () => {
    console.log("Exportando a Excel...")
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
                <option value="1">Ministerio de Educación</option>
                <option value="2">Alcaldía Mayor</option>
                <option value="3">Secretaría de Educación</option>
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
                <p className="text-2xl font-bold">26</p>
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
                  {formatCurrency(1534567890)}
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
                <p className="text-2xl font-bold">18</p>
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
                  {formatCurrency(59021842)}
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
          </CardContent>
        </Card>

        {/* Proyectos por Estado */}
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
          </CardContent>
        </Card>
      </div>

      {/* Evolución Mensual */}
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

      {/* Valor por Dependencia */}
      <Card>
        <CardHeader>
          <CardTitle>Valor por Dependencia</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  )
}