// ============================================================================
// COMPONENTE: InfoTooltip
// Ubicación: frontend/src/components/InfoTooltip.jsx
// ============================================================================

import { useState } from "react"
import { Info } from "lucide-react"

export default function InfoTooltip({ title, description, example }) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const tooltipHeight = 200 // altura aproximada del tooltip
    const viewportHeight = window.innerHeight

    // Calcular posición automática
    let top = rect.bottom + 8 // Por defecto abajo
    
    // Si no cabe abajo, mostrar arriba
    if (rect.bottom + tooltipHeight > viewportHeight) {
      top = rect.top - tooltipHeight - 8
    }

    setPosition({
      top: top,
      left: rect.left - 150 // Centrar aproximadamente
    })
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  return (
    <>
      {/* Icono Info */}
      <div
        className="inline-flex items-center justify-center w-4 h-4 ml-1.5 cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Info className="w-4 h-4 text-blue-500 hover:text-blue-600 transition-colors" />
      </div>

      {/* Tooltip */}
      {isVisible && (
        <div
          className="fixed z-[9999] w-80 pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className="bg-blue-900 text-white rounded-lg shadow-2xl p-4 border-2 border-blue-700">
            {/* Título */}
            {title && (
              <div className="font-semibold text-sm mb-2 text-blue-100 border-b border-blue-700 pb-2">
                {title}
              </div>
            )}

            {/* Descripción */}
            <div className="text-sm leading-relaxed mb-3 text-blue-50">
              {description}
            </div>

            {/* Ejemplo */}
            {example && (
              <div className="bg-blue-800 rounded px-3 py-2 text-xs border border-blue-600">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-300 font-medium">💡 Ejemplo:</span>
                  <span className="text-blue-100">{example}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}