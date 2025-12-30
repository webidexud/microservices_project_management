// Componente ContractProgressBar.jsx
import { useState } from 'react';

export default function ContractProgressBar({
    contract,
    modifications = [],
    currentDate = new Date()
}) {
    const startDate = new Date(contract?.CB_start_date)
    const originalEndDate = new Date(contract?.CB_end_date)

    // Calcular fecha final considerando prórrogas
    let finalEndDate = new Date(originalEndDate)
    const prorrogas = modifications.filter(m => m.BA_addition_type_id === 1)

    prorrogas.forEach(prorroga => {
        const dias = prorroga.specific_data?.EX_time_extension || 0
        finalEndDate.setDate(finalEndDate.getDate() + dias)
    })

    // Calcular progreso
    const start = startDate.getTime()
    const end = finalEndDate.getTime()
    const current = new Date(currentDate).getTime()

    const totalDuration = end - start
    const elapsed = current - start
    const percentage = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100)

    // Calcular posición del fin original relativa a la nueva duración
    const originalEndPosition = ((originalEndDate.getTime() - start) / totalDuration) * 100

    // Hitos (adiciones importantes)
    const hitos = modifications
        .filter(m => [1, 2, 8, 9].includes(m.BA_addition_type_id))
        .map(mod => {
            const fecha = new Date(mod.BA_start_date_addition)
            const posicion = ((fecha.getTime() - start) / totalDuration) * 100
            return {
                ...mod,
                position: Math.min(Math.max(posicion, 0), 100),
                fechaFormateada: fecha.toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                })
            }
        })

    // Estado para tooltip
    const [tooltip, setTooltip] = useState({
        visible: false,
        content: '',
        x: 0,
        y: 0
    })

    const showTooltip = (content, event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setTooltip({
            visible: true,
            content,
            x: rect.left + rect.width / 2,
            y: rect.top - 45
        })
    }

    const hideTooltip = () => {
        setTooltip(prev => ({ ...prev, visible: false }))
    }

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-white">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold">Progreso del Contrato</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${percentage >= 100 ? 'bg-green-100 text-green-800' :
                    percentage <= 0 ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                    {percentage >= 100 ? 'Finalizado' :
                        percentage <= 0 ? 'No iniciado' :
                            'En curso'}
                </span>
            </div>

            {/* Barra principal */}
            <div className="relative pt-2">
                {/* Línea de tiempo */}
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden relative">
                    <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />

                    {/* Marcador de Fin Original */}
                    {originalEndPosition > 0 && originalEndPosition < 100 && (
                        <div
                            className="absolute top-0 transform -translate-x-1/2"
                            style={{ left: `${originalEndPosition}%` }}
                            onMouseEnter={(e) => showTooltip(
                                `Fin Original: ${originalEndDate.toLocaleDateString()}`,
                                e
                            )}
                            onMouseLeave={hideTooltip}
                        >
                            <div className="w-3 h-3 border-2 border-red-500 bg-white rounded-full relative">
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                                    <div className="text-xs text-red-600 font-medium whitespace-nowrap">
                                        Fin Original
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Hitos */}
                {hitos.map((hito, index) => (
                    <div
                        key={index}
                        className="absolute top-0 transform -translate-x-1/2"
                        style={{ left: `${hito.position}%` }}
                        onMouseEnter={(e) => showTooltip(
                            `${hito.BA_addition_type_name}: ${hito.fechaFormateada}`,
                            e
                        )}
                        onMouseLeave={hideTooltip}
                    >
                        <div className="w-4 h-4 bg-white border-2 border-blue-500 rounded-full relative cursor-help">
                            {/* Tooltip aparece abajo */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 pointer-events-none">
                                <div className="px-2 py-1 bg-gray-800 text-white rounded text-xs whitespace-nowrap">
                                    {hito.BA_addition_type_name}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Fechas importantes */}
                <div className="flex justify-between text-xs text-gray-500 mt-6">
                    <div className="text-center">
                        <div className="font-medium">Inicio</div>
                        <div>{startDate.toLocaleDateString()}</div>
                    </div>

                    {/* Fin Original - posición relativa si está dentro del rango visible */}
                    {originalEndPosition > 0 && originalEndPosition < 100 ? (
                        <div
                            className="text-center absolute transform -translate-x-1/2"
                            style={{ left: `${originalEndPosition}%`, top: '24px' }}
                        >
                            <div className="font-medium text-red-600">Fin Original</div>
                            <div>{originalEndDate.toLocaleDateString()}</div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="font-medium">Fin Original</div>
                            <div>{originalEndDate.toLocaleDateString()}</div>
                        </div>
                    )}

                    <div className="text-center">
                        <div className="font-medium">Fin Actual</div>
                        <div>{finalEndDate.toLocaleDateString()}</div>
                    </div>
                </div>
            </div>

            {/* Tooltip flotante */}
            {tooltip.visible && (
                <div
                    className="fixed z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg pointer-events-none"
                    style={{
                        left: `${tooltip.x}px`,
                        top: `${tooltip.y}px`,
                        transform: 'translateX(-50%)'
                    }}
                >
                    {tooltip.content}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                        <div className="w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                </div>
            )}

            {/* Estadísticas */}
            <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{Math.round(percentage)}%</div>
                    <div className="text-xs text-gray-600">Progreso</div>
                </div>
                <div className="p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">{prorrogas.length}</div>
                    <div className="text-xs text-gray-600">Prórrogas</div>
                </div>
                <div className="p-2 bg-purple-50 rounded">
                    <div className="text-lg font-bold text-purple-600">{hitos.length}</div>
                    <div className="text-xs text-gray-600">Eventos</div>
                </div>
                <div className="p-2 bg-orange-50 rounded">
                    <div className="text-lg font-bold text-orange-600">
                        {Math.ceil((finalEndDate - current) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-xs text-gray-600">Días restantes</div>
                </div>
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-red-500 rounded-full" />
                    <span>Fin Original</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-blue-500 rounded-full" />
                    <span>Evento/Adición</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span>Progreso Actual</span>
                </div>
            </div>
        </div>
    )
}