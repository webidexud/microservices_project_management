import { useState, useRef, useEffect } from "react"
import { ChevronDown, Search, X } from "lucide-react"

/**
 * SearchableSelect - Dropdown con búsqueda integrada
 * 
 * @param {string} name - Nombre del campo
 * @param {string} value - Valor seleccionado
 * @param {function} onChange - Callback cuando cambia el valor
 * @param {array} options - Array de opciones [{id, name}]
 * @param {string} placeholder - Texto del placeholder
 * @param {boolean} required - Si el campo es obligatorio
 * @param {boolean} disabled - Si el campo está deshabilitado
 */
export default function SearchableSelect({
  name,
  value,
  onChange,
  options = [],
  placeholder = "Seleccione...",
  required = false,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Enfocar el input de búsqueda cuando se abre
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Filtrar opciones por búsqueda
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Obtener el texto de la opción seleccionada
  const selectedOption = options.find((opt) => opt.id == value)
  const displayText = selectedOption ? selectedOption.name : placeholder

  const handleSelect = (optionId) => {
    // Simular evento de cambio para mantener compatibilidad
    const syntheticEvent = {
      target: {
        name: name,
        value: optionId,
      },
    }
    onChange(syntheticEvent)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleClear = (e) => {
    e.stopPropagation()
    const syntheticEvent = {
      target: {
        name: name,
        value: "",
      },
    }
    onChange(syntheticEvent)
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Campo oculto para formularios */}
      <input type="hidden" name={name} value={value} required={required} />

      {/* Botón principal del dropdown */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left bg-white dark:bg-neutral-800 
          border border-neutral-300 dark:border-neutral-600 rounded-lg
          flex items-center justify-between gap-2
          transition-all duration-200
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary cursor-pointer"}
          ${isOpen ? "border-primary ring-2 ring-primary/20" : ""}
          ${!value && !disabled ? "text-neutral-400" : "text-neutral-900 dark:text-neutral-100"}
        `}
      >
        <span className="truncate">{displayText}</span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <X
              className="h-4 w-4 text-neutral-400 hover:text-danger transition-colors"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
          <div className="fixed z-[9999] mt-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-xl overflow-hidden"
              style={{
                top: dropdownRef.current?.getBoundingClientRect().bottom + 'px',
                left: dropdownRef.current?.getBoundingClientRect().left + 'px',
                width: dropdownRef.current?.getBoundingClientRect().width + 'px'
              }}>
        {/* Barra de búsqueda */}
          <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Lista de opciones */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className={`
                    w-full px-4 py-2.5 text-left text-sm
                    transition-colors duration-150
                    ${
                      option.id == value
                        ? "bg-primary text-white font-medium"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                    }
                  `}
                >
                  {option.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-neutral-400">
                {searchTerm ? "No se encontraron resultados" : "No hay opciones disponibles"}
              </div>
            )}
          </div>

          {/* Contador de resultados */}
          {searchTerm && filteredOptions.length > 0 && (
            <div className="px-4 py-2 text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
              {filteredOptions.length} resultado{filteredOptions.length !== 1 ? "s" : ""} encontrado{filteredOptions.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  )
}