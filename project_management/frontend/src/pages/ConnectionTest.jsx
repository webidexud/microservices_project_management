import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { CheckCircle2, XCircle, Database, Server, Clock, Info } from "lucide-react"
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
    refetchInterval: 5000, // Actualizar cada 5 segundos
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Test de Conexión</h1>
        <p className="text-text-secondary mt-1">
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
            <div className="flex items-center gap-3 text-warning">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-warning"></div>
              <span className="text-lg">Verificando conexión...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 text-error">
              <XCircle className="h-8 w-8" />
              <div>
                <p className="text-lg font-semibold">Error de Conexión</p>
                <p className="text-sm text-text-secondary">{error.message}</p>
              </div>
            </div>
          )}

          {connectionData && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {connectionData.database.success ? (
                  <>
                    <CheckCircle2 className="h-8 w-8 text-success" />
                    <div>
                      <p className="text-lg font-semibold text-success">
                        Conexión Exitosa
                      </p>
                      <p className="text-sm text-text-secondary">
                        La base de datos está respondiendo correctamente
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-8 w-8 text-error" />
                    <div>
                      <p className="text-lg font-semibold text-error">
                        Conexión Fallida
                      </p>
                      <p className="text-sm text-text-secondary">
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
      {connectionData?.database.success && (
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
                <p className="text-xs text-text-secondary uppercase mb-1">
                  Base de Datos
                </p>
                <p className="font-medium">{connectionData.database.database}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase mb-1">
                  Host
                </p>
                <p className="font-medium">{connectionData.database.host}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase mb-1">
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
                <p className="text-xs text-text-secondary uppercase mb-1">
                  Timestamp Sistema
                </p>
                <p className="font-medium">
                  {new Date(connectionData.timestamp).toLocaleString('es-CO')}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase mb-1">
                  Timestamp Base de Datos
                </p>
                <p className="font-medium">
                  {new Date(connectionData.database.timestamp).toLocaleString('es-CO')}
                </p>
              </div>
              <div>
                <Badge variant="success" className="mt-2">
                  Sincronización correcta
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tablas de la Base de Datos */}
      {connectionData?.tables && connectionData.tables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Tablas en la Base de Datos ({connectionData.tables.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {connectionData.tables.map((table, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                >
                  <p className="font-medium text-sm">{table.tablename}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    Tamaño: {table.size}
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
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Refrescar Conexión
        </button>
      </div>
    </div>
  )
}