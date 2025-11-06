import { useState, useEffect } from "react"
import { Search, X, Star, Info, Loader2, Filter, ChevronDown, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { rupCodesApi } from "@/lib/api"

export default function RupCodeSelector({ 
  selectedRupCodes = [], 
  onSelectionChange 
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  
  // Filtros jerárquicos
  const [showFilters, setShowFilters] = useState(false)
  const [segments, setSegments] = useState([])
  const [families, setFamilies] = useState([])
  const [classes, setClasses] = useState([])
  
  const [selectedSegment, setSelectedSegment] = useState("")
  const [selectedFamily, setSelectedFamily] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  
  const [loadingSegments, setLoadingSegments] = useState(false)
  const [loadingFamilies, setLoadingFamilies] = useState(false)
  const [loadingClasses, setLoadingClasses] = useState(false)

  // Cargar segmentos al montar
  useEffect(() => {
    loadSegments()
  }, [])

  // Cargar familias cuando cambia el segmento
  useEffect(() => {
    if (selectedSegment) {
      loadFamilies(selectedSegment)
      setSelectedFamily("")
      setSelectedClass("")
      setFamilies([])
      setClasses([])
    }
  }, [selectedSegment])

  // Cargar clases cuando cambia la familia
  useEffect(() => {
    if (selectedFamily) {
      loadClasses(selectedFamily)
      setSelectedClass("")
      setClasses([])
    }
  }, [selectedFamily])

  // Búsqueda con debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 2 || selectedSegment || selectedFamily || selectedClass) {
        performSearch()
      } else if (searchTerm.length === 0 && !selectedSegment && !selectedFamily && !selectedClass) {
        setSearchResults([])
        setHasSearched(false)
      }
    }, 400)

    return () => clearTimeout(delayDebounce)
  }, [searchTerm, selectedSegment, selectedFamily, selectedClass])

  const loadSegments = async () => {
    setLoadingSegments(true)
    try {
      const data = await rupCodesApi.getSegments()
      setSegments(data || [])
    } catch (error) {
      console.error('Error al cargar segmentos:', error)
    } finally {
      setLoadingSegments(false)
    }
  }

  const loadFamilies = async (segmentCode) => {
    setLoadingFamilies(true)
    try {
      const data = await rupCodesApi.getFamilies(segmentCode)
      setFamilies(data || [])
    } catch (error) {
      console.error('Error al cargar familias:', error)
    } finally {
      setLoadingFamilies(false)
    }
  }

  const loadClasses = async (familyCode) => {
    setLoadingClasses(true)
    try {
      const data = await rupCodesApi.getClasses(familyCode)
      setClasses(data || [])
    } catch (error) {
      console.error('Error al cargar clases:', error)
    } finally {
      setLoadingClasses(false)
    }
  }

const performSearch = async () => {
  setIsSearching(true)
  setHasSearched(true)
  try {
    const filters = {}
    // Solo agregar filtros si tienen valor real (no vacío ni espacios)
    if (selectedSegment && selectedSegment.trim() !== '') {
      filters.segment = selectedSegment.trim()
    }
    if (selectedFamily && selectedFamily.trim() !== '') {
      filters.family = selectedFamily.trim()
    }
    if (selectedClass && selectedClass.trim() !== '') {
      filters.class_code = selectedClass.trim()
    }

    console.log('🔍 Buscando con:', { searchTerm, filters })
    
    const data = await rupCodesApi.search(searchTerm, filters, 50, 0)
    
    console.log('📊 Resultados:', data)
    
    setSearchResults(data.results || [])
  } catch (error) {
    console.error('❌ Error al buscar códigos RUP:', error)
    setSearchResults([])
  } finally {
    setIsSearching(false)
  }
}

  const clearFilters = () => {
    setSelectedSegment("")
    setSelectedFamily("")
    setSelectedClass("")
    setFamilies([])
    setClasses([])
    setSearchTerm("")
  }

  const isSelected = (rupCodeId) => {
    return selectedRupCodes.some((selected) => selected.rup_code_id === rupCodeId)
  }

  const handleAdd = (code) => {
    if (isSelected(code.id)) return

    const newCode = {
      rup_code_id: code.id,
      code: code.code,
      description: code.description,
      segment_name: code.segment_name,
      family_name: code.family_name,
      class_name: code.class_name,
      is_main_code: selectedRupCodes.length === 0,
      participation_percentage: null,
      observations: "",
    }

    onSelectionChange([...selectedRupCodes, newCode])
  }

  const handleRemove = (rupCodeId) => {
    const updatedCodes = selectedRupCodes.filter(
      (code) => code.rup_code_id !== rupCodeId
    )

    if (updatedCodes.length > 0) {
      const hasMainCode = updatedCodes.some((code) => code.is_main_code)
      if (!hasMainCode) {
        updatedCodes[0].is_main_code = true
      }
    }

    onSelectionChange(updatedCodes)
  }

  const handleToggleMain = (rupCodeId) => {
    const updatedCodes = selectedRupCodes.map((code) => ({
      ...code,
      is_main_code: code.rup_code_id === rupCodeId,
    }))
    onSelectionChange(updatedCodes)
  }

  const handlePercentageChange = (rupCodeId, value) => {
    const updatedCodes = selectedRupCodes.map((code) =>
      code.rup_code_id === rupCodeId
        ? { ...code, participation_percentage: value ? parseFloat(value) : null }
        : code
    )
    onSelectionChange(updatedCodes)
  }

  const handleObservationsChange = (rupCodeId, value) => {
    const updatedCodes = selectedRupCodes.map((code) =>
      code.rup_code_id === rupCodeId ? { ...code, observations: value } : code
    )
    onSelectionChange(updatedCodes)
  }

  const hasActiveFilters = selectedSegment || selectedFamily || selectedClass

  return (
    <div className="space-y-4">
      {/* Códigos seleccionados */}
      {selectedRupCodes.length > 0 && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Códigos RUP Seleccionados ({selectedRupCodes.length})
            </h3>
            <div className="space-y-3">
              {selectedRupCodes.map((code) => (
                <div
                  key={code.rup_code_id}
                  className="p-3 bg-background rounded-lg border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {code.code}
                        </Badge>
                        {code.is_main_code && (
                          <Badge className="bg-yellow-500 text-yellow-950">
                            <Star className="h-3 w-3 mr-1" />
                            Principal
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-text-primary mb-1">
                        {code.description}
                      </p>
                      <div className="flex flex-wrap gap-1 text-xs text-text-secondary">
                        {code.segment_name && (
                          <Badge variant="outline" className="text-xs">
                            📊 {code.segment_name}
                          </Badge>
                        )}
                        {code.family_name && (
                          <Badge variant="outline" className="text-xs">
                            📁 {code.family_name}
                          </Badge>
                        )}
                        {code.class_name && (
                          <Badge variant="outline" className="text-xs">
                            📂 {code.class_name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      {!code.is_main_code && selectedRupCodes.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleMain(code.rup_code_id)}
                          className="h-8 w-8 p-0"
                          title="Marcar como principal"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(code.rup_code_id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t">
                    <div>
                      <label className="text-xs text-text-secondary block mb-1">
                        % Participación (opcional)
                      </label>
                      <div className="flex items-center gap-2">
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
                          className="text-sm"
                        />
                        <span className="text-sm text-text-secondary">%</span>
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Buscador con filtros jerárquicos */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar Códigos RUP (UNSPSC)
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {showFilters ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  {[selectedSegment, selectedFamily, selectedClass].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Búsqueda de texto */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, descripción o palabras clave..."
              className="pl-10"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-text-secondary" />
            )}
          </div>

          {/* Filtros jerárquicos */}
          {showFilters && (
            <div className="space-y-3 p-3 bg-background rounded-lg border">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-text-secondary">
                  Filtrado jerárquico UNSPSC
                </p>
                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 text-xs"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Segmento */}
                <div>
                  <label className="text-xs text-text-secondary block mb-1">
                    📊 Segmento
                  </label>
                  <Select 
                    value={selectedSegment} 
                    onChange={(e) => setSelectedSegment(e.target.value)}
                    disabled={loadingSegments}
                    className="text-sm"
                  >
                    <option value="">
                      {loadingSegments ? "Cargando..." : "Todos los segmentos"}
                    </option>
                    {segments.map((seg) => (
                      <option key={seg.code} value={seg.code}>
                        {seg.code} - {seg.name}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Familia */}
                <div>
                  <label className="text-xs text-text-secondary block mb-1">
                    📁 Familia
                  </label>
                  <Select 
                    value={selectedFamily} 
                    onChange={(e) => setSelectedFamily(e.target.value)}
                    disabled={!selectedSegment || loadingFamilies}
                    className="text-sm"
                  >
                    <option value="">
                      {!selectedSegment 
                        ? "Selecciona un segmento" 
                        : loadingFamilies 
                        ? "Cargando..." 
                        : "Todas las familias"}
                    </option>
                    {families.map((fam) => (
                      <option key={fam.code} value={fam.code}>
                        {fam.code} - {fam.name}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Clase */}
                <div>
                  <label className="text-xs text-text-secondary block mb-1">
                    📂 Clase
                  </label>
                  <Select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    disabled={!selectedFamily || loadingClasses}
                    className="text-sm"
                  >
                    <option value="">
                      {!selectedFamily 
                        ? "Selecciona una familia" 
                        : loadingClasses 
                        ? "Cargando..." 
                        : "Todas las clases"}
                    </option>
                    {classes.map((cls) => (
                      <option key={cls.code} value={cls.code}>
                        {cls.code} - {cls.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-text-secondary flex items-center gap-1">
            <Info className="h-3 w-3" />
            {hasActiveFilters 
              ? "Filtrando por clasificación UNSPSC. Escribe para refinar más." 
              : "Escribe al menos 2 caracteres o usa los filtros para buscar códigos RUP"}
          </p>

          {/* Resultados de búsqueda */}
          <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-2">
            {!hasSearched && searchTerm.length < 2 && !hasActiveFilters && (
              <p className="text-sm text-text-secondary text-center py-6">
                💡 Usa la búsqueda o los filtros jerárquicos para encontrar códigos RUP
              </p>
            )}

            {isSearching && (
              <p className="text-sm text-text-secondary text-center py-6 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando códigos RUP...
              </p>
            )}

            {hasSearched && !isSearching && searchResults.length === 0 && (
              <p className="text-sm text-text-secondary text-center py-6">
                No se encontraron códigos RUP con los criterios seleccionados
              </p>
            )}

            {!isSearching && searchResults.length > 0 && (
              <p className="text-xs text-text-secondary px-2 py-1 bg-background rounded">
                {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
              </p>
            )}

            {searchResults.map((code) => {
              const selected = isSelected(code.id)
              return (
                <div
                  key={code.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    selected
                      ? "bg-primary/10 border-primary/50 opacity-60"
                      : "hover:bg-background/50 cursor-pointer border-border"
                  }`}
                  onClick={() => !selected && handleAdd(code)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs font-semibold">
                          {code.code}
                        </Badge>
                        {selected && (
                          <Badge className="bg-green-500 text-white text-xs">
                            ✓ Seleccionado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-text-primary mb-2">
                        {code.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {code.segment_name && (
                          <Badge variant="outline" className="text-xs">
                            📊 {code.segment_name}
                          </Badge>
                        )}
                        {code.family_name && (
                          <Badge variant="outline" className="text-xs">
                            📁 {code.family_name}
                          </Badge>
                        )}
                        {code.class_name && (
                          <Badge variant="outline" className="text-xs">
                            📂 {code.class_name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {!selected && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAdd(code)
                        }}
                        className="ml-2 shrink-0"
                      >
                        Agregar
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}