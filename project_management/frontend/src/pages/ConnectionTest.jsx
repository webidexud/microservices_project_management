import { useQuery } from "@tanstack/react-query"
import { CheckCircle2, XCircle, Database, Server, Clock, Table } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ConnectionTest() {
  const { data: connectionData, isLoading, error, refetch } = useQuery({
    queryKey: ["connection-status"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8000/api/health")
      if (!response.ok) throw new Error("No se pudo conectar al backend")
      return response.json()
    },
    refetchInterval: 5000,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Test de Conexión</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Verificación de conexión a la base de datos PostgreSQL
        </p>
      </div>

      {/* Estado de Conexión Principal */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Database className="h-6 w-6" />
            Estado de la Conexión
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center gap-3 text-amber-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              <span className="text-lg">Verificando conexión...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 text-red-600">
              <XCircle className="h-8 w-8" />
              <div>
                <p className="text-lg font-semibold">Error de Conexión</p>
                <p className="text-sm text-gray-600">{error.message}</p>
              </div>
            </div>
          )}

          {connectionData?.database && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {connectionData.database.success ? (
                  <>
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-lg font-semibold text-green-600">
                        Conexión Exitosa
                      </p>
                      <p className="text-sm text-gray-600">
                        La base de datos está respondiendo correctamente
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="text-lg font-semibold text-red-600">
                        Conexión Fallida
                      </p>
                      <p className="text-sm text-gray-600">
                        {connectionData.database.error}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detalles de la Conexión */}
      {connectionData?.database?.success && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-5 w-5" />
                Información del Servidor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">
                  Base de Datos
                </p>
                <p className="font-medium">{connectionData.database.database}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Host</p>
                <p className="font-medium">{connectionData.database.host}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">
                  Versión PostgreSQL
                </p>
                <p className="text-sm font-mono">
                  {connectionData.database.version?.split(' ')[1] || 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">
                  Timestamp Sistema
                </p>
                <p className="font-medium">
                  {new Date(connectionData.timestamp).toLocaleString('es-CO')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">
                  Timestamp Base de Datos
                </p>
                <p className="font-medium">
                  {new Date(connectionData.database.timestamp).toLocaleString('es-CO')}
                </p>
              </div>
              <div>
                <Badge className="mt-2 bg-green-600">
                  Sincronización correcta
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* LISTADO DE TABLAS */}
      {connectionData?.tables && connectionData.tables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                Tablas en la Base de Datos
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {connectionData.tables.length} tablas
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {connectionData.tables.map((table, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-600" />
                      <p className="font-mono font-medium text-sm">{table.tablename}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Tamaño: <span className="font-semibold">{table.size}</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón de Refrescar */}
      <div className="flex justify-center">
        <button
          onClick={() => refetch()}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Refrescar Conexión
        </button>
      </div>
    </div>
  )
}