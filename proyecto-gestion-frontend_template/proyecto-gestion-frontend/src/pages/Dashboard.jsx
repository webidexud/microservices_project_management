import { useQuery } from "@tanstack/react-query"
import {
  TrendingUp,
  DollarSign,
  Clock,
  Building2,
  Users,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
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

// Datos mock - reemplazar con API real
const mockMetrics = {
  activeProjects: { value: 24, change: 12, trend: "up" },
  totalValue: { value: 1234567890, change: 8, trend: "up" },
  expiring: { value: 5, change: 0, trend: "neutral" },
  entities: { value: 18, change: 2, trend: "up" },
}

const mockRecentProjects = [
  {
    id: 1,
    name: "Modernización Sistema de Información",
    entity: "Ministerio de Educación",
    value: 250000000,
    status: "En ejecución",
    endDate: "2025-12-31",
  },
  {
    id: 2,
    name: "Capacitación Docente Virtual",
    entity: "Secretaría de Educación",
    value: 150000000,
    status: "Por iniciar",
    endDate: "2025-11-15",
  },
  {
    id: 3,
    name: "Estudio de Movilidad Urbana",
    entity: "Alcaldía Mayor",
    value: 180000000,
    status: "En ejecución",
    endDate: "2025-10-30",
  },
  {
    id: 4,
    name: "Evaluación Ambiental",
    entity: "CAR Cundinamarca",
    value: 95000000,
    status: "Finalizado",
    endDate: "2025-09-20",
  },
]

const mockChartData = [
  { month: "Ene", value: 850000000 },
  { month: "Feb", value: 920000000 },
  { month: "Mar", value: 1100000000 },
  { month: "Abr", value: 1050000000 },
  { month: "May", value: 1234567890 },
]

const mockProjectsByStatus = [
  { name: "En ejecución", value: 12, color: "#0097A7" },
  { name: "Por iniciar", value: 5, color: "#26C6DA" },
  { name: "Finalizados", value: 7, color: "#43A047" },
]

const mockProjectsByType = [
  { name: "Consultoría", count: 8 },
  { name: "Capacitación", count: 6 },
  { name: "Investigación", count: 5 },
  { name: "Desarrollo", count: 5 },
]

export default function Dashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => mockMetrics,
  })

  const getStatusColor = (status) => {
    const colors = {
      "En ejecución": "info",
      "Por iniciar": "warning",
      Finalizado: "success",
      Suspendido: "danger",
    }
    return colors[status] || "default"
  }

  if (isLoading) {
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
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-text-secondary mt-1">
          Resumen general del sistema de gestión de proyectos
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Proyectos Activos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeProjects.value}</div>
            <p className="text-xs text-success mt-1">
              +{metrics.activeProjects.change}% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Valor Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.totalValue.value)}
            </div>
            <p className="text-xs text-success mt-1">
              +{metrics.totalValue.change}% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Por Vencer
            </CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.expiring.value}</div>
            <p className="text-xs text-text-secondary mt-1">
              Próximos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Entidades
            </CardTitle>
            <Building2 className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.entities.value}</div>
            <p className="text-xs text-success mt-1">
              +{metrics.entities.change} nuevas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Evolución de Valor */}
        <Card>
          <CardHeader>
            <CardTitle>Evolución del Valor de Proyectos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
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

        {/* Proyectos por Estado */}
        <Card>
          <CardHeader>
            <CardTitle>Proyectos por Estado</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockProjectsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockProjectsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Proyectos por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Proyectos por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockProjectsByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #CFD8DC",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="#0097A7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Proyectos Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Proyectos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyecto</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Fin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRecentProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.entity}</TableCell>
                  <TableCell>{formatCurrency(project.value)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(project.endDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}