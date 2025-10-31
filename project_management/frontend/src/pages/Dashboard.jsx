import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import {
  TrendingUp,
  DollarSign,
  Clock,
  Building2,
  FileText,
  ArrowUpRight,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"
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
import { dashboardApi } from "@/lib/api"

export default function Dashboard() {
  const navigate = useNavigate()

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: dashboardApi.getMetrics,
  })

  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ["dashboard-charts"],
    queryFn: dashboardApi.getCharts,
  })

  const { data: recentProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ["recent-projects"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/projects/recent`)
      if (!response.ok) throw new Error('Error al cargar proyectos recientes')
      return response.json()
    },
  })

  const getStatusColor = (status) => {
    const colors = {
      "En ejecución": "bg-blue-100 text-blue-800",
      "Por iniciar": "bg-yellow-100 text-yellow-800",
      "Finalizado": "bg-green-100 text-green-800",
      "Suspendido": "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  if (metricsLoading || chartsLoading || projectsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-text-secondary mt-1">
            Resumen general del sistema de gestión de proyectos
          </p>
        </div>
        <Button onClick={() => navigate('/projects/create')}>
          <FileText className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/projects')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Proyectos Activos
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {metrics?.activeProjects?.value || 0}
            </div>
            <p className="text-xs text-text-secondary mt-2 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-success" />
              Total de proyectos en el sistema
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Valor Total
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(metrics?.totalValue?.value || 0)}
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Suma de todos los proyectos activos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Por Vencer
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {metrics?.expiring?.value || 0}
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Próximos 30 días
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow" onClick={() => navigate('/catalogs/entities')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Entidades
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">
              {metrics?.entities?.value || 0}
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Entidades registradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Evolución de Valor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Evolución del Valor de Proyectos
            </CardTitle>
            <p className="text-sm text-text-secondary">Últimos 6 meses</p>
          </CardHeader>
          <CardContent>
            {charts?.monthlyEvolution?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.monthlyEvolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#666' }}
                    tickLine={{ stroke: '#E0E0E0' }}
                  />
                  <YAxis 
                    tick={{ fill: '#666' }}
                    tickLine={{ stroke: '#E0E0E0' }}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Valor']}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E0E0E0",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0097A7"
                    strokeWidth={3}
                    dot={{ fill: '#0097A7', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-text-secondary">
                <FileText className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">No hay datos disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Proyectos por Estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Proyectos por Estado
            </CardTitle>
            <p className="text-sm text-text-secondary">Distribución actual</p>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {charts?.projectsByStatus?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={charts.projectsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {charts.projectsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#0097A7'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E0E0E0",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-text-secondary">
                <FileText className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">No hay datos disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Proyectos por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Proyectos por Tipo
          </CardTitle>
          <p className="text-sm text-text-secondary">Top 10 tipos de proyecto</p>
        </CardHeader>
        <CardContent>
          {charts?.projectsByType?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts.projectsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#666' }}
                  tickLine={{ stroke: '#E0E0E0' }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis 
                  tick={{ fill: '#666' }}
                  tickLine={{ stroke: '#E0E0E0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E0E0E0",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#0097A7" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-text-secondary">
              <FileText className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">No hay datos disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proyectos Recientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Proyectos Recientes
            </CardTitle>
            <p className="text-sm text-text-secondary mt-1">Últimos 5 proyectos creados</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
            Ver todos
          </Button>
        </CardHeader>
        <CardContent>
          {recentProjects?.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentProjects.map((project) => (
                    <TableRow 
                      key={project.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/projects/edit/${project.id}`)}
                    >
                      <TableCell className="font-medium">{project.code}</TableCell>
                      <TableCell className="max-w-xs truncate">{project.name}</TableCell>
                      <TableCell>{project.entity}</TableCell>
                      <TableCell className="font-semibold text-success">
                        {formatCurrency(project.value)}
                      </TableCell>
                      <TableCell>{formatDate(project.start_date)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30 text-text-secondary" />
              <p className="text-text-secondary">No hay proyectos recientes</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/projects/create')}
              >
                Crear primer proyecto
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}