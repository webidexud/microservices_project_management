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

        {/* Top Entidades con Más Proyectos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Top Entidades
            </CardTitle>
            <p className="text-sm text-text-secondary">
              Entidades con más proyectos activos
            </p>
          </CardHeader>
          <CardContent>
            {charts?.topEntities?.length > 0 ? (
              <div className="space-y-4">
                {/* Tabla de entidades */}
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                        <TableHead className="w-12 text-center font-semibold">#</TableHead>
                        <TableHead className="font-semibold">Entidad</TableHead>
                        <TableHead className="text-center font-semibold">Proyectos</TableHead>
                        <TableHead className="text-right font-semibold">Valor Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {charts.topEntities.slice(0, 10).map((entity, index) => (
                        <TableRow 
                          key={entity.entity_id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                          onClick={() => navigate(`/catalogs/entities`)}
                        >
                          <TableCell className="text-center">
                            <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm ${
                              index === 0 ? 'bg-yellow-400 text-yellow-900' :
                              index === 1 ? 'bg-gray-300 text-gray-800' :
                              index === 2 ? 'bg-orange-300 text-orange-900' :
                              'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {index + 1}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {entity.entity_name}
                                </p>
                                {entity.tax_id && (
                                  <p className="text-xs text-gray-500 truncate">
                                    NIT: {entity.tax_id}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                              <FileText className="h-3.5 w-3.5" />
                              {entity.project_count}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <p className="text-sm font-bold text-success">
                              {formatCurrency(entity.total_value || 0)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Prom: {formatCurrency((entity.total_value || 0) / (entity.project_count || 1))}
                            </p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Resumen estadístico */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xs text-text-secondary mb-1">Total Entidades</p>
                    <p className="text-lg font-bold text-primary">
                      {charts.topEntities.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-text-secondary mb-1">Entidad Líder</p>
                    <p className="text-lg font-bold text-warning">
                      {charts.topEntities[0]?.project_count || 0}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px] mx-auto">
                      {charts.topEntities[0]?.entity_name || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-text-secondary mb-1">Valor Acumulado</p>
                    <p className="text-lg font-bold text-success">
                      {formatCurrency(
                        charts.topEntities.reduce((sum, e) => sum + (e.total_value || 0), 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-text-secondary">
                <Building2 className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-sm font-medium">No hay datos disponibles</p>
                <p className="text-xs text-gray-500 mt-1">
                  Los datos aparecerán cuando se registren proyectos con entidades
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Proyectos por Tipo - Mejorado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Proyectos por Tipo
          </CardTitle>
          <p className="text-sm text-text-secondary">
            Top 10 tipos de proyecto con más registros
          </p>
        </CardHeader>
        <CardContent>
          {charts?.projectsByType?.length > 0 ? (
            <div className="space-y-4">
              {/* Gráfica de barras horizontales */}
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={charts.projectsByType.slice(0, 10)} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis 
                    type="number"
                    tick={{ fill: '#666', fontSize: 12 }}
                    tickLine={{ stroke: '#E0E0E0' }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    tick={{ fill: '#666', fontSize: 12 }}
                    tickLine={{ stroke: '#E0E0E0' }}
                    width={150}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0, 151, 167, 0.1)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                            <p className="font-semibold text-sm mb-1">{payload[0].payload.name}</p>
                            <div className="space-y-1 text-xs">
                              <p className="text-primary font-medium">
                                📊 {payload[0].value} proyecto{payload[0].value !== 1 ? 's' : ''}
                              </p>
                              <p className="text-success font-medium">
                                💰 {formatCurrency(payload[0].payload.total_value || 0)}
                              </p>
                              <p className="text-gray-600">
                                📈 Promedio: {formatCurrency((payload[0].payload.total_value || 0) / (payload[0].value || 1))}
                              </p>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[0, 8, 8, 0]}
                    maxBarSize={40}
                  >
                    {charts.projectsByType.slice(0, 10).map((entry, index) => {
                      const colors = [
                        '#0097A7', '#00ACC1', '#26C6DA', '#4DD0E1', '#80DEEA',
                        '#B2EBF2', '#E0F7FA', '#00838F', '#006064', '#004D40'
                      ]
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Resumen estadístico */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Total Tipos</p>
                  <p className="text-lg font-bold text-primary">
                    {charts.projectsByType.length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Más Popular</p>
                  <p className="text-lg font-bold text-success">
                    {charts.projectsByType[0]?.count || 0}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {charts.projectsByType[0]?.name || 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Valor Total</p>
                  <p className="text-lg font-bold text-info">
                    {formatCurrency(
                      charts.projectsByType.reduce((sum, item) => sum + (item.total_value || 0), 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-text-secondary">
              <FileText className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-sm font-medium">No hay datos disponibles</p>
              <p className="text-xs text-gray-500 mt-1">
                Los datos aparecerán cuando se registren proyectos
              </p>
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