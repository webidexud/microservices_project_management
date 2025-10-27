import { useState, useEffect } from "react"
import { Search, X, Star, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

/**
 * Componente para seleccionar códigos RUP
 * @param {Array} allRupCodes - Todos los códigos RUP disponibles
 * @param {Array} selectedRupCodes - Códigos RUP ya seleccionados
 * @param {Function} onSelectionChange - Callback cuando cambia la selección
 */
export default function RupCodeSelector({ 
  allRupCodes = [], 
  selectedRupCodes = [], 
  onSelectionChange 
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCodes, setFilteredCodes] = useState([])

  // Filtrar códigos RUP
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCodes(allRupCodes)
      return
    }

    const searchLower = searchTerm.toLowerCase()
    const filtered = allRupCodes.filter((code) => {
      return (
        code.code?.toLowerCase().includes(searchLower) ||
        code.description?.toLowerCase().includes(searchLower) ||
        code.main_category?.toLowerCase().includes(searchLower) ||
        code.subcategory?.toLowerCase().includes(searchLower) ||
        code.keywords?.toLowerCase().includes(searchLower)
      )
    })
    setFilteredCodes(filtered)
  }, [searchTerm, allRupCodes])

  // Verificar si un código ya está seleccionado
  const isSelected = (rupCodeId) => {
    return selectedRupCodes.some((selected) => selected.rup_code_id === rupCodeId)
  }

  // Agregar código RUP
  const handleAdd = (code) => {
    if (isSelected(code.id)) return

    const newCode = {
      rup_code_id: code.id,
      code: code.code,
      description: code.description,
      main_category: code.main_category,
      subcategory: code.subcategory,
      is_main_code: selectedRupCodes.length === 0, // El primero es principal por defecto
      participation_percentage: null,
      observations: "",
    }

    onSelectionChange([...selectedRupCodes, newCode])
  }

  // Remover código RUP
  const handleRemove = (rupCodeId) => {
    const updatedCodes = selectedRupCodes.filter(
      (code) => code.rup_code_id !== rupCodeId
    )

    // Si se elimina el código principal y quedan otros, marcar el primero como principal
    if (updatedCodes.length > 0) {
      const hasMainCode = updatedCodes.some((code) => code.is_main_code)
      if (!hasMainCode) {
        updatedCodes[0].is_main_code = true
      }
    }

    onSelectionChange(updatedCodes)
  }

  // Marcar/desmarcar como código principal
  const handleToggleMain = (rupCodeId) => {
    const updatedCodes = selectedRupCodes.map((code) => ({
      ...code,
      is_main_code: code.rup_code_id === rupCodeId,
    }))
    onSelectionChange(updatedCodes)
  }

  // Actualizar porcentaje
  const handlePercentageChange = (rupCodeId, value) => {
    const updatedCodes = selectedRupCodes.map((code) =>
      code.rup_code_id === rupCodeId
        ? { ...code, participation_percentage: value ? parseFloat(value) : null }
        : code
    )
    onSelectionChange(updatedCodes)
  }

  // Actualizar observaciones
  const handleObservationsChange = (rupCodeId, value) => {
    const updatedCodes = selectedRupCodes.map((code) =>
      code.rup_code_id === rupCodeId ? { ...code, observations: value } : code
    )
    onSelectionChange(updatedCodes)
  }

  return (
    <div className="space-y-5">
      {/* Lista de códigos seleccionados */}
      {selectedRupCodes.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Códigos RUP Seleccionados ({selectedRupCodes.length})
              </h3>
            </div>

            {selectedRupCodes.map((code) => (
              <div
                key={code.rup_code_id}
                className="bg-white dark:bg-gray-800 p-3 rounded-lg border space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="font-mono text-xs">
                        {code.code}
                      </Badge>
                      {code.is_main_code && (
                        <Badge className="bg-warning text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Principal
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium line-clamp-2">
                      {code.description}
                    </p>
                    {code.main_category && (
                      <p className="text-xs text-text-secondary mt-1">
                        {code.main_category}
                        {code.subcategory && ` / ${code.subcategory}`}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1">
                    {!code.is_main_code && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleMain(code.rup_code_id)}
                        title="Marcar como principal"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(code.rup_code_id)}
                      title="Eliminar"
                    >
                      <X className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </div>

                {/* Porcentaje y observaciones (opcionales) */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div>
                    <label className="text-xs text-text-secondary block mb-1">
                      % Participación (opcional)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={code.participation_percentage || ""}
                        onChange={(e) =>
                          handlePercentageChange(code.rup_code_id, e.target.value)
                        }
                        placeholder="0.00"
                        className="text-sm pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-text-secondary block mb-1">
                      Observaciones (opcional)
                    </label>
                    <Input
                      value={code.observations || ""}
                      onChange={(e) =>
                        handleObservationsChange(code.rup_code_id, e.target.value)
                      }
                      placeholder="Notas adicionales..."
                      maxLength={200}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Buscador de códigos RUP */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div>
            <label className="text-sm font-medium block mb-2">
              Buscar y Agregar Códigos RUP
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código, descripción, categoría o palabras clave..."
                className="pl-10"
              />
            </div>
            <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Puedes buscar por código (ej: 80111500), descripción, categoría o
              palabras clave
            </p>
          </div>

          {/* Lista de códigos disponibles */}
          <div className="max-h-80 overflow-y-auto space-y-2 border rounded-lg p-2">
            {filteredCodes.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-4">
                {searchTerm
                  ? "No se encontraron códigos RUP con ese criterio"
                  : "Cargando códigos RUP..."}
              </p>
            ) : (
              filteredCodes.map((code) => {
                const selected = isSelected(code.id)
                return (
                  <div
                    key={code.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      selected
                        ? "bg-primary/5 border-primary/30 opacity-50"
                        : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    }`}
                    onClick={() => !selected && handleAdd(code)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-xs">
                            {code.code}
                          </Badge>
                          {selected && (
                            <Badge variant="success" className="text-xs">
                              Seleccionado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium line-clamp-2">
                          {code.description}
                        </p>
                        {code.main_category && (
                          <p className="text-xs text-text-secondary mt-1">
                            {code.main_category}
                            {code.subcategory && ` / ${code.subcategory}`}
                          </p>
                        )}
                      </div>
                      {!selected && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAdd(code)
                          }}
                        >
                          Agregar
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}